import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { getOrderById, InventoryError, listOrders, markOrderEmailSent, updateOrder, updateOrderNotes } from "@/services/orders/order-service";
import { sendOrderStatusEmail } from "@/lib/email";
import type { OrderStatus, PaymentStatus } from "@/types/backoffice";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: string; status?: OrderStatus; paymentStatus?: PaymentStatus; notes?: string; action?: "notes" };
  if (!body.id) return NextResponse.json({ message: "Missing order update." }, { status: 400 });
  if (body.action === "notes") {
    if (typeof body.notes !== "string" || body.notes.length > 5000) return NextResponse.json({ message: "Invalid order notes." }, { status: 400 });
    return NextResponse.json({ order: await updateOrderNotes(body.id, body.notes) });
  }
  if (!body.status || !body.paymentStatus) return NextResponse.json({ message: "Missing order update." }, { status: 400 });
  const allowedStatuses = ["new", "confirmed", "processing", "ready_for_collection", "shipped", "delivered", "cancelled"];
  const allowedPayments = ["pending", "paid", "failed", "refunded", "cancelled"];
  if (!allowedStatuses.includes(body.status) || !allowedPayments.includes(body.paymentStatus)) return NextResponse.json({ message: "Invalid order status." }, { status: 400 });
  const previous = await getOrderById(body.id);
  let order;
  try { order = await updateOrder(body.id, body.status, body.paymentStatus); }
  catch (error) { return NextResponse.json({ message: error instanceof InventoryError ? error.message : "Order status could not be updated." }, { status: error instanceof InventoryError ? 409 : 500 }); }
  let email = { sent: false, skipped: true };
  if (previous && previous.status !== body.status && ["confirmed", "ready_for_collection", "shipped", "delivered", "cancelled"].includes(body.status)) {
    email = await sendOrderStatusEmail({ orderId: previous.order_number ? `NC-${String(previous.order_number).padStart(6, "0")}` : previous.id, customerName: previous.customer_name, customerEmail: previous.customer_email, status: body.status, locale: previous.customer?.language });
    if (email.sent) await markOrderEmailSent(body.id, "status_email_sent_at");
  } else if (previous && previous.payment_status !== body.paymentStatus && body.paymentStatus === "paid") {
    email = await sendOrderStatusEmail({ orderId: previous.order_number ? `NC-${String(previous.order_number).padStart(6, "0")}` : previous.id, customerName: previous.customer_name, customerEmail: previous.customer_email, status: "paid", locale: previous.customer?.language });
    if (email.sent) await markOrderEmailSent(body.id, "status_email_sent_at");
  }
  return NextResponse.json({ order, email });
}
