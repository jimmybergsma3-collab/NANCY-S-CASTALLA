import { randomUUID } from "node:crypto";
import { hasSupabaseAdmin } from "@/lib/env";
import { getEffectivePackageOptions } from "@/lib/product-packaging";
import { getProductsByIds } from "@/lib/product-store";
import { SupabaseRestError, supabaseAdminFetch } from "@/lib/supabase-rest";
import { evaluateProductAvailability } from "@/lib/product-availability";
import { normalizePaymentMethod } from "@/lib/payment";
import { evaluateSalesUnitSafety, isSupplierImportProduct } from "@/lib/sales-unit-safety";
import type { AdminOrderLineEditInput, BackofficeCustomer, BackofficeOrder, OrderInput, OrderLineInput, OrderStatus, PaymentStatus } from "@/types/backoffice";

export class OrderValidationError extends Error {
  constructor(message: string, public status = 400, public code = "invalid_order") { super(message); }
}

export class InventoryError extends Error {}
export class OrderEditError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }

function sanitizeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/apikey['":\s]+[A-Za-z0-9._-]+/gi, "apikey [redacted]")
    .slice(0, 1200);
}

function logOrderStep(requestId: string, step: string, details: Record<string, unknown> = {}) {
  console.info("order_flow", { requestId, step, ...details });
}

function isRecoverableRpcError(error: unknown) {
  const message = sanitizeErrorMessage(error);
  return /create_validated_order|PGRST202|PGRST301|permission denied|schema cache|Could not find the function|function .* does not exist|p_payment_method|orders.*payment_method|column .*payment_method/i.test(message);
}

function isMissingColumnError(error: unknown) {
  return error instanceof SupabaseRestError && /42703|column .* does not exist/i.test(error.message);
}

export type CartValidationCode = "available" | "product_unavailable" | "coming_soon" | "invalid_quantity" | "package_unavailable" | "insufficient_stock" | "price_basis_review";

export type ValidatedCartLine = {
  productId: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  unit: string;
  packageLabel: string;
  packageQuantity: number;
  salePriceInclVat: number;
  vatRate: number;
  lineTotalInclVat: number;
  lineTotalExVat: number;
  lineVat: number;
  stockStatus: "available" | "preorder" | "coming-soon";
  trackInventory: boolean;
  stockQuantity: number;
  available: boolean;
  code: CartValidationCode;
};

async function loadSupplierOfferSafetyRows(productIds: string[]) {
  if (!productIds.length || !hasSupabaseAdmin()) return new Map<string, { casePrice?: number; unitPrice?: number; unitsPerCase?: number; packageDescription?: string }>();
  try {
    const escaped = productIds.map((id) => `"${id.replaceAll('"', "")}"`).join(",");
    const rows = await supabaseAdminFetch<Array<{ product_id: string; case_price: number | null; unit_price: number | null; units_per_case: number | null; package_description: string | null }>>(
      `supplier_product_offers?select=product_id,case_price,unit_price,units_per_case,package_description&product_id=in.(${encodeURIComponent(escaped)})&active=eq.true&limit=500`,
    );
    return new Map(rows.map((row) => [row.product_id, {
      casePrice: row.case_price ?? undefined,
      unitPrice: row.unit_price ?? undefined,
      unitsPerCase: row.units_per_case ?? undefined,
      packageDescription: row.package_description ?? undefined,
    }]));
  } catch (error) {
    console.warn("supplier_offer_safety_rows_unavailable", { message: sanitizeErrorMessage(error) });
    return new Map<string, { casePrice?: number; unitPrice?: number; unitsPerCase?: number; packageDescription?: string }>();
  }
}

