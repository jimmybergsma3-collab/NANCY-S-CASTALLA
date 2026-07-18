import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import { logAdminAction } from "@/services/admin/audit-service";
import { archiveOrder, deleteTestOrder, getOrderById, InventoryError, listOrders, markOrderEmailSent, markOrderTest, OrderEditError, replaceOrderItemsForCorrection, resetInventoryCommitFlagWithoutMovement, resetInvoiceForOrderCorrection, updateOrder, updateOrderNotes, voidInvoiceAndReleaseInventoryForOrderCorrection } from "@/services/orders/order-service";
import { sendOrderStatusEmail } from "@/lib/email";
import type { AdminOrderLineEditInput, OrderStatus, PaymentStatus } from "@/types/backoffice";

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
  const body = (await request.json()) as { id?: string; status?: OrderStatus; paymentStatus?: PaymentStatus; notes?: string; action?: "notes" | "mark_test" | "archive" | "replace_items" | "reset_invoice_for_correction" | "void_invoice_release_inventory_for_correction" | "reset_inventory_commit_flag_without_movement"; isTest?: boolean; archived?: boolean; reason?: string; lines?: AdminOrderLineEditInput[]; expectedUpdatedAt?: string };
  if (!body.id) return jsonError("Missing order update.", 400, id);
  const actor = env.adminEmail || "admin";
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
    if (body.action === "replace_items") {
      const order = await replaceOrderItemsForCorrection(body.id, body.lines ?? [], body.reason ?? "", actor, body.expectedUpdatedAt);
      if (!order) return jsonError("Order not found after correction.", 404, id);
      await logAdminAction({ recordType: "order", recordId: body.id, action: "replace_items_for_correction", metadata: { actor, reason: body.reason ?? "", lineCount: body.lines?.length ?? 0 } });
      return jsonSuccess({ order }, id);
    }
    if (body.action === "reset_invoice_for_correction") {
      const order = await resetInvoiceForOrderCorrection(body.id, body.reason ?? "", actor);
      if (!order) return jsonError("Order not found after invoice reset.", 404, id);
      await logAdminAction({ recordType: "order", recordId: body.id, action: "void_invoice_for_order_correction", metadata: { actor, reason: body.reason ?? "" } });
      return jsonSuccess({ order }, id);
    }
    if (body.action === "void_invoice_release_inventory_for_correction") {
      const order = await voidInvoiceAndReleaseInventoryForOrderCorrection(body.id, body.reason ?? "", actor);
      if (!order) return jsonError("Order not found after inventory release.", 404, id);
      await logAdminAction({ recordType: "order", recordId: body.id, action: "void_invoice_release_inventory_for_correction", metadata: { actor, reason: body.reason ?? "" } });
      return jsonSuccess({ order }, id);
    }
    if (body.action === "reset_inventory_commit_flag_without_movement") {
      const order = await resetInventoryCommitFlagWithoutMovement(body.id, body.reason ?? "", actor);
      if (!order) return jsonError("Order not found after legacy inventory flag repair.", 404, id);
      await logAdminAction({ recordType: "order", recordId: body.id, action: "reset_inventory_commit_flag_without_movement", metadata: { actor, reason: body.reason ?? "" } });
      return jsonSuccess({ order }, id);
    }
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Order action failed.", error instanceof OrderEditError ? error.status : 409, id);
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
