import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { createOrder, markOrderEmailSent, OrderValidationError } from "@/services/orders/order-service";
import { getCustomerAuthUser } from "@/lib/customer-auth";
import type { OrderInput } from "@/types/backoffice";

type OrderBody = Partial<OrderInput>;

export async function POST(request: Request) {
  const body = (await request.json()) as OrderBody;

  if (!body.customerName || !body.customerEmail || !body.lines?.length) {
    return NextResponse.json({ ok: false, errorCode: "missing_fields" }, { status: 400 });
  }

  try {
  const authUser = await getCustomerAuthUser(request);
  const order = await createOrder({ ...body, customerName: body.customerName, customerEmail: body.customerEmail, lines: body.lines, authUserId: authUser?.id });

  const emailResult = await sendOrderEmails({
    orderId: order.orderNumber ? `NC-${String(order.orderNumber).padStart(6, "0")}` : order.orderId,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    fulfillment: body.fulfillment ?? "Collection",
    notes: body.notes,
    total: order.total,
    lines: order.lines,
    locale: body.locale,
  });
  await Promise.allSettled([
    ...(emailResult.admin.sent ? [markOrderEmailSent(order.orderId, "admin_email_sent_at")] : []),
    ...(emailResult.customer.sent ? [markOrderEmailSent(order.orderId, "customer_email_sent_at")] : []),
  ]);

  return NextResponse.json({
    ok: true,
    orderId: order.orderNumber ? `NC-${String(order.orderNumber).padStart(6, "0")}` : order.orderId,
    stored: order.stored,
    emailed: emailResult.sent,
    subtotalExVat: order.subtotalExVat,
    vatTotal: order.vatTotal,
  });
  } catch (error) {
    const status = error instanceof OrderValidationError ? error.status : 500;
    return NextResponse.json({ ok: false, errorCode: error instanceof OrderValidationError ? error.code : "order_failed" }, { status });
  }
}