export async function validateCartLines(lines: OrderLineInput[]): Promise<ValidatedCartLine[]> {
  if (lines.length > 100) throw new OrderValidationError("Too many order lines.", 400, "invalid_order");
  const products = await getProductsByIds(Array.from(new Set(lines.map((line) => line.productId))));
  const offerSafetyRows = await loadSupplierOfferSafetyRows(products.filter(isSupplierImportProduct).map((product) => product.id));
  const productMap = new Map(products.map((product) => [product.id, product]));
  return lines.map((requested) => {
    const product = productMap.get(requested.productId);
    const quantityValid = Number.isInteger(requested.quantity) && requested.quantity >= 1 && requested.quantity <= 99;
    if (!product || product.isVisible === false) {
      return {
        productId: requested.productId, name: requested.name || requested.productId, quantity: requested.quantity,
        unit: requested.packageLabel || requested.unit || "", packageLabel: requested.packageLabel || requested.unit || "",
        packageQuantity: Number(requested.packageQuantity ?? 1), salePriceInclVat: 0, vatRate: 0,
        lineTotalInclVat: 0, lineTotalExVat: 0, lineVat: 0, stockStatus: "coming-soon" as const,
        trackInventory: false, stockQuantity: 0, available: false, code: "product_unavailable" as const,
      };
    }
    const options = getEffectivePackageOptions(product);
    const selected = options.length > 0
      ? options.find((option) => option.label === requested.packageLabel && option.quantity === Number(requested.packageQuantity ?? 1)) ?? (requested.packageLabel ? undefined : options[0])
      : undefined;
    const selectedLabel = options.length > 0 ? selected?.label ?? product.unit : product.unit;
    const selectedQuantity = options.length > 0 ? selected?.quantity ?? 1 : 1;
    const selectedPrice = options.length > 0 ? selected?.salePriceInclVat ?? product.salePriceInclVat : product.salePriceInclVat;
    const stockUnits = requested.quantity * selectedQuantity;
    let code: CartValidationCode = "available";
    const salesUnitSafety = evaluateSalesUnitSafety(product, offerSafetyRows.get(product.id));
    if (!quantityValid) code = "invalid_quantity";
    else if (!selected && options.length > 0) code = "package_unavailable";
    else if (!salesUnitSafety.ok) code = "price_basis_review";
    else code = evaluateProductAvailability({ stockStatus: product.stockStatus, trackInventory: Boolean(product.trackInventory), stockQuantity: Number(product.stockQuantity ?? 0), requestedUnits: stockUnits });
    const lineTotal = roundMoney(requested.quantity * selectedPrice);
    const lineExVat = roundMoney(lineTotal / (1 + product.vatRate / 100));
    return {
      productId: product.id, name: product.name, imageUrl: product.imageUrl, quantity: requested.quantity,
      unit: selectedLabel, packageLabel: selectedLabel, packageQuantity: selectedQuantity,
      salePriceInclVat: selectedPrice, vatRate: product.vatRate,
      lineTotalInclVat: lineTotal, lineTotalExVat: lineExVat, lineVat: roundMoney(lineTotal - lineExVat),
      stockStatus: product.stockStatus, trackInventory: Boolean(product.trackInventory),
      stockQuantity: Number(product.stockQuantity ?? 0), available: code === "available", code,
    };
  });
}

