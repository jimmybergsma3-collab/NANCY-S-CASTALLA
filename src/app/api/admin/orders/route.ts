import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { logAdminAction } from "@/services/admin/audit-service";
import { archiveOrder, deleteTestOrder, getOrderById, InventoryError, listOrders, markOrderEmailSent, markOrderTest, updateOrder, updateOrderNotes } from "@/services/orders/order-service";
import { sendOrderStatusEmail } from "@/lib/email";
import type { OrderStatus, PaymentStatus } from "@/types/backoffice";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: string; status?: OrderStatus; paymentStatus?: PaymentStatus; notes?: string; action?: "notes" | "mark_test" | "archive"; isTest?: boolean; archived?: boolean; reason?: string };
  if (!body.id) return NextResponse.json({ message: "Missing order update." }, { status: 400 });
  if (body.action === "notes") {
    if (typeof body.notes !== "string" || body.notes.length > 5000) return NextResponse.json({ message: "Invalid order notes." }, { status: 400 });
    const order = await updateOrderNotes(body.id, body.notes);
    await logAdminAction({ recordType: "order", recordId: body.id, action: "update_notes" });
    return NextResponse.json({ order });
  }
  if (body.action === "mark_test") {
    const order = await markOrderTest(body.id, Boolean(body.isTest), body.reason ?? "");
    await logAdminAction({ recordType: "order", recordId: body.id, action: body.isTest ? "mark_test" : "unmark_test", metadata: { reason: body.reason ?? "" } });
    return NextResponse.json({ order });
  }
  if (body.action === "archive") {
    const order = await archiveOrder(body.id, Boolean(body.archived));
    await logAdminAction({ recordType: "order", recordId: body.id, action: body.archived ? "archive" : "restore" });
    return NextResponse.json({ order });
  }
  if (!body.status || !body.paymentStatus) return NextResponse.json({ message: "Missing order update." }, { status: 400 });
  const allowedStatuses = ["new", "confirmed", "processing", "ready_for_collection", "shipped", "delivered", "cancelled"];
  const allowedPayments = ["pending", "paid", "failed", "refunded", "cancelled"];
  if (!allowedStatuses.includes(body.status) || !allowedPayments.includes(body.paymentStatus)) return NextResponse.json({ message: "Invalid order status." }, { status: 400 });
  const previous = await getOrderById(body.id);
  let order;
  try { order = await updateOrder(body.id, body.status, body.paymentStatus); }
  catch (error) { return NextResponse.json({ message: error instanceof InventoryError ? error.message : "Order status could not be updated." }, { status: error instanceof InventoryError ? 409 : 500 }); }
  await logAdminAction({ recordType: "order", recordId: body.id, action: "update_status", metadata: { status: body.status, paymentStatus: body.paymentStatus } });
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

export async function DELETE(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { id?: string; confirmation?: string };
  if (!body.id || body.confirmation !== "DELETE TEST ORDER") return NextResponse.json({ message: "Type DELETE TEST ORDER to delete an explicit test order." }, { status: 400 });
  try {
    await deleteTestOrder(body.id);
    await logAdminAction({ recordType: "order", recordId: body.id, action: "delete_test_order" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Test order could not be deleted safely." }, { status: 409 });
  }
}
