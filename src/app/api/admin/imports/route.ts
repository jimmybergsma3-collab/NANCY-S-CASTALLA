import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { hasSupabaseAdmin } from "@/lib/env";
import { getProducts } from "@/lib/product-store";
import { supabaseAdminFetch, SupabaseRestError } from "@/lib/supabase-rest";
import { buildImportPreview } from "@/services/imports/import-preview";
import { defaultImportBatch, parseSupplierFile, supplierKindFromValue } from "@/services/imports/import-parsers";

const maxImportFileSize = 10 * 1024 * 1024;

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function fileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedFile(filename: string) {
  return ["pdf", "xls", "xlsx", "csv"].includes(fileExtension(filename));
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
  if (!(await isAdminSession())) {
    return NextResponse.json({ ok: false, message: "Admin login required." }, { status: 401 });
  }
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: false, message: "Supabase is required for import previews." }, { status: 503 });
  }

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "dry-run");
  if (action === "confirm-import") {
    return NextResponse.json(
      { ok: false, message: "Confirmed import is intentionally guarded. Run a dry-run, review conflicts, apply the migration manually, then enable confirmed import in the next step." },
      { status: 409 },
    );
  }

  const supplierValue = String(formData.get("supplier") ?? "");
  const supplier = supplierKindFromValue(supplierValue);
  if (!supplier) return badRequest("Choose a supported supplier.");

  const file = formData.get("file");
  if (!(file instanceof File)) return badRequest("Choose an import file.");
  if (!isAllowedFile(file.name)) return badRequest("Only PDF, XLS, XLSX and CSV files are accepted.");
  if (file.size > maxImportFileSize) return badRequest("Import file is too large. Maximum size is 10MB.");

  if (supplier === "europfoods" && fileExtension(file.name) !== "pdf") return badRequest("Europ Foods import expects a PDF file.");
  if (supplier === "tindale" && !["xls", "xlsx"].includes(fileExtension(file.name))) return badRequest("Tindale import expects an XLS or XLSX file.");

  const importBatch = String(formData.get("importBatch") ?? "").trim() || defaultImportBatch(supplier);
  const buffer = Buffer.from(await file.arrayBuffer());
  const productsBefore = await getProducts({ includeHidden: true, includeArchived: true });
  const parsed = await parseSupplierFile(supplier, buffer, file.name, importBatch);
  const preview = buildImportPreview(parsed, productsBefore);
  const productsAfter = await getProducts({ includeHidden: true, includeArchived: true });

  return NextResponse.json({
    ok: true,
    dryRun: true,
    writes: {
      productsBefore: productsBefore.length,
      productsAfter: productsAfter.length,
      changedProducts: productsAfter.length - productsBefore.length,
      supplierOffersWritten: 0,
    },
    preview,
  });
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