export async function createOrder(input: OrderInput) {
  const requestId = randomUUID();
  logOrderStep(requestId, "start", {
    lineCount: input.lines?.length ?? 0,
    fulfillment: input.fulfillment ?? "Collection",
    paymentMethod: normalizePaymentMethod(input.paymentMethod),
    hasAuthUser: Boolean(input.authUserId),
  });
  if (!hasSupabaseAdmin()) throw new OrderValidationError("Ordering is temporarily unavailable.", 503, "service_unavailable");
  if (!input.idempotencyKey || !/^[a-zA-Z0-9-]{16,80}$/.test(input.idempotencyKey)) throw new OrderValidationError("Invalid order request.", 400, "invalid_order");
  const cartLines = await validateCartLines(input.lines);
  logOrderStep(requestId, "cart_validated", { invalidLines: cartLines.filter((line) => !line.available).length });
  const invalidLine = cartLines.find((line) => !line.available);
  if (invalidLine) {
    const messages: Record<CartValidationCode, string> = {
      available: "Available.", product_unavailable: "One of the selected products is no longer available.",
      coming_soon: `${invalidLine.name} cannot be ordered yet.`, invalid_quantity: `Invalid quantity for ${invalidLine.name}.`,
      package_unavailable: `The selected package for ${invalidLine.name} is no longer available.`,
      insufficient_stock: `Insufficient stock for ${invalidLine.name}.`,
      price_basis_review: `${invalidLine.name} is temporarily unavailable while package and price are checked.`,
    };
    throw new OrderValidationError(messages[invalidLine.code], invalidLine.code === "invalid_quantity" ? 400 : 409, invalidLine.code);
  }
  const validatedLines = cartLines.map((line) => ({
    productId: line.productId, name: line.name, quantity: line.quantity, unit: line.unit,
    packageLabel: line.packageLabel, packageQuantity: line.packageQuantity,
    salePriceInclVat: line.salePriceInclVat, vatRate: line.vatRate,
    lineTotalInclVat: line.lineTotalInclVat, lineTotalExVat: line.lineTotalExVat, lineVat: line.lineVat,
  }));
  const subtotalExVat = roundMoney(validatedLines.reduce((sum, line) => sum + line.lineTotalExVat, 0));
  const vatTotal = roundMoney(validatedLines.reduce((sum, line) => sum + line.lineVat, 0));
  const total = roundMoney(validatedLines.reduce((sum, line) => sum + line.lineTotalInclVat, 0));
  logOrderStep(requestId, "totals_calculated", { subtotalExVat, vatTotal, total });
  const rpcBody = {
    p_order_id: `NC-${randomUUID()}`, p_idempotency_key: input.idempotencyKey,
    p_auth_user_id: input.authUserId ?? null, p_customer_name: input.customerName,
    p_customer_email: input.customerEmail.toLowerCase().trim(), p_customer_phone: input.customerPhone ?? "",
    p_fulfillment: input.fulfillment ?? "Collection", p_notes: input.notes ?? "",
    p_subtotal_ex_vat: subtotalExVat, p_vat_total: vatTotal, p_total: total, p_lines: validatedLines,
    p_payment_method: normalizePaymentMethod(input.paymentMethod),
  };
  let result: Array<{ order_id: string; order_number: number; already_existed: boolean }>;
  try {
    logOrderStep(requestId, "rpc_attempt", { withPaymentMethod: true });
    result = await supabaseAdminFetch<Array<{ order_id: string; order_number: number; already_existed: boolean }>>("rpc/create_validated_order", {
      method: "POST",
      body: rpcBody,
    });
    logOrderStep(requestId, "rpc_success", { alreadyExisted: Boolean(result[0]?.already_existed) });
  } catch (error) {
    const message = sanitizeErrorMessage(error);
    logOrderStep(requestId, "rpc_failed", { message, status: error instanceof SupabaseRestError ? error.status : undefined });
    const paymentMethodSchemaMismatch = /p_payment_method|PGRST202|schema cache|Could not find the function/i.test(message);
    if (!paymentMethodSchemaMismatch) {
      if (isRecoverableRpcError(error)) {
        logOrderStep(requestId, "direct_fallback_attempt", { reason: "recoverable_rpc_error" });
        const saved = await createOrderDirect(input, validatedLines, { subtotalExVat, vatTotal, total, requestId });
        logOrderStep(requestId, "direct_fallback_success", { orderNumber: saved.order_number });
        return { orderId: saved.order_id, orderNumber: saved.order_number, alreadyExisted: saved.already_existed, stored: true, total, subtotalExVat, vatTotal, lines: validatedLines };
      }
      throw new OrderValidationError(message || "Order could not be stored.", 503, "order_failed");
    }
    const legacyRpcBody: Record<string, unknown> = { ...rpcBody };
    delete legacyRpcBody.p_payment_method;
    console.warn("Retrying order creation without payment_method because Supabase RPC schema is not refreshed yet.", { requestId, error: message });
    try {
      logOrderStep(requestId, "legacy_rpc_attempt", { withPaymentMethod: false });
      result = await supabaseAdminFetch<Array<{ order_id: string; order_number: number; already_existed: boolean }>>("rpc/create_validated_order", {
        method: "POST",
        body: legacyRpcBody,
      });
      logOrderStep(requestId, "legacy_rpc_success", { alreadyExisted: Boolean(result[0]?.already_existed) });
    } catch (legacyError) {
      logOrderStep(requestId, "legacy_rpc_failed", { message: sanitizeErrorMessage(legacyError), status: legacyError instanceof SupabaseRestError ? legacyError.status : undefined });
      logOrderStep(requestId, "direct_fallback_attempt", { reason: "legacy_rpc_failed" });
      const saved = await createOrderDirect(input, validatedLines, { subtotalExVat, vatTotal, total, requestId });
      logOrderStep(requestId, "direct_fallback_success", { orderNumber: saved.order_number });
      return { orderId: saved.order_id, orderNumber: saved.order_number, alreadyExisted: saved.already_existed, stored: true, total, subtotalExVat, vatTotal, lines: validatedLines };
    }
  }
  const saved = result[0];
  if (!saved) throw new Error("Order could not be stored.");
  return { orderId: saved.order_id, orderNumber: saved.order_number, alreadyExisted: saved.already_existed, stored: true, total, subtotalExVat, vatTotal, lines: validatedLines };
}

