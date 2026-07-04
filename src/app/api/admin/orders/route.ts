import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { getOrderById, listOrders, markOrderEmailSent, updateOrder } from "@/services/orders/order-service";
import { sendOrderStatusEmail } from "@/lib/email";
import type { OrderStatus, PaymentStatus } from "@/types/backoffice";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: string; status?: OrderStatus; paymentStatus?: PaymentStatus };
  if (!body.id || !body.status || !body.paymentStatus) return NextResponse.json({ message: "Missing order update." }, { status: 400 });
  const previous = await getOrderById(body.id);
  const order = await updateOrder(body.id, body.status, body.paymentStatus);
  let email = { sent: false, skipped: true };
  if (previous && previous.status !== body.status && ["confirmed", "ready_for_collection", "shipped", "delivered", "cancelled"].includes(body.status)) {
    email = await sendOrderStatusEmail({ orderId: previous.order_number ? `NC-${String(previous.order_number).padStart(6, "0")}` : previous.id, customerName: previous.customer_name, customerEmail: previous.customer_email, status: body.status });
    if (email.sent) await markOrderEmailSent(body.id, "status_email_sent_at");
  }
  return NextResponse.json({ order, email });
}
