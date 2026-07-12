import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { logAdminAction } from "@/services/admin/audit-service";
import { archiveCustomer, deleteCustomerIfSafe, listAdminCustomers, markCustomerTest } from "@/services/admin/customer-service";

function diagnosticId() {
  return `admin_customers_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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
    const customers = await listAdminCustomers();
    return jsonSuccess({ customers }, id);
  } catch (error) {
    console.error("admin_customers_get_failed", { diagnosticId: id, message: error instanceof Error ? error.message : String(error) });
    return jsonError("Customers could not be loaded.", 500, id, error instanceof Error ? error.message : String(error));
  }
}

export async function PATCH(request: Request) {
  const id = diagnosticId();
  if (!(await isAdminSession())) return jsonError("Unauthorized", 401, id);
  const body = await request.json() as { id?: string; action?: "archive" | "mark_test"; archived?: boolean; isTest?: boolean; reason?: string };
  if (!body.id || !body.action) return jsonError("Missing customer action.", 400, id);
  try {
    if (body.action === "archive") {
      const customer = await archiveCustomer(body.id, Boolean(body.archived));
      await logAdminAction({ recordType: "customer", recordId: body.id, action: body.archived ? "archive" : "restore" });
      return jsonSuccess({ customer }, id);
    }
    if (body.action === "mark_test") {
      const customer = await markCustomerTest(body.id, Boolean(body.isTest), body.reason ?? "");
      await logAdminAction({ recordType: "customer", recordId: body.id, action: body.isTest ? "mark_test" : "unmark_test", metadata: { reason: body.reason ?? "" } });
      return jsonSuccess({ customer }, id);
    }
    return jsonError("Invalid customer action.", 400, id);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Customer action failed.", 409, id);
  }
}

export async function DELETE(request: Request) {
  const id = diagnosticId();
  if (!(await isAdminSession())) return jsonError("Unauthorized", 401, id);
  const body = await request.json() as { id?: string; confirmation?: string };
  if (!body.id || !body.confirmation) return jsonError("Missing delete confirmation.", 400, id);
  try {
    await deleteCustomerIfSafe(body.id, body.confirmation);
    await logAdminAction({ recordType: "customer", recordId: body.id, action: "delete_safe" });
    return jsonSuccess({ ok: true }, id);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Customer could not be deleted.", 409, id);
  }
}