async function createOrderDirect(
  input: OrderInput,
  validatedLines: Array<{
    productId: string; name: string; quantity: number; unit: string; packageLabel: string; packageQuantity: number;
    salePriceInclVat: number; vatRate: number; lineTotalInclVat: number; lineTotalExVat: number; lineVat: number;
  }>,
  totals: { subtotalExVat: number; vatTotal: number; total: number; requestId: string },
) {
  const existing = await supabaseAdminFetch<Array<{ id: string; order_number: number }>>(
    `orders?select=id,order_number&idempotency_key=eq.${encodeURIComponent(input.idempotencyKey ?? "")}&limit=1`,
  );
  if (existing[0]) return { order_id: existing[0].id, order_number: existing[0].order_number, already_existed: true };

  const email = input.customerEmail.toLowerCase().trim();
  const existingCustomers = await supabaseAdminFetch<Array<{ id: string; auth_user_id?: string | null; phone?: string | null }>>(
    `customers?select=id,auth_user_id,phone&email=eq.${encodeURIComponent(email)}&limit=1`,
  );
  let customerId = existingCustomers[0]?.id;
  if (customerId) {
    const patch: Record<string, unknown> = { name: input.customerName, updated_at: new Date().toISOString() };
    if (input.customerPhone) patch.phone = input.customerPhone;
    if (input.authUserId && !existingCustomers[0].auth_user_id) patch.auth_user_id = input.authUserId;
    await supabaseAdminFetch(`customers?id=eq.${encodeURIComponent(customerId)}`, { method: "PATCH", body: patch });
  } else {
    const createdCustomers = await supabaseAdminFetch<Array<{ id: string }>>("customers", {
      method: "POST",
      body: { auth_user_id: input.authUserId ?? null, name: input.customerName, email, phone: input.customerPhone ?? "" },
    });
    customerId = createdCustomers[0]?.id;
  }
  if (!customerId) throw new OrderValidationError("Customer could not be stored before creating the order.", 503, "order_failed");

  const orderId = `NC-${randomUUID()}`;
  const baseOrder = {
    id: orderId,
    idempotency_key: input.idempotencyKey,
    customer_id: customerId,
    customer_name: input.customerName,
    customer_email: email,
    customer_phone: input.customerPhone ?? "",
    fulfillment: input.fulfillment ?? "Collection",
    delivery_method: input.fulfillment ?? "Collection",
    notes: input.notes ?? "",
    subtotal_ex_vat: totals.subtotalExVat,
    vat_total: totals.vatTotal,
    total: totals.total,
    status: "new",
    payment_status: "pending",
    payment_method: normalizePaymentMethod(input.paymentMethod),
  };

  let createdOrder: Array<{ id: string; order_number: number }>;
  try {
    createdOrder = await supabaseAdminFetch<Array<{ id: string; order_number: number }>>("orders", { method: "POST", body: baseOrder });
  } catch (error) {
    const message = sanitizeErrorMessage(error);
    if (!/payment_method|column/i.test(message)) throw error;
    const legacyOrder: Record<string, unknown> = { ...baseOrder };
    delete legacyOrder.payment_method;
    logOrderStep(totals.requestId, "direct_order_retry_without_payment_method");
    createdOrder = await supabaseAdminFetch<Array<{ id: string; order_number: number }>>("orders", { method: "POST", body: legacyOrder });
  }

  try {
    await supabaseAdminFetch("order_items", {
      method: "POST",
      body: validatedLines.map((line) => ({
        order_id: orderId,
        product_id: line.productId,
        product_name: line.name,
        quantity: line.quantity,
        unit: line.unit,
        package_label: line.packageLabel,
        package_quantity: line.packageQuantity,
        sale_price_incl_vat: line.salePriceInclVat,
        vat_rate: line.vatRate,
        line_total_incl_vat: line.lineTotalInclVat,
        line_total_ex_vat: line.lineTotalExVat,
      })),
    });
  } catch (error) {
    await supabaseAdminFetch(`orders?id=eq.${encodeURIComponent(orderId)}`, { method: "DELETE" }).catch(() => undefined);
    throw error;
  }

  return { order_id: orderId, order_number: createdOrder[0]?.order_number ?? 0, already_existed: false };
}

