import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { createOrder, markOrderEmailSent, OrderValidationError } from "@/services/orders/order-service";
import { getCustomerAuthUser } from "@/lib/customer-auth";
import type { OrderInput } from "@/types/backoffice";

type OrderBody = Partial<OrderInput>;
type OrderErrorCode =
  | "missing_fields"
  | "invalid_order"
  | "service_unavailable"
  | "product_unavailable"
  | "coming_soon"
  | "invalid_quantity"
  | "package_unavailable"
  | "insufficient_stock"
  | "order_storage_unconfirmed"
  | "order_failed";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return NextResponse.json({ ok: false, errorCode: "invalid_order", message: "The order request was not valid JSON.", diagnosticId: requestId }, { status: 400 });
  }
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
  console.info("order_api", {
    requestId,
    step: "received",
    lineCount: body.lines?.length ?? 0,
    fulfillment: body.fulfillment ?? "Collection",
    hasCustomerName: Boolean(customerName),
    hasCustomerEmail: Boolean(customerEmail),
    hasAuthorization: Boolean(request.headers.get("authorization")),
  });

  if (!customerName || !customerEmail || !body.lines?.length) {
    return NextResponse.json({ ok: false, errorCode: "missing_fields", message: "Name, email and at least one product are required.", diagnosticId: requestId }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ ok: false, errorCode: "invalid_order", message: "Please enter a valid email address.", diagnosticId: requestId }, { status: 400 });
  }
  if (body.fulfillment && !["Collection", "Local delivery"].includes(body.fulfillment)) {
    return NextResponse.json({ ok: false, errorCode: "invalid_order", message: "Please choose collection or local delivery.", diagnosticId: requestId }, { status: 400 });
  }

  try {
    const authUser = await getCustomerAuthUser(request);
    console.info("order_api", { requestId, step: "auth_checked", hasAuthUser: Boolean(authUser?.id) });
    const order = await createOrder({ ...body, customerName, customerEmail, lines: body.lines, authUserId: authUser?.id });
    if (!order.orderId || !order.orderNumber) {
      console.error("Order storage returned without a confirmed order id", {
        requestId,
        hasOrderId: Boolean(order.orderId),
        hasOrderNumber: Boolean(order.orderNumber),
        alreadyExisted: Boolean(order.alreadyExisted),
      });
      throw new OrderValidationError("Order storage could not be confirmed. Please try again.", 500, "order_storage_unconfirmed");
    }
    const publicOrderId = order.orderNumber ? `NC-${String(order.orderNumber).padStart(6, "0")}` : order.orderId;
    console.info("order_api", { requestId, step: "order_stored", orderId: publicOrderId, stored: order.stored });

    let emailed = false;
    try {
      const emailResult = await sendOrderEmails({
        orderId: publicOrderId,
        customerName,
        customerEmail,
        customerPhone: body.customerPhone,
        fulfillment: body.fulfillment ?? "Collection",
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        total: order.total,
        lines: order.lines,
        locale: body.locale,
      });
      await Promise.allSettled([
        ...(emailResult.admin.sent ? [markOrderEmailSent(order.orderId, "admin_email_sent_at")] : []),
        ...(emailResult.customer.sent ? [markOrderEmailSent(order.orderId, "customer_email_sent_at")] : []),
      ]);
      emailed = emailResult.sent;
      console.info("order_api", { requestId, step: "email_finished", emailed });
    } catch (emailError) {
      console.error("Order email failed after order was stored", {
        requestId,
        orderId: order.orderId,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    return NextResponse.json({
      ok: true,
      orderId: publicOrderId,
      stored: order.stored,
      emailed,
      subtotalExVat: order.subtotalExVat,
      vatTotal: order.vatTotal,
      diagnosticId: requestId,
    });
  } catch (error) {
    const status = error instanceof OrderValidationError ? error.status : 500;
    const errorCode = (error instanceof OrderValidationError ? error.code : "order_failed") as OrderErrorCode;
    const message = error instanceof Error ? error.message : "The order could not be sent.";
    console.error("Order request failed", {
      requestId,
      errorCode,
      status,
      message,
    });
    return NextResponse.json({
      ok: false,
      errorCode,
      message,
      diagnosticId: requestId,
    }, { status });
  }
}
