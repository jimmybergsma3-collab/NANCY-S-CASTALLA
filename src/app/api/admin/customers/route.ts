import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { logAdminAction } from "@/services/admin/audit-service";
import { archiveCustomer, deleteCustomerIfSafe, listAdminCustomers, markCustomerTest } from "@/services/admin/customer-service";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ customers: await listAdminCustomers() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { id?: string; action?: "archive" | "mark_test"; archived?: boolean; isTest?: boolean; reason?: string };
  if (!body.id || !body.action) return NextResponse.json({ message: "Missing customer action." }, { status: 400 });
  if (body.action === "archive") {
    const customer = await archiveCustomer(body.id, Boolean(body.archived));
    await logAdminAction({ recordType: "customer", recordId: body.id, action: body.archived ? "archive" : "restore" });
    return NextResponse.json({ customer });
  }
  if (body.action === "mark_test") {
    const customer = await markCustomerTest(body.id, Boolean(body.isTest), body.reason ?? "");
    await logAdminAction({ recordType: "customer", recordId: body.id, action: body.isTest ? "mark_test" : "unmark_test", metadata: { reason: body.reason ?? "" } });
    return NextResponse.json({ customer });
  }
  return NextResponse.json({ message: "Invalid customer action." }, { status: 400 });
}

export async function DELETE(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { id?: string; confirmation?: string };
  if (!body.id || !body.confirmation) return NextResponse.json({ message: "Missing delete confirmation." }, { status: 400 });
  try {
    await deleteCustomerIfSafe(body.id, body.confirmation);
    await logAdminAction({ recordType: "customer", recordId: body.id, action: "delete_safe" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Customer could not be deleted." }, { status: 409 });
  }
}
