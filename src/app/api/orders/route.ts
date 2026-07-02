import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { createOrder } from "@/services/orders/order-service";
import type { OrderInput } from "@/types/backoffice";

type OrderBody = Partial<OrderInput>;

export async function POST(request: Request) {
  const body = (await request.json()) as OrderBody;

  if (!body.customerName || !body.customerEmail || !body.lines?.length) {
    return NextResponse.json({ ok: false, message: "Name, email and at least one product are required." }, { status: 400 });
  }

  const total = Number(body.total ?? 0);
  const order = await createOrder({ ...body, customerName: body.customerName, customerEmail: body.customerEmail, lines: body.lines, total });

  await sendOrderEmails({
    orderId: order.orderNumber ? `NC-${String(order.orderNumber).padStart(6, "0")}` : order.orderId,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    fulfillment: body.fulfillment ?? "Collection",
    notes: body.notes,
    total,
    lines: body.lines,
  });

  return NextResponse.json({
    ok: true,
    orderId: order.orderNumber ? `NC-${String(order.orderNumber).padStart(6, "0")}` : order.orderId,
    stored: order.stored,
    emailed: Boolean(process.env.RESEND_API_KEY),
  });
}
