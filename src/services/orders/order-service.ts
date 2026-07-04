import { randomUUID } from "node:crypto";
import { hasSupabaseAdmin } from "@/lib/env";
import { getEffectivePackageOptions } from "@/lib/product-packaging";
import { getProductsByIds } from "@/lib/product-store";
import { supabaseAdminFetch } from "@/lib/supabase-rest";
import type { BackofficeOrder, OrderInput, OrderLineInput, OrderStatus, PaymentStatus } from "@/types/backoffice";

export class OrderValidationError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }

async function validateLines(lines: OrderLineInput[]) {
  const products = await getProductsByIds(Array.from(new Set(lines.map((line) => line.productId))));
  const productMap = new Map(products.map((product) => [product.id, product]));
  return lines.map((requested) => {
    const product = productMap.get(requested.productId);
    if (!product || product.isVisible === false) throw new OrderValidationError("One of the selected products is no longer available.", 409);
    if (product.stockStatus === "coming-soon") throw new OrderValidationError(`${product.name} cannot be ordered yet.`, 409);
    if (!Number.isInteger(requested.quantity) || requested.quantity < 1 || requested.quantity > 99) throw new OrderValidationError(`Invalid quantity for ${product.name}.`);
    const options = getEffectivePackageOptions(product);
    const selected = options.find((option) => option.label === requested.packageLabel && option.quantity === Number(requested.packageQuantity ?? 1)) ?? (requested.packageLabel ? undefined : options[0]);
    if (!selected) throw new OrderValidationError(`The selected package for ${product.name} is no longer available.`, 409);
    const stockUnits = requested.quantity * selected.quantity;
    if (product.trackInventory && stockUnits > Number(product.stockQuantity ?? 0)) throw new OrderValidationError(`Insufficient stock for ${product.name}.`, 409);
    const lineTotal = roundMoney(requested.quantity * selected.salePriceInclVat);
    const lineExVat = roundMoney(lineTotal / (1 + product.vatRate / 100));
    return {
      productId: product.id, name: product.name, quantity: requested.quantity,
      unit: selected.label, packageLabel: selected.label, packageQuantity: selected.quantity,
      salePriceInclVat: selected.salePriceInclVat, vatRate: product.vatRate,
      lineTotalInclVat: lineTotal, lineTotalExVat: lineExVat, lineVat: roundMoney(lineTotal - lineExVat),
    };
  });
}

export async function createOrder(input: OrderInput) {
  if (!hasSupabaseAdmin()) throw new OrderValidationError("Ordering is temporarily unavailable.", 503);
  if (!input.idempotencyKey || !/^[a-zA-Z0-9-]{16,80}$/.test(input.idempotencyKey)) throw new OrderValidationError("Invalid order request.");
  const validatedLines = await validateLines(input.lines);
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

export async function listOrders() {
  if (!hasSupabaseAdmin()) return [];
  return supabaseAdminFetch<BackofficeOrder[]>("orders?select=*,order_items(*)&order=created_at.desc&limit=500");
}

export async function updateOrder(id: string, status: OrderStatus, paymentStatus: PaymentStatus) {
  return supabaseAdminFetch<BackofficeOrder[]>(`orders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { status, payment_status: paymentStatus, updated_at: new Date().toISOString() } });
}

export async function getOrderById(id: string) {
  const rows = await supabaseAdminFetch<BackofficeOrder[]>(`orders?select=*,order_items(*)&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0];
}

export async function markOrderEmailSent(id: string, field: "admin_email_sent_at" | "customer_email_sent_at" | "status_email_sent_at") {
  await supabaseAdminFetch(`orders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { [field]: new Date().toISOString() } });
}