async function enrichOrdersWithCustomers(orders: BackofficeOrder[]) {
  const customerIds = Array.from(new Set(orders.map((order) => order.customer_id).filter((id): id is string => Boolean(id))));
  if (customerIds.length === 0) return orders;
  let customers: BackofficeCustomer[];
  try {
    customers = await supabaseAdminFetch<BackofficeCustomer[]>(
      `customers?select=id,name,email,phone,address,language,auth_user_id,created_at,archived_at,is_test,test_reason&id=in.(${customerIds.map(encodeURIComponent).join(",")})`,
    );
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    customers = await supabaseAdminFetch<BackofficeCustomer[]>(
      `customers?select=id,name,email,phone,address,language,auth_user_id,created_at&id=in.(${customerIds.map(encodeURIComponent).join(",")})`,
    );
  }
  const customerMap = new Map(customers.map((customer) => [customer.id, { ...customer, archived_at: customer.archived_at ?? null, is_test: Boolean(customer.is_test), test_reason: customer.test_reason ?? "" }]));
  return orders.map((order) => ({ ...order, order_items: order.order_items ?? [], customer: order.customer_id ? customerMap.get(order.customer_id) : undefined }));
}

export async function listOrders() {
  if (!hasSupabaseAdmin()) return [];
  try {
    const orders = await supabaseAdminFetch<BackofficeOrder[]>("orders?select=*,order_items(*),invoices(id,invoice_number,invoice_series,invoice_series_year,invoice_series_number,is_test,archived_at,status,email_sent_at,voided_at,voided_by,void_reason,issued_at,created_at)&order=created_at.desc&limit=500");
    return enrichOrdersWithCustomers(orders);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const orders = await supabaseAdminFetch<BackofficeOrder[]>("orders?select=*,order_items(*),invoices(id,invoice_number,status,email_sent_at,voided_at,voided_by,void_reason,issued_at,created_at)&order=created_at.desc&limit=500");
    return enrichOrdersWithCustomers(orders.map((order) => ({
      ...order,
      archived_at: order.archived_at ?? "",
      is_test: Boolean(order.is_test),
      test_reason: order.test_reason ?? "",
      invoices: (order.invoices ?? []).map((invoice) => ({ ...invoice, is_test: Boolean(invoice.is_test), archived_at: invoice.archived_at ?? "" })),
    })));
  }
}

