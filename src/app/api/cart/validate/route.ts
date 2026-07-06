import { NextResponse } from "next/server";
import { validateCartLines } from "@/services/orders/order-service";
import type { OrderLineInput } from "@/types/backoffice";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { lines?: OrderLineInput[] };
    const lines = await validateCartLines(Array.isArray(body.lines) ? body.lines : []);
    const validLines = lines.filter((line) => line.available);
    return NextResponse.json({
      ok: true,
      lines,
      subtotalExVat: validLines.reduce((sum, line) => sum + line.lineTotalExVat, 0),
      vatTotal: validLines.reduce((sum, line) => sum + line.lineVat, 0),
      total: validLines.reduce((sum, line) => sum + line.lineTotalInclVat, 0),
    });
  } catch {
    return NextResponse.json({ ok: false, lines: [] }, { status: 400 });
  }
}
