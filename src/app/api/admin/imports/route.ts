import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { hasSupabaseAdmin } from "@/lib/env";
import { getProducts } from "@/lib/product-store";
import { supabaseAdminFetch, SupabaseRestError } from "@/lib/supabase-rest";
import { buildImportPreview } from "@/services/imports/import-preview";
import { confirmSupplierImport } from "@/services/imports/import-confirm";
import { defaultImportBatch, parseSupplierFile, supplierKindFromValue } from "@/services/imports/import-parsers";
import type { SupplierImportPreviewReport } from "@/types/imports";

const maxImportFileSize = 10 * 1024 * 1024;

function importDiagnosticId() {
  return `import_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function logImportStep(diagnosticId: string, step: string, details?: Record<string, unknown>) {
  console.info("[supplier-import]", JSON.stringify({ diagnosticId, step, ...details }));
}

function logImportError(diagnosticId: string, step: string, error: unknown, details?: Record<string, unknown>) {
  console.error("[supplier-import]", JSON.stringify({
    diagnosticId,
    step,
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : "UnknownError",
    stack: error instanceof Error ? error.stack?.split("\n").slice(0, 6).join("\n") : undefined,
    ...details,
  }));
}

function errorCodeFromMessage(message: string) {
  return message.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 80) || "import_error";
}

function jsonError(message: string, status: number, diagnosticId?: string, details?: Record<string, unknown>, errorCode = errorCodeFromMessage(message)) {
  return NextResponse.json({ ok: false, errorCode, message, diagnosticId, details }, { status });
}

function badRequest(message: string, diagnosticId?: string) {
  return jsonError(message, 400, diagnosticId);
}

function fileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedFile(filename: string) {
  return ["pdf", "xls", "xlsx", "csv"].includes(fileExtension(filename));
}

function compactPreview(preview: SupplierImportPreviewReport): SupplierImportPreviewReport {
  return {
    ...preview,
    products: preview.products.slice(0, 25),
    warnings: preview.warnings.slice(0, 50),
    errors: preview.errors.slice(0, 50),
    sectionHeadings: preview.sectionHeadings.slice(0, 100),
    duplicateSupplierCodeGroups: preview.duplicateSupplierCodeGroups.slice(0, 50),
    conflictSamples: preview.conflictSamples.slice(0, 25),
  };
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, runs: [], message: "Supabase is not configured." });
  }

  try {
    const runs = await supabaseAdminFetch(
      "product_import_runs?select=id,supplier_name,source_filename,import_batch,file_type,status,dry_run,started_at,completed_at,source_row_count,parsed_product_count,created_product_count,updated_offer_count,skipped_count,conflict_count,warning_count,error_count,created_at&order=created_at.desc&limit=25",
    );
    return NextResponse.json({ ok: true, runs });
  } catch (error) {
    if (error instanceof SupabaseRestError && error.status === 404) {
      return NextResponse.json({ ok: true, runs: [], message: "Import workflow migration has not been applied yet." });
    }
    return NextResponse.json({ ok: true, runs: [], message: "Import history is not available yet." });
  }
}

export async function POST(request: Request) {
  const diagnosticId = importDiagnosticId();
  if (!(await isAdminSession())) {
    return jsonError("Admin login required.", 401, diagnosticId);
  }
  if (!hasSupabaseAdmin()) {
    return jsonError("Supabase is required for import previews.", 503, diagnosticId);
  }

  try {
    logImportStep(diagnosticId, "post_received");
    const formData = await request.formData();
    const action = String(formData.get("action") ?? "dry-run");
    logImportStep(diagnosticId, "form_data_read", { action });
    const supplierValue = String(formData.get("supplier") ?? "");
    const supplier = supplierKindFromValue(supplierValue);
    if (!supplier) return badRequest("Choose a supported supplier.", diagnosticId);

    const file = formData.get("file");
    if (!(file instanceof File)) return badRequest("Choose an import file.", diagnosticId);
    if (!isAllowedFile(file.name)) return badRequest("Only PDF, XLS, XLSX and CSV files are accepted.", diagnosticId);
    if (file.size > maxImportFileSize) return badRequest("Import file is too large. Maximum size is 10MB.", diagnosticId);

    if (supplier === "europfoods" && fileExtension(file.name) !== "pdf") return badRequest("Europ Foods import expects a PDF file.", diagnosticId);
    if (supplier === "tindale" && !["xls", "xlsx"].includes(fileExtension(file.name))) return badRequest("Tindale import expects an XLS or XLSX file.", diagnosticId);

    const importBatch = String(formData.get("importBatch") ?? "").trim() || defaultImportBatch(supplier);
    logImportStep(diagnosticId, "file_accepted", {
      supplier,
      importBatch,
      filename: file.name,
      fileType: fileExtension(file.name),
      fileSize: file.size,
    });
    const buffer = Buffer.from(await file.arrayBuffer());
    logImportStep(diagnosticId, "file_buffer_opened", { bytes: buffer.length });
    const productsBefore = await getProducts({ includeHidden: true, includeArchived: true });
    logImportStep(diagnosticId, "products_before_loaded", { productsBefore: productsBefore.length });
    const parsed = await parseSupplierFile(supplier, buffer, file.name, importBatch, diagnosticId);
    logImportStep(diagnosticId, "parser_result", {
      sourceRows: parsed.sourceRowCount,
      parsedProducts: parsed.products.length,
      sections: parsed.sectionHeadings.length,
      warnings: parsed.warnings.length,
      errors: parsed.errors.length,
    });
    const preview = buildImportPreview(parsed, productsBefore);
    logImportStep(diagnosticId, "preview_built", {
      parsedProducts: preview.parsedProductCount,
      activeMatches: preview.possibleActiveMatches,
      archivedMatches: preview.possibleArchivedMatches,
      duplicateSupplierCodeGroups: preview.duplicateSupplierCodeCount,
    });
    if (action === "confirm-import") {
      logImportStep(diagnosticId, "confirmed_import_start", { supplier, importBatch });
      const importResult = await confirmSupplierImport({
        parseResult: parsed,
        preview,
        existingProducts: productsBefore,
        createdBy: "admin",
      });
      const productsAfter = await getProducts({ includeHidden: true, includeArchived: true });
      logImportStep(diagnosticId, "confirmed_import_complete", {
        importRunId: importResult.importRunId,
        createdProducts: importResult.createdProducts,
        supplierOffersCreated: importResult.supplierOffersCreated,
        skipped: importResult.skipped,
        conflictsWritten: importResult.conflictsWritten,
        productsAfter: productsAfter.length,
      });
      return NextResponse.json({
        ok: true,
        diagnosticId,
        dryRun: false,
        importResult,
        writes: {
          productsBefore: productsBefore.length,
          productsAfter: productsAfter.length,
          changedProducts: productsAfter.length - productsBefore.length,
          supplierOffersWritten: importResult.supplierOffersCreated,
        },
        preview: compactPreview(preview),
      });
    }

    const productsAfter = await getProducts({ includeHidden: true, includeArchived: true });
    logImportStep(diagnosticId, "products_after_loaded", { productsAfter: productsAfter.length });

    const responseBody = {
      ok: true,
      diagnosticId,
      dryRun: true,
      writes: {
        productsBefore: productsBefore.length,
        productsAfter: productsAfter.length,
        changedProducts: productsAfter.length - productsBefore.length,
        supplierOffersWritten: 0,
      },
      preview: compactPreview(preview),
    };
    logImportStep(diagnosticId, "json_response_ready", {
      responseBytesApprox: JSON.stringify(responseBody).length,
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    logImportError(diagnosticId, "post_failed", error);
    return jsonError(
      error instanceof Error ? `Import preview failed: ${error.message}` : "Import preview failed.",
      500,
      diagnosticId,
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: false, message: "Supabase is required for import actions." }, { status: 503 });
  }

  const body = await request.json() as { action?: string; importBatch?: string; targetStatus?: string; confirmation?: string };
  const importBatch = body.importBatch?.trim() ?? "";
  if (!importBatch) return badRequest("Import batch is required.");

  try {
    if (body.action === "publish-batch") {
      if (body.confirmation !== "PUBLISH APPROVED IMPORT BATCH") {
        return badRequest("Type PUBLISH APPROVED IMPORT BATCH to publish approved draft products.");
      }
      const publishedCount = await supabaseAdminFetch<number>("rpc/publish_approved_import_batch", {
        method: "POST",
        body: { p_import_batch: importBatch },
      });
      return NextResponse.json({ ok: true, publishedCount });
    }

    if (body.action === "rollback-batch") {
      if (body.confirmation !== "ROLLBACK IMPORT BATCH") {
        return badRequest("Type ROLLBACK IMPORT BATCH to roll back this import batch safely.");
      }
      const affectedCount = await supabaseAdminFetch<number>("rpc/rollback_import_batch_to_draft", {
        method: "POST",
        body: { p_import_batch: importBatch, p_target_status: body.targetStatus === "archived" ? "archived" : "draft" },
      });
      return NextResponse.json({ ok: true, affectedCount });
    }

    return badRequest("Invalid import action.");
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Import action failed." }, { status: 409 });
  }
}