export async function updateOrder(id: string, status: OrderStatus, paymentStatus: PaymentStatus) {
  try {
    const rows = await supabaseAdminFetch<BackofficeOrder[]>("rpc/transition_order_status", { method: "POST", body: { p_order_id: id, p_status: status, p_payment_status: paymentStatus } });
    return rows[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order status could not be updated.";
    if (message.includes("INSUFFICIENT_STOCK")) throw new InventoryError(message.split("INSUFFICIENT_STOCK:").pop()?.replace(/["}]/g, "").trim() || "Insufficient stock.");
    throw error;
  }
}

export async function updateOrderNotes(id: string, notes: string) {
  const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", body: { notes: notes.trim(), updated_at: new Date().toISOString() },
  });
  return rows[0];
}

export async function replaceOrderItemsForCorrection(id: string, lines: AdminOrderLineEditInput[], reason: string, actor: string, expectedUpdatedAt?: string) {
  if (reason.trim().length < 3) throw new OrderEditError("A correction reason of at least 3 characters is required.", 400);
  if (actor.trim().length < 3) throw new OrderEditError("An admin actor is required.", 400);
  if (!expectedUpdatedAt) throw new OrderEditError("The order was opened without a revision timestamp. Refresh the order and try again.", 409);
  if (!Array.isArray(lines) || lines.length === 0) throw new OrderEditError("At least one order line is required.", 400);
  if (lines.length > 100) throw new OrderEditError("Too many order lines.", 400);

  const validated = await validateCartLines(lines.map((line) => ({
    productId: line.productId,
    name: line.productId,
    quantity: Number(line.quantity),
    unit: line.packageLabel ?? "",
    packageLabel: line.packageLabel ?? "",
    packageQuantity: Number(line.packageQuantity ?? 1),
    salePriceInclVat: 0,
  })));
  const invalid = validated.find((line) => !line.available);
  if (invalid) {
    throw new OrderEditError(`${invalid.name} cannot be used in this corrected order (${invalid.code}).`, invalid.code === "invalid_quantity" ? 400 : 409);
  }

  const subtotalExVat = roundMoney(validated.reduce((sum, line) => sum + line.lineTotalExVat, 0));
  const vatTotal = roundMoney(validated.reduce((sum, line) => sum + line.lineVat, 0));
  const total = roundMoney(validated.reduce((sum, line) => sum + line.lineTotalInclVat, 0));
  const payloadLines = validated.map((line) => ({
    productId: line.productId,
    name: line.name,
    quantity: line.quantity,
    unit: line.unit,
    packageLabel: line.packageLabel,
    packageQuantity: line.packageQuantity,
    salePriceInclVat: line.salePriceInclVat,
    vatRate: line.vatRate,
    lineTotalInclVat: line.lineTotalInclVat,
    lineTotalExVat: line.lineTotalExVat,
    lineVat: line.lineVat,
  }));

  try {
    await supabaseAdminFetch<BackofficeOrder[]>("rpc/replace_order_items_for_admin", {
      method: "POST",
      body: {
        p_order_id: id,
        p_lines: payloadLines,
        p_subtotal_ex_vat: subtotalExVat,
        p_vat_total: vatTotal,
        p_total: total,
        p_reason: reason.trim(),
        p_actor: actor.trim(),
        p_expected_updated_at: expectedUpdatedAt,
      },
    });
  } catch (error) {
    const message = sanitizeErrorMessage(error);
    if (message.includes("order_not_found")) throw new OrderEditError("Order not found.", 404);
    if (message.includes("order_locked_status")) throw new OrderEditError("This order status is locked and cannot be edited.", 409);
    if (message.includes("order_changed")) throw new OrderEditError("This order was changed by another admin. Refresh the order before saving corrections.", 409);
    if (message.includes("order_inventory_committed")) throw new OrderEditError("This order already has committed inventory. Reset the status in a controlled stock flow before editing lines.", 409);
    if (message.includes("order_payment_locked")) throw new OrderEditError("This order is marked as paid and cannot be edited.", 409);
    if (message.includes("active_invoice_exists")) throw new OrderEditError("This order has an active invoice. Void the unsent/unpaid invoice for correction before editing lines.", 409);
    if (message.includes("product_not_found")) throw new OrderEditError("One of the selected replacement products no longer exists.", 409);
    if (message.includes("product_not_active")) throw new OrderEditError("One of the selected replacement products is not active.", 409);
    if (message.includes("product_not_visible")) throw new OrderEditError("One of the selected replacement products is not visible online.", 409);
    if (message.includes("product_not_ready_for_publish")) throw new OrderEditError("One of the selected replacement products is not marked ready for publish.", 409);
    if (message.includes("product_price_required")) throw new OrderEditError("One of the selected replacement products has no valid selling price.", 409);
    if (message.includes("product_invalid_vat")) throw new OrderEditError("One of the selected replacement products has an invalid IVA rate.", 409);
    if (message.includes("product_sales_unit_unconfirmed")) throw new OrderEditError("One of the selected replacement products has no confirmed sales unit.", 409);
    if (message.includes("product_price_basis_unconfirmed")) throw new OrderEditError("One of the selected imported products has no confirmed price basis.", 409);
    if (message.includes("mismatch")) throw new OrderEditError("The corrected order totals do not match the server product calculation. Refresh and try again.", 409);
    if (message.includes("replace_order_items_for_admin") || message.includes("PGRST202") || message.includes("function")) {
      throw new OrderEditError("Order editing requires migration 202607180001_admin_order_corrections.sql in Supabase.", 503);
    }
    throw error;
  }

  return getOrderById(id);
}

export async function resetInvoiceForOrderCorrection(id: string, reason: string, actor: string) {
  if (reason.trim().length < 3) throw new OrderEditError("A correction reason of at least 3 characters is required before voiding an invoice.", 400);
  if (actor.trim().length < 3) throw new OrderEditError("An admin actor is required.", 400);
  try {
    await supabaseAdminFetch<BackofficeOrder[]>("rpc/reset_invoice_for_order_correction", {
      method: "POST",
      body: { p_order_id: id, p_reason: reason.trim(), p_actor: actor.trim() },
    });
  } catch (error) {
    const message = sanitizeErrorMessage(error);
    if (message.includes("order_not_found")) throw new OrderEditError("Order not found.", 404);
    if (message.includes("active_invoice_not_found")) throw new OrderEditError("This order has no active invoice to void for correction.", 404);
    if (message.includes("invoice_already_emailed")) throw new OrderEditError("This invoice has already been emailed and cannot be voided for correction.", 409);
    if (message.includes("invoice_locked_status")) throw new OrderEditError("This invoice status is locked and cannot be voided for correction.", 409);
    if (message.includes("order_inventory_committed")) throw new OrderEditError("This order has committed inventory and cannot be corrected.", 409);
    if (message.includes("order_payment_locked")) throw new OrderEditError("This order is marked as paid and cannot be corrected.", 409);
    if (message.includes("order_locked_status")) throw new OrderEditError("This order status is locked and cannot be corrected.", 409);
    if (message.includes("reset_invoice_for_order_correction") || message.includes("PGRST202") || message.includes("function")) {
      throw new OrderEditError("Invoice voiding requires migration 202607180001_admin_order_corrections.sql in Supabase.", 503);
    }
    throw error;
  }
  return getOrderById(id);
}

export async function voidInvoiceAndReleaseInventoryForOrderCorrection(id: string, reason: string, actor: string) {
  if (reason.trim().length < 3) throw new OrderEditError("A correction reason of at least 3 characters is required before releasing committed inventory.", 400);
  if (actor.trim().length < 3) throw new OrderEditError("An admin actor is required.", 400);
  try {
    await supabaseAdminFetch<BackofficeOrder[]>("rpc/void_invoice_and_release_inventory_for_order_correction", {
      method: "POST",
      body: { p_order_id: id, p_reason: reason.trim(), p_actor: actor.trim() },
    });
  } catch (error) {
    const message = sanitizeErrorMessage(error);
    if (message.includes("order_not_found")) throw new OrderEditError("Order not found.", 404);
    if (message.includes("active_invoice_not_found")) throw new OrderEditError("This order has no active invoice to void for correction.", 404);
    if (message.includes("invoice_already_emailed")) throw new OrderEditError("This invoice has already been emailed and cannot be voided for correction.", 409);
    if (message.includes("invoice_locked_status")) throw new OrderEditError("This invoice status is locked and cannot be voided for correction.", 409);
    if (message.includes("order_payment_locked")) throw new OrderEditError("This order is marked as paid and cannot be corrected.", 409);
    if (message.includes("order_locked_status")) throw new OrderEditError("This order status is locked and cannot be corrected.", 409);
    if (message.includes("inventory_not_committed")) throw new OrderEditError("This order has no committed inventory to release.", 409);
    if (message.includes("inventory_already_released")) throw new OrderEditError("Committed inventory for this order was already released for correction.", 409);
    if (message.includes("inventory_commit_missing_movements")) throw new OrderEditError("This order is marked inventory-committed, but has no sale movements. Use the legacy commit-flag repair action instead.", 409);
    if (message.includes("no_tracked_order_items")) throw new OrderEditError("This order has no inventory-tracked order lines to release.", 409);
    if (message.includes("inventory_commit_mismatch")) throw new OrderEditError("The committed inventory movements do not match this order's current lines. Manual review is required.", 409);
    if (message.includes("inventory_negative_after_release")) throw new OrderEditError("Inventory release would create inconsistent stock. Manual review is required.", 409);
    if (message.includes("void_invoice_and_release_inventory_for_order_correction") || message.includes("PGRST202") || message.includes("function")) {
      throw new OrderEditError("Inventory release for order correction requires migration 202607180001_admin_order_corrections.sql in Supabase.", 503);
    }
    throw error;
  }
  return getOrderById(id);
}

export async function resetInventoryCommitFlagWithoutMovement(id: string, reason: string, actor: string) {
  if (reason.trim().length < 3) throw new OrderEditError("A correction reason of at least 3 characters is required before resetting the inventory commit flag.", 400);
  if (actor.trim().length < 3) throw new OrderEditError("An admin actor is required.", 400);
  try {
    await supabaseAdminFetch<BackofficeOrder[]>("rpc/reset_inventory_commit_flag_without_movement", {
      method: "POST",
      body: { p_order_id: id, p_reason: reason.trim(), p_actor: actor.trim() },
    });
  } catch (error) {
    const message = sanitizeErrorMessage(error);
    if (message.includes("order_not_found")) throw new OrderEditError("Order not found.", 404);
    if (message.includes("active_invoice_not_found")) throw new OrderEditError("This order has no active invoice linked to the inconsistent inventory flag.", 404);
    if (message.includes("invoice_already_emailed")) throw new OrderEditError("This invoice has already been emailed and cannot be repaired through the legacy flag reset.", 409);
    if (message.includes("invoice_locked_status")) throw new OrderEditError("This invoice status is locked and cannot be repaired through the legacy flag reset.", 409);
    if (message.includes("order_payment_locked")) throw new OrderEditError("This order is marked as paid and cannot be corrected.", 409);
    if (message.includes("order_locked_status")) throw new OrderEditError("This order status is locked and cannot be corrected.", 409);
    if (message.includes("inventory_not_committed")) throw new OrderEditError("This order is no longer marked as inventory-committed.", 409);
    if (message.includes("inventory_movements_exist")) throw new OrderEditError("This order has inventory movements. Use the normal inventory release action instead.", 409);
    if (message.includes("reset_inventory_commit_flag_without_movement") || message.includes("PGRST202") || message.includes("function")) {
      throw new OrderEditError("Legacy inventory flag repair requires migration 202607180001_admin_order_corrections.sql in Supabase.", 503);
    }
    throw error;
  }
  return getOrderById(id);
}

export async function markOrderTest(id: string, isTest: boolean, reason: string) {
  try {
    const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { is_test: isTest, test_reason: isTest ? reason.slice(0, 500) : "", updated_at: new Date().toISOString() },
    });
    return rows[0];
  } catch (error) {
    if (isMissingColumnError(error)) throw new Error("Order test marking requires the admin cleanup migration. No order data was changed.");
    throw error;
  }
}

