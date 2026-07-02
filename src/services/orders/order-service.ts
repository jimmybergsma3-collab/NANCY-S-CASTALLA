import { hasSupabaseAdmin } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";
import type { BackofficeOrder, OrderInput, OrderStatus, PaymentStatus } from "@/types/backoffice";

export async function createOrder(input: OrderInput) {
  const orderId = `NC-${Date.now()}`;
  if (!hasSupabaseAdmin()) return { orderId, orderNumber: undefined, stored: false };

  try {
    const result = await supabaseAdminFetch<Array<{ order_number: number }>>("rpc/create_order_with_inventory", {
      method: "POST",
      body: {
        p_order_id: orderId,
        p_customer_name: input.customerName,
        p_customer_email: input.customerEmail,
        p_customer_phone: input.customerPhone ?? "",
        p_fulfillment: input.fulfillment ?? "Collection",
        p_notes: input.notes ?? "",
        p_total: Number(input.total ?? 0),
        p_lines: input.lines,
      },
    });
    return { orderId, orderNumber: result[0]?.order_number, stored: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("create_order_with_inventory")) throw error;

    // Compatibility path until the backoffice migration has been applied.
    await supabaseAdminFetch("orders", {
      method: "POST",
      body: {
        id: orderId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone ?? "",
        fulfillment: input.fulfillment ?? "Collection",
        notes: input.notes ?? "",
        total: Number(input.total ?? 0),
        status: "new",
      },
    });
    await supabaseAdminFetch("order_items", {
      method: "POST",
      body: input.lines.map((line) => ({
        order_id: orderId,
        product_id: line.productId,
        product_name: line.name,
        quantity: line.quantity,
        unit: line.unit,
        package_label: line.packageLabel ?? "",
        package_quantity: line.packageQuantity ?? 1,
        sale_price_incl_vat: line.salePriceInclVat,
      })),
    });
    return { orderId, orderNumber: undefined, stored: true };
  }
}

export async function listOrders() {
  if (!hasSupabaseAdmin()) return [];
  return supabaseAdminFetch<BackofficeOrder[]>("orders?select=*,order_items(*)&order=created_at.desc&limit=500");
}

export async function updateOrder(id: string, status: OrderStatus, paymentStatus: PaymentStatus) {
  return supabaseAdminFetch<BackofficeOrder[]>(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { status, payment_status: paymentStatus, updated_at: new Date().toISOString() },
  });
}
