import { randomUUID } from "node:crypto";
import { hasSupabaseAdmin } from "@/lib/env";
import { getEffectivePackageOptions } from "@/lib/product-packaging";
import { getProductsByIds } from "@/lib/product-store";
import { SupabaseRestError, supabaseAdminFetch } from "@/lib/supabase-rest";
import { evaluateProductAvailability } from "@/lib/product-availability";
import { normalizePaymentMethod } from "@/lib/payment";
import type { BackofficeCustomer, BackofficeOrder, OrderInput, OrderLineInput, OrderStatus, PaymentStatus } from "@/types/backoffice";

export class OrderValidationError extends Error {
  constructor(message: string, public status = 400, public code = "invalid_order") { super(message); }
}

export class InventoryError extends Error {}

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

export type CartValidationCode = "available" | "product_unavailable" | "coming_soon" | "invalid_quantity" | "package_unavailable" | "insufficient_stock";

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

export async function validateCartLines(lines: OrderLineInput[]): Promise<ValidatedCartLine[]> {
  if (lines.length > 100) throw new OrderValidationError("Too many order lines.", 400, "invalid_order");
  const products = await getProductsByIds(Array.from(new Set(lines.map((line) => line.productId))));
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
    if (!quantityValid) code = "invalid_quantity";
    else if (!selected && options.length > 0) code = "package_unavailable";
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
  const customers = await supabaseAdminFetch<BackofficeCustomer[]>(
    `customers?select=id,name,email,phone,address,language,auth_user_id,created_at,archived_at,is_test,test_reason&id=in.(${customerIds.map(encodeURIComponent).join(",")})`,
  );
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return orders.map((order) => ({ ...order, order_items: order.order_items ?? [], customer: order.customer_id ? customerMap.get(order.customer_id) : undefined }));
}

export async function listOrders() {
  if (!hasSupabaseAdmin()) return [];
  const orders = await supabaseAdminFetch<BackofficeOrder[]>("orders?select=*,order_items(*),invoices(id,invoice_number,invoice_series,invoice_series_year,invoice_series_number,is_test,archived_at,status,email_sent_at,issued_at,created_at)&order=created_at.desc&limit=500");
  return enrichOrdersWithCustomers(orders);
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

export async function markOrderTest(id: string, isTest: boolean, reason: string) {
  const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { is_test: isTest, test_reason: isTest ? reason.slice(0, 500) : "", updated_at: new Date().toISOString() },
  });
  return rows[0];
}

export async function archiveOrder(id: string, archived: boolean) {
  const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { archived_at: archived ? new Date().toISOString() : null, updated_at: new Date().toISOString() },
  });
  return rows[0];
}

export async function deleteTestOrder(id: string) {
  await supabaseAdminFetch("rpc/safe_delete_test_order", { method: "POST", body: { p_order_id: id } });
}

export async function getOrderById(id: string) {
  const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?select=*,order_items(*),invoices(id,invoice_number,invoice_series,invoice_series_year,invoice_series_number,is_test,archived_at,status,email_sent_at,issued_at,created_at)&id=eq.${encodeURIComponent(id)}&limit=1`);
  return (await enrichOrdersWithCustomers(rows))[0];
}

export async function markOrderEmailSent(id: string, field: "admin_email_sent_at" | "customer_email_sent_at" | "status_email_sent_at") {
  await supabaseAdminFetch(`orders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { [field]: new Date().toISOString() } });
}