export async function archiveOrder(id: string, archived: boolean) {
  try {
    const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { archived_at: archived ? new Date().toISOString() : null, updated_at: new Date().toISOString() },
    });
    return rows[0];
  } catch (error) {
    if (isMissingColumnError(error)) throw new Error("Order archiving requires the admin cleanup migration. No order data was changed.");
    throw error;
  }
}

export async function deleteTestOrder(id: string) {
  await supabaseAdminFetch("rpc/safe_delete_test_order", { method: "POST", body: { p_order_id: id } });
}

export async function getOrderById(id: string) {
  try {
    const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?select=*,order_items(*),invoices(id,invoice_number,invoice_series,invoice_series_year,invoice_series_number,is_test,archived_at,status,email_sent_at,voided_at,voided_by,void_reason,issued_at,created_at)&id=eq.${encodeURIComponent(id)}&limit=1`);
    return (await enrichOrdersWithCustomers(rows))[0];
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?select=*,order_items(*),invoices(id,invoice_number,status,email_sent_at,voided_at,voided_by,void_reason,issued_at,created_at)&id=eq.${encodeURIComponent(id)}&limit=1`);
    return (await enrichOrdersWithCustomers(rows.map((order) => ({ ...order, invoices: (order.invoices ?? []).map((invoice) => ({ ...invoice, is_test: Boolean(invoice.is_test), archived_at: invoice.archived_at ?? "" })) }))))[0];
  }
}

export async function markOrderEmailSent(id: string, field: "admin_email_sent_at" | "customer_email_sent_at" | "status_email_sent_at") {
  await supabaseAdminFetch(`orders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { [field]: new Date().toISOString() } });
}
