import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { hasSupabaseAdmin } from "@/lib/env";
import { importEuropFoodsConflictDrafts } from "@/services/imports/import-recovery";

function diagnosticId() {
  return `import_recovery_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function jsonError(message: string, status: number, id: string, errorCode = "import_recovery_failed") {
  return NextResponse.json({ ok: false, errorCode, message, diagnosticId: id }, { status });
}

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const id = diagnosticId();
  if (!(await isAdminSession())) return jsonError("Admin login required.", 401, id, "admin_required");
  if (!hasSupabaseAdmin()) return jsonError("Supabase admin configuration is required.", 503, id, "supabase_required");

  try {
    const { runId } = await params;
    const body = await request.json() as { conflictIds?: string[]; importAllImportable?: boolean };
    const conflictIds = Array.isArray(body.conflictIds) ? body.conflictIds.filter(Boolean) : [];
    if (!body.importAllImportable && conflictIds.length === 0) {
      return jsonError("Choose at least one importable conflict row.", 400, id, "no_conflicts_selected");
    }
    console.info("[supplier-import-recovery]", JSON.stringify({
      diagnosticId: id,
      step: "import_selected_start",
      runId,
      conflictCount: conflictIds.length,
      importAllImportable: Boolean(body.importAllImportable),
    }));
    const result = await importEuropFoodsConflictDrafts({
      importRunId: runId,
      conflictIds,
      importAllImportable: Boolean(body.importAllImportable),
    });
    console.info("[supplier-import-recovery]", JSON.stringify({
      diagnosticId: id,
      step: "import_selected_complete",
      runId,
      createdProducts: result.createdProducts,
      supplierOffersCreated: result.supplierOffersCreated,
      skipped: result.skipped.length,
    }));
    return NextResponse.json({ ok: true, diagnosticId: id, result });
  } catch (error) {
    console.error("[supplier-import-recovery]", JSON.stringify({
      diagnosticId: id,
      step: "import_selected_failed",
      message: error instanceof Error ? error.message : String(error),
    }));
    return jsonError(error instanceof Error ? error.message : "Import selected conflicts failed.", 500, id);
  }
}
