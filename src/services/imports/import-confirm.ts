import type { Product } from "@/types/product";
import type { SupplierImportConflictSample, SupplierImportParseResult, SupplierImportProduct, SupplierImportPreviewReport } from "@/types/imports";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

type SupplierRow = {
  id: string;
  name: string;
  code: string | null;
};

type ReservedCode = {
  product_code: string;
};

export type ConfirmImportResult = {
  importRunId: string;
  createdProducts: number;
  supplierOffersCreated: number;
  skipped: number;
  conflictsWritten: number;
  warnings: string[];
  errors: Array<{ sourceRow: string; message: string }>;
};

function normalizeCode(value: string) {
  return value.trim().toLowerCase();
}

function normalizeEan(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePackage(value: string) {
  return normalizeText(value.replaceAll(",", "."));
}

function normalizePrice(value?: number) {
  return value === undefined || !Number.isFinite(value) ? "" : value.toFixed(4);
}

function categoryFallback(product: SupplierImportProduct) {
  if (product.supplier === "Europ Foods") return "Dutch products";
  return "British & Irish products";
}

function productTypeFromStorage(storageType: string) {
  const normalized = storageType.toLowerCase();
  if (normalized.includes("diepvries") || normalized.includes("frozen")) return "frozen";
  if (normalized.includes("vers") || normalized.includes("chilled") || normalized.includes("fresh")) return "fresh";
  return "ambient";
}

function makeDuplicateKeys(products: SupplierImportProduct[]) {
  const sourceIdentityGroups = new Map<string, number>();
  const supplierCodeIdentities = new Map<string, Set<string>>();
  for (const product of products) {
    const supplierKey = `${normalizeCode(product.supplier)}|${normalizeCode(product.supplierCode)}`;
    const identity = importSourceIdentity(product);
    sourceIdentityGroups.set(identity, (sourceIdentityGroups.get(identity) ?? 0) + 1);
    const identities = supplierCodeIdentities.get(supplierKey) ?? new Set<string>();
    identities.add(identity);
    supplierCodeIdentities.set(supplierKey, identities);
  }
  return {
    sourceIdentityGroups,
    supplierCodeIdentities,
  };
}

function buildExistingIndexes(products: Product[]) {
  const activeProducts = products.filter((product) => (product.lifecycleStatus ?? "active") === "active");
  const activeSupplierCodes = new Set(activeProducts.map((product) => `${normalizeCode(product.supplier)}|${normalizeCode(product.supplierCode)}`).filter((key) => !key.endsWith("|")));
  const activeEans = new Set(activeProducts.map((product) => normalizeEan(product.ean ?? "")).filter(Boolean));
  return { activeSupplierCodes, activeEans };
}

export function importSourceIdentity(product: SupplierImportProduct) {
  return [
    normalizeCode(product.supplier),
    normalizeCode(product.supplierCode),
    normalizeText(product.supplierProductName),
    normalizePackage(product.packageDescription),
    normalizePrice(product.casePrice ?? product.priceExVat),
    normalizePrice(product.unitPrice),
  ].join("|");
}

function conflictForProduct(product: SupplierImportProduct, products: SupplierImportProduct[], existingProducts: Product[]) {
  const duplicates = makeDuplicateKeys(products);
  const existing = buildExistingIndexes(existingProducts);
  const supplierKey = `${normalizeCode(product.supplier)}|${normalizeCode(product.supplierCode)}`;
  const eanKey = normalizeEan(product.ean);
  const identityKey = importSourceIdentity(product);
  const reasons: Array<{ type: SupplierImportConflictSample["matches"][number]["type"]; reason: string }> = [];

  if ((duplicates.sourceIdentityGroups.get(identityKey) ?? 0) > 1) {
    reasons.push({ type: "in_file_duplicate", reason: "Exact repeated source listing in the same supplier file." });
  }
  if ((duplicates.supplierCodeIdentities.get(supplierKey)?.size ?? 0) > 1) {
    reasons.push({ type: "in_file_duplicate", reason: "Same supplier code has different name, package or price. Needs review." });
  }
  if (existing.activeSupplierCodes.has(supplierKey)) reasons.push({ type: "active_supplier_code", reason: "Same supplier code exists on an active product." });
  if (eanKey && existing.activeEans.has(eanKey)) reasons.push({ type: "active_ean", reason: "Same EAN exists on an active product." });

  if (!reasons.length) return undefined;
  return reasons;
}

export async function findOrCreateSupplier(supplierName: string) {
  const existing = await supabaseAdminFetch<SupplierRow[]>(
    `suppliers?select=id,name,code&name=eq.${encodeURIComponent(supplierName)}&limit=1`,
  );
  if (existing[0]) return existing[0];
  const code = supplierName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const created = await supabaseAdminFetch<SupplierRow[]>("suppliers", {
    method: "POST",
    body: { name: supplierName, code, active: true },
  });
  return created[0];
}

async function createImportRun(input: {
  supplierId: string;
  parseResult: SupplierImportParseResult;
  preview: SupplierImportPreviewReport;
  createdBy: string;
}) {
  const rows = await supabaseAdminFetch<Array<{ id: string }>>("product_import_runs", {
    method: "POST",
    body: {
      supplier_id: input.supplierId,
      supplier_name: input.parseResult.supplier,
      source_filename: input.parseResult.sourceFilename,
      import_batch: input.parseResult.importBatch,
      file_type: input.parseResult.fileType,
      status: "importing",
      dry_run: false,
      started_at: new Date().toISOString(),
      created_by: input.createdBy,
      source_row_count: input.parseResult.sourceRowCount,
      parsed_product_count: input.parseResult.products.length,
      conflict_count: input.preview.possibleActiveMatches + input.preview.possibleArchivedMatches + input.preview.possibleInFileDuplicates,
      warning_count: input.parseResult.warnings.length,
      error_count: input.parseResult.errors.length,
      report_json: {
        dryRunSummary: {
          duplicateSupplierCodeCount: input.preview.duplicateSupplierCodeCount,
          missingEanCount: input.preview.missingEanCount,
          unclearPackageCount: input.preview.unclearPackageCount,
          missingPriceCount: input.preview.missingPriceCount,
          possibleActiveMatches: input.preview.possibleActiveMatches,
          possibleArchivedMatches: input.preview.possibleArchivedMatches,
          possibleInFileDuplicates: input.preview.possibleInFileDuplicates,
        },
      },
    },
  });
  return rows[0].id;
}

async function completeImportRun(importRunId: string, result: Omit<ConfirmImportResult, "importRunId">) {
  const status = result.errors.length ? "completed" : "completed";
  await supabaseAdminFetch(`product_import_runs?id=eq.${encodeURIComponent(importRunId)}`, {
    method: "PATCH",
    body: {
      status,
      completed_at: new Date().toISOString(),
      created_product_count: result.createdProducts,
      updated_offer_count: result.supplierOffersCreated,
      skipped_count: result.skipped,
      conflict_count: result.conflictsWritten,
      warning_count: result.warnings.length,
      error_count: result.errors.length,
      report_json: {
        createdProducts: result.createdProducts,
        supplierOffersCreated: result.supplierOffersCreated,
        skipped: result.skipped,
        warnings: result.warnings.slice(0, 200),
        errors: result.errors.slice(0, 200),
      },
    },
  });
}

async function failImportRun(importRunId: string, message: string) {
  await supabaseAdminFetch(`product_import_runs?id=eq.${encodeURIComponent(importRunId)}`, {
    method: "PATCH",
    body: {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_count: 1,
      report_json: { error: message },
    },
  });
}

export function buildProductRow(product: SupplierImportProduct, productCode: string) {
  const category = categoryFallback(product);
  const cost = product.priceExVat ?? product.unitPrice ?? product.casePrice ?? 0;
  return {
    id: productCode,
    sku: productCode,
    ean: product.ean,
    name: product.supplierProductName,
    category,
    categories: [category],
    description: "Imported supplier product. Review public name, category, IVA, sale price, package and image before publishing.",
    price: 0,
    unit: product.packageDescription || product.sourceRow,
    stock_status: "preorder",
    type: productTypeFromStorage(product.storageType),
    origin: "Other",
    featured: false,
    image_url: "",
    images: [],
    cost_price_ex_vat: cost,
    vat_rate: 0,
    sale_price_incl_vat: 0,
    margin_percent: 0,
    profit_per_unit: 0,
    supplier: product.supplier,
    supplier_code: product.supplierCode,
    pack_size: product.packageDescription,
    unit_cost: product.unitPrice ?? product.priceExVat ?? product.casePrice ?? 0,
    stock_quantity: 0,
    minimum_stock: 0,
    track_inventory: false,
    weight: product.unitWeightOrVolume ? String(product.unitWeightOrVolume) : "",
    package_options: [],
    is_visible: false,
    is_new: false,
    product_status: "draft",
    import_batch: product.sourceBatch,
    needs_tax_review: true,
    needs_category_review: true,
    needs_package_review: product.needsPackageReview || !product.packageDescription,
    needs_image_review: true,
    needs_translation_review: true,
    ready_for_publish: false,
    import_source_filename: product.sourceFilename,
    import_source_row: product.sourceRow,
    original_supplier_name: product.supplierProductName,
    original_package_unit: product.packageDescription,
  };
}

export function buildOfferRow(product: SupplierImportProduct, productCode: string, supplierId: string) {
  return {
    product_id: productCode,
    supplier_id: supplierId,
    supplier_code: product.supplierCode,
    supplier_product_name: product.supplierProductName,
    ean: product.ean,
    brand: product.brand,
    category_source: product.categorySource,
    storage_type: product.storageType,
    package_description: product.packageDescription,
    units_per_case: product.unitsPerCase ?? null,
    unit_weight_or_volume: product.unitWeightOrVolume ?? null,
    case_price: product.casePrice ?? null,
    unit_price: product.unitPrice ?? null,
    price_ex_vat: product.priceExVat ?? product.unitPrice ?? product.casePrice ?? null,
    currency: product.currency,
    source_filename: product.sourceFilename,
    source_row: product.sourceRow,
    source_batch: product.sourceBatch,
    active: true,
    needs_tax_review: true,
    needs_category_review: true,
    needs_package_review: product.needsPackageReview || !product.packageDescription,
    needs_image_review: true,
    needs_translation_review: true,
    ready_for_publish: false,
    metadata: {
      originalSupplierName: product.supplierProductName,
      originalPackageUnit: product.packageDescription,
      brand: product.brand,
      storageType: product.storageType,
      categorySource: product.categorySource,
    },
  };
}

function buildConflictRow(input: {
  importRunId: string;
  product: SupplierImportProduct;
  type: string;
  reason: string;
}) {
  return {
    import_run_id: input.importRunId,
    import_batch: input.product.sourceBatch,
    conflict_type: input.type,
    supplier: input.product.supplier,
    supplier_code: input.product.supplierCode,
    ean: input.product.ean,
    name: input.product.supplierProductName,
    source_name: input.product.supplierProductName,
    source_package: input.product.packageDescription,
    package_signature: normalizePackage(input.product.packageDescription),
    reason: input.reason,
    resolution: "pending",
    available_choices: ["import_as_new", "skip", "link_supplier_offer", "restore_archived_product"],
    notes: input.product.sourceRow,
  };
}

export async function confirmSupplierImport(input: {
  parseResult: SupplierImportParseResult;
  preview: SupplierImportPreviewReport;
  existingProducts: Product[];
  createdBy: string;
}): Promise<ConfirmImportResult> {
  const supplier = await findOrCreateSupplier(input.parseResult.supplier);
  const importRunId = await createImportRun({
    supplierId: supplier.id,
    parseResult: input.parseResult,
    preview: input.preview,
    createdBy: input.createdBy,
  });

  try {
    const conflictRows: Array<ReturnType<typeof buildConflictRow>> = [];
    const importable: SupplierImportProduct[] = [];
    const importedSourceIdentities = new Set<string>();
    const warnings = input.parseResult.warnings.map((warning) => `${warning.reason}: ${warning.sourceRow}`);
    const errors = input.parseResult.errors.map((error) => ({ sourceRow: error.sourceRow, message: error.reason }));

    for (const product of input.parseResult.products) {
      const conflictReasons = conflictForProduct(product, input.parseResult.products, input.existingProducts);
      const missingPrice = product.unitPrice === undefined && product.casePrice === undefined && product.priceExVat === undefined;
      if (missingPrice) {
        warnings.push(`Skipped missing price: ${product.supplierCode} ${product.supplierProductName}`);
        continue;
      }
      if (conflictReasons?.length) {
        const isExactRepeat = conflictReasons.some((reason) => reason.reason.includes("Exact repeated source listing"));
        const identity = importSourceIdentity(product);
        if (isExactRepeat && !importedSourceIdentities.has(identity) && conflictReasons.length === 1) {
          importable.push(product);
          importedSourceIdentities.add(identity);
          continue;
        }
        for (const reason of conflictReasons) {
          conflictRows.push(buildConflictRow({ importRunId, product, type: reason.type.includes("ean") ? "ean" : reason.type.includes("supplier") ? "supplier_code" : reason.type.includes("package") ? "packaging" : "name", reason: reason.reason }));
        }
        continue;
      }
      importable.push(product);
      importedSourceIdentities.add(importSourceIdentity(product));
    }

    if (conflictRows.length) {
      await supabaseAdminFetch("product_import_conflicts", {
        method: "POST",
        body: conflictRows,
      });
    }

    const reservedCodes = await supabaseAdminFetch<ReservedCode[]>("rpc/reserve_nancy_product_codes", {
      method: "POST",
      body: { p_count: Math.max(importable.length, 1) },
    });

    let createdProducts = 0;
    let supplierOffersCreated = 0;
    for (let index = 0; index < importable.length; index += 50) {
      const slice = importable.slice(index, index + 50);
      const productRows = slice.map((product, offset) => buildProductRow(product, reservedCodes[index + offset].product_code));
      const insertedProducts = await supabaseAdminFetch<Array<{ id: string }>>("products", {
        method: "POST",
        body: productRows,
      });
      createdProducts += insertedProducts.length;
      const offerRows = slice.map((product, offset) => buildOfferRow(product, reservedCodes[index + offset].product_code, supplier.id));
      const insertedOffers = await supabaseAdminFetch<Array<{ id: string }>>("supplier_product_offers", {
        method: "POST",
        body: offerRows,
      });
      supplierOffersCreated += insertedOffers.length;
    }

    const result = {
      createdProducts,
      supplierOffersCreated,
      skipped: input.parseResult.products.length - importable.length,
      conflictsWritten: conflictRows.length,
      warnings,
      errors,
    };
    await completeImportRun(importRunId, result);
    return { importRunId, ...result };
  } catch (error) {
    await failImportRun(importRunId, error instanceof Error ? error.message : String(error));
    throw error;
  }
}
