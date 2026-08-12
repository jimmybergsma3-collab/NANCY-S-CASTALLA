import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { adjustInventory, listInventory, listRecentInventoryMovements } from "@/services/inventory/inventory-service";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const [products, movements] = await Promise.all([listInventory(), listRecentInventoryMovements()]);
  return NextResponse.json({ products, movements });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { productId?: string; quantity?: number; reference?: string };
  if (!body.productId || !Number.isFinite(body.quantity)) return NextResponse.json({ message: "Invalid inventory adjustment." }, { status: 400 });
  return NextResponse.json({ product: await adjustInventory(body.productId, Number(body.quantity), body.reference) });
}
