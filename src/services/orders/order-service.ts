import { randomUUID } from "node:crypto";
import { hasSupabaseAdmin } from "@/lib/env";
import { getEffectivePackageOptions } from "@/lib/product-packaging";
import { getProductsByIds } from "@/lib/product-store";
import { supabaseAdminFetch } from "@/lib/supabase-rest";
import { evaluateProductAvailability } from "@/lib/product-availability";
import type { BackofficeCustomer, BackofficeOrder, OrderInput, OrderLineInput, OrderStatus, PaymentStatus } from "@/types/backoffice";

export class OrderValidationError extends Error {
  constructor(message: string, public status = 400, public code = "invalid_order") { super(message); }
}

export class InventoryError extends Error {}

function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }

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
  if (!hasSupabaseAdmin()) throw new OrderValidationError("Ordering is temporarily unavailable.", 503, "service_unavailable");
  if (!input.idempotencyKey || !/^[a-zA-Z0-9-]{16,80}$/.test(input.idempotencyKey)) throw new OrderValidationError("Invalid order request.", 400, "invalid_order");
  const cartLines = await validateCartLines(input.lines);
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
  const result = await supabaseAdminFetch<Array<{ order_id: string; order_number: number; already_existed: boolean }>>("rpc/create_validated_order", {
    method: "POST",
    body: {
      p_order_id: `NC-${randomUUID()}`, p_idempotency_key: input.idempotencyKey,
      p_auth_user_id: input.authUserId ?? null, p_customer_name: input.customerName,
      p_customer_email: input.customerEmail.toLowerCase().trim(), p_customer_phone: input.customerPhone ?? "",
      p_fulfillment: input.fulfillment ?? "Collection", p_notes: input.notes ?? "",
      p_subtotal_ex_vat: subtotalExVat, p_vat_total: vatTotal, p_total: total, p_lines: validatedLines,
    },
  });
  const saved = result[0];
  if (!saved) throw new Error("Order could not be stored.");
  return { orderId: saved.order_id, orderNumber: saved.order_number, alreadyExisted: saved.already_existed, stored: true, total, subtotalExVat, vatTotal, lines: validatedLines };
}

async function enrichOrdersWithCustomers(orders: BackofficeOrder[]) {
  const customerIds = Array.from(new Set(orders.map((order) => order.customer_id).filter((id): id is string => Boolean(id))));
  if (customerIds.length === 0) return orders;
  const customers = await supabaseAdminFetch<BackofficeCustomer[]>(
    `customers?select=id,name,email,phone,address,language&id=in.(${customerIds.map(encodeURIComponent).join(",")})`,
  );
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return orders.map((order) => ({ ...order, order_items: order.order_items ?? [], customer: order.customer_id ? customerMap.get(order.customer_id) : undefined }));
}

export async function listOrders() {
  if (!hasSupabaseAdmin()) return [];
  const orders = await supabaseAdminFetch<BackofficeOrder[]>("orders?select=*,order_items(*),invoices(id,invoice_number,status,email_sent_at,issued_at,created_at)&order=created_at.desc&limit=500");
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

export async function getOrderById(id: string) {
  const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?select=*,order_items(*),invoices(id,invoice_number,status,email_sent_at,issued_at,created_at)&id=eq.${encodeURIComponent(id)}&limit=1`);
  return (await enrichOrdersWithCustomers(rows))[0];
}

export async function markOrderEmailSent(id: string, field: "admin_email_sent_at" | "customer_email_sent_at" | "status_email_sent_at") {
  await supabaseAdminFetch(`orders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { [field]: new Date().toISOString() } });
}
