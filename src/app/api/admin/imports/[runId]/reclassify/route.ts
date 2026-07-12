import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { hasSupabaseAdmin } from "@/lib/env";
import { reclassifyEuropFoodsConflicts } from "@/services/imports/import-recovery";

function diagnosticId() {
  return `import_reclassify_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function jsonError(message: string, status: number, id: string, errorCode = "import_reclassify_failed") {
  return NextResponse.json({ ok: false, errorCode, message, diagnosticId: id }, { status });
}

export async function POST(_request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const id = diagnosticId();
  if (!(await isAdminSession())) return jsonError("Admin login required.", 401, id, "admin_required");
  if (!hasSupabaseAdmin()) return jsonError("Supabase admin configuration is required.", 503, id, "supabase_required");

  try {
    const { runId } = await params;
    console.info("[supplier-import-recovery]", JSON.stringify({ diagnosticId: id, step: "reclassify_start", runId }));
    const result = await reclassifyEuropFoodsConflicts(runId);
    console.info("[supplier-import-recovery]", JSON.stringify({
      diagnosticId: id,
      step: "reclassify_complete",
      runId,
      totalReviewed: result.totalReviewed,
      importableVariants: result.importableVariants,
      repeated: result.exactRepeatedListings,
      unresolved: result.unresolvedConflicts,
      errors: result.errors,
    }));
    return NextResponse.json({ ok: true, diagnosticId: id, result });
  } catch (error) {
    console.error("[supplier-import-recovery]", JSON.stringify({
      diagnosticId: id,
      step: "reclassify_failed",
      message: error instanceof Error ? error.message : String(error),
    }));
    return jsonError(error instanceof Error ? error.message : "Import reclassification failed.", 500, id);
  }
}
