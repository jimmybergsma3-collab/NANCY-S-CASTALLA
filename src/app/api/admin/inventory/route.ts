import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { adjustInventory, listInventory } from "@/services/inventory/inventory-service";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ products: await listInventory() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { productId?: string; quantity?: number; reference?: string };
  if (!body.productId || !Number.isFinite(body.quantity)) return NextResponse.json({ message: "Invalid inventory adjustment." }, { status: 400 });
  return NextResponse.json({ product: await adjustInventory(body.productId, Number(body.quantity), body.reference) });
}
