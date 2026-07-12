import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { logAdminAction } from "@/services/admin/audit-service";
import { archiveOrder, deleteTestOrder, getOrderById, InventoryError, listOrders, markOrderEmailSent, markOrderTest, updateOrder, updateOrderNotes } from "@/services/orders/order-service";
import { sendOrderStatusEmail } from "@/lib/email";
import type { OrderStatus, PaymentStatus } from "@/types/backoffice";

function diagnosticId() {
  return `admin_orders_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function jsonSuccess(data: Record<string, unknown>, id: string) {
  return NextResponse.json({ success: true, diagnosticId: id, data, ...data });
}

function jsonError(error: string, status: number, id: string, details?: string) {
  return NextResponse.json({ success: false, error, message: error, diagnosticId: id, details }, { status });
}

export async function GET() {
  const id = diagnosticId();
  if (!(await isAdminSession())) return jsonError("Unauthorized", 401, id);
  try {
    const orders = await listOrders();
    return jsonSuccess({ orders }, id);
  } catch (error) {
    console.error("admin_orders_get_failed", { diagnosticId: id, message: error instanceof Error ? error.message : String(error) });
    return jsonError("Orders could not be loaded.", 500, id, error instanceof Error ? error.message : String(error));
  }
}

export async function PATCH(request: Request) {
  const id = diagnosticId();
  if (!(await isAdminSession())) return jsonError("Unauthorized", 401, id);
  const body = (await request.json()) as { id?: string; status?: OrderStatus; paymentStatus?: PaymentStatus; notes?: string; action?: "notes" | "mark_test" | "archive"; isTest?: boolean; archived?: boolean; reason?: string };
  if (!body.id) return jsonError("Missing order update.", 400, id);
  try {
    if (body.action === "notes") {
      if (typeof body.notes !== "string" || body.notes.length > 5000) return jsonError("Invalid order notes.", 400, id);
      const order = await updateOrderNotes(body.id, body.notes);
      await logAdminAction({ recordType: "order", recordId: body.id, action: "update_notes" });
      return jsonSuccess({ order }, id);
    }
    if (body.action === "mark_test") {
      const order = await markOrderTest(body.id, Boolean(body.isTest), body.reason ?? "");
      await logAdminAction({ recordType: "order", recordId: body.id, action: body.isTest ? "mark_test" : "unmark_test", metadata: { reason: body.reason ?? "" } });
      return jsonSuccess({ order }, id);
    }
    if (body.action === "archive") {
      const order = await archiveOrder(body.id, Boolean(body.archived));
      await logAdminAction({ recordType: "order", recordId: body.id, action: body.archived ? "archive" : "restore" });
      return jsonSuccess({ order }, id);
    }
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Order action failed.", 409, id);
  }
  if (!body.status || !body.paymentStatus) return jsonError("Missing order update.", 400, id);
  const allowedStatuses = ["new", "confirmed", "processing", "ready_for_collection", "shipped", "delivered", "cancelled"];
  const allowedPayments = ["pending", "paid", "failed", "refunded", "cancelled"];
  if (!allowedStatuses.includes(body.status) || !allowedPayments.includes(body.paymentStatus)) return jsonError("Invalid order status.", 400, id);
  const previous = await getOrderById(body.id);
  let order;
  try { order = await updateOrder(body.id, body.status, body.paymentStatus); }
  catch (error) { return jsonError(error instanceof InventoryError ? error.message : "Order status could not be updated.", error instanceof InventoryError ? 409 : 500, id, error instanceof Error ? error.message : String(error)); }
  await logAdminAction({ recordType: "order", recordId: body.id, action: "update_status", metadata: { status: body.status, paymentStatus: body.paymentStatus } });
  let email = { sent: false, skipped: true };
  if (previous && previous.status !== body.status && ["confirmed", "ready_for_collection", "shipped", "delivered", "cancelled"].includes(body.status)) {
    email = await sendOrderStatusEmail({ orderId: previous.order_number ? `NC-${String(previous.order_number).padStart(6, "0")}` : previous.id, customerName: previous.customer_name, customerEmail: previous.customer_email, status: body.status, locale: previous.customer?.language });
    if (email.sent) await markOrderEmailSent(body.id, "status_email_sent_at");
  } else if (previous && previous.payment_status !== body.paymentStatus && body.paymentStatus === "paid") {
    email = await sendOrderStatusEmail({ orderId: previous.order_number ? `NC-${String(previous.order_number).padStart(6, "0")}` : previous.id, customerName: previous.customer_name, customerEmail: previous.customer_email, status: "paid", locale: previous.customer?.language });
    if (email.sent) await markOrderEmailSent(body.id, "status_email_sent_at");
  }
  return jsonSuccess({ order, email }, id);
}

export async function DELETE(request: Request) {
  const id = diagnosticId();
  if (!(await isAdminSession())) return jsonError("Unauthorized", 401, id);
  const body = await request.json() as { id?: string; confirmation?: string };
  if (!body.id || body.confirmation !== "DELETE TEST ORDER") return jsonError("Type DELETE TEST ORDER to delete an explicit test order.", 400, id);
  try {
    await deleteTestOrder(body.id);
    await logAdminAction({ recordType: "order", recordId: body.id, action: "delete_test_order" });
    return jsonSuccess({ ok: true }, id);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Test order could not be deleted safely.", 409, id);
  }
}
