import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { listOrders, updateOrder } from "@/services/orders/order-service";
import type { OrderStatus, PaymentStatus } from "@/types/backoffice";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: string; status?: OrderStatus; paymentStatus?: PaymentStatus };
  if (!body.id || !body.status || !body.paymentStatus) return NextResponse.json({ message: "Missing order update." }, { status: 400 });
  return NextResponse.json({ order: await updateOrder(body.id, body.status, body.paymentStatus) });
}
