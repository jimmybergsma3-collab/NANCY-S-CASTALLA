import { logAdminAction } from "@/services/admin/audit-service";
import { buildOfferRow, buildProductRow, findOrCreateSupplier, importSourceIdentity } from "@/services/imports/import-confirm";
import { parseEuropFoodsConflictProduct } from "@/services/imports/import-parsers";
import { supabaseAdminFetch } from "@/lib/supabase-rest";
import type { SupplierImportProduct } from "@/types/imports";

type ImportRunRow = {
  id: string;
  supplier_name: string;
  source_filename: string;
  import_batch: string;
  created_product_count: number;
  updated_offer_count: number;
  skipped_count: number;
  conflict_count: number;
  report_json?: Record<string, unknown>;
};

type ConflictRow = {
  id: string;
  import_run_id: string | null;
  import_batch: string;
  supplier: string;
  supplier_code: string;
  source_name: string;
  source_package: string;
  reason: string;
  resolution: string;
  notes: string;
  created_at: string;
};

type OfferRow = {
  id: string;
  product_id: string | null;
  supplier_code: string;
  supplier_product_name: string;
  package_description: string;
  case_price: number | null;
  unit_price: number | null;
  price_ex_vat: number | null;
  source_batch: string;
  active: boolean;
};

type ReservedCode = {
  product_code: string;
};

export type ReclassifiedConflict = {
  id: string;
  sourceRow: string;
  supplierCode: string;
  name: string;
  packageDescription: string;
  storageType: string;
  casePrice?: number;
  unitPrice?: number;
  categorySource: string;
  classification: "importable_variant" | "repeated_source_listing" | "unresolved_conflict" | "parse_error";
  reason: string;
  possibleMatches: Array<{ productId: string; supplierCode: string; packageDescription: string; sourceBatch: string }>;
};

export type ReclassifyResult = {
  importRunId: string;
  totalReviewed: number;
  exactRepeatedListings: number;
  importableVariants: number;
  unresolvedConflicts: number;
  errors: number;
  items: ReclassifiedConflict[];
};

function normalizeCode(value: string) {
  return value.trim().toLowerCase();
}

function groupKey(product: SupplierImportProduct) {
  return importSourceIdentity(product);
}

function conflictProduct(row: ConflictRow, run: ImportRunRow) {
  return parseEuropFoodsConflictProduct({
    sourceRow: row.notes || `${row.source_name} ${row.source_package}`,
    sourceFilename: run.source_filename,
    sourceBatch: run.import_batch,
    fallbackSupplierCode: row.supplier_code,
    fallbackName: row.source_name || row.supplier_code,
    fallbackPackage: row.source_package,
    fallbackSection: "Recovered Europ Foods conflict",
  });
}

async function loadRun(importRunId: string) {
  const rows = await supabaseAdminFetch<ImportRunRow[]>(
    `product_import_runs?select=id,supplier_name,source_filename,import_batch,created_product_count,updated_offer_count,skipped_count,conflict_count,report_json&id=eq.${encodeURIComponent(importRunId)}&limit=1`,
  );
  const run = rows[0];
  if (!run) throw new Error("Import run not found.");
  if (run.supplier_name !== "Europ Foods") throw new Error("Recovery is currently only available for Europ Foods import runs.");
  return run;
}

async function loadPendingConflicts(importRunId: string) {
  return supabaseAdminFetch<ConflictRow[]>(
    `product_import_conflicts?select=id,import_run_id,import_batch,supplier,supplier_code,source_name,source_package,reason,resolution,notes,created_at&import_run_id=eq.${encodeURIComponent(importRunId)}&resolution=eq.pending&order=created_at.asc&limit=5000`,
  );
}

async function loadSupplierOffers(supplierId: string, importBatch: string) {
  return supabaseAdminFetch<OfferRow[]>(
    `supplier_product_offers?select=id,product_id,supplier_code,supplier_product_name,package_description,case_price,unit_price,price_ex_vat,source_batch,active&supplier_id=eq.${encodeURIComponent(supplierId)}&source_batch=eq.${encodeURIComponent(importBatch)}&active=eq.true&limit=5000`,
  );
}

function offerIdentity(offer: OfferRow) {
  return importSourceIdentity({
    supplier: "Europ Foods",
    supplierCode: offer.supplier_code,
    ean: "",
    supplierProductName: offer.supplier_product_name,
    brand: "",
    categorySource: "",
    storageType: "",
    packageDescription: offer.package_description,
    casePrice: offer.case_price ?? undefined,
    unitPrice: offer.unit_price ?? undefined,
    priceExVat: offer.price_ex_vat ?? undefined,
    currency: "EUR",
    sourceFilename: "",
    sourceRow: "",
    sourceBatch: offer.source_batch,
    needsTaxReview: true,
    needsCategoryReview: true,
    needsPackageReview: true,
    needsImageReview: true,
    needsTranslationReview: true,
  });
}

function classifyRows(input: {
  run: ImportRunRow;
  rows: ConflictRow[];
  offers: OfferRow[];
}) {
  const parsed = input.rows.map((row) => ({ row, product: conflictProduct(row, input.run) }));
  const identityCounts = new Map<string, number>();
  const supplierCodeIdentities = new Map<string, Set<string>>();
  const existingOfferByIdentity = new Map<string, OfferRow>();

  for (const offer of input.offers) {
    existingOfferByIdentity.set(offerIdentity(offer), offer);
  }

  for (const item of parsed) {
    if (!item.product) continue;
    const identity = groupKey(item.product);
    identityCounts.set(identity, (identityCounts.get(identity) ?? 0) + 1);
    const supplierCodeKey = normalizeCode(item.product.supplierCode);
    const identities = supplierCodeIdentities.get(supplierCodeKey) ?? new Set<string>();
    identities.add(identity);
    supplierCodeIdentities.set(supplierCodeKey, identities);
  }

  const seenIdentities = new Set<string>();
  return parsed.map<ReclassifiedConflict>((item) => {
    const product = item.product;
    if (!product) {
      return {
        id: item.row.id,
        sourceRow: item.row.notes,
        supplierCode: item.row.supplier_code,
        name: item.row.source_name,
        packageDescription: item.row.source_package,
        storageType: "",
        categorySource: "",
        classification: "parse_error",
        reason: "Stored source row could not be parsed with confidence.",
        possibleMatches: [],
      };
    }

    const identity = groupKey(product);
    const supplierCodeKey = normalizeCode(product.supplierCode);
    const matchingOffer = existingOfferByIdentity.get(identity);
    const sameCodeDifferentIdentity = (supplierCodeIdentities.get(supplierCodeKey)?.size ?? 0) > 1;
    const isRepeatedInSource = (identityCounts.get(identity) ?? 0) > 1;
    const alreadySeen = seenIdentities.has(identity);
    seenIdentities.add(identity);

    let classification: ReclassifiedConflict["classification"] = "importable_variant";
    let reason = "Safe Europ Foods variant. Different supplier code, package or price may become a separate draft product.";
    const possibleMatches = matchingOffer
      ? [{ productId: matchingOffer.product_id ?? "", supplierCode: matchingOffer.supplier_code, packageDescription: matchingOffer.package_description, sourceBatch: matchingOffer.source_batch }]
      : [];

    if (matchingOffer || (isRepeatedInSource && alreadySeen)) {
      classification = "repeated_source_listing";
      reason = matchingOffer ? "Exact source listing already has a supplier offer in this batch." : "Exact repeated source listing; only one Nancy product should be created.";
    } else if (sameCodeDifferentIdentity) {
      classification = "unresolved_conflict";
      reason = "Same Europ Foods supplier code appears with different name, package or price. Keep for manual review.";
    } else if (product.unitPrice === undefined && product.casePrice === undefined && product.priceExVat === undefined) {
      classification = "unresolved_conflict";
      reason = "Missing reliable purchase price.";
    }

    return {
      id: item.row.id,
      sourceRow: item.row.notes,
      supplierCode: product.supplierCode,
      name: product.supplierProductName,
      packageDescription: product.packageDescription,
      storageType: product.storageType,
      casePrice: product.casePrice,
      unitPrice: product.unitPrice,
      categorySource: product.categorySource,
      classification,
      reason,
      possibleMatches,
    };
  });
}

export async function reclassifyEuropFoodsConflicts(importRunId: string): Promise<ReclassifyResult> {
  const run = await loadRun(importRunId);
  const supplier = await findOrCreateSupplier("Europ Foods");
  const rows = await loadPendingConflicts(importRunId);
  const offers = await loadSupplierOffers(supplier.id, run.import_batch);
  const items = classifyRows({ run, rows, offers });

  for (const item of items) {
    const choices = item.classification === "importable_variant"
      ? ["import_as_new", "skip", "link_supplier_offer"]
      : item.classification === "repeated_source_listing"
        ? ["skip", "link_supplier_offer"]
        : ["skip", "keep_conflict"];
    await supabaseAdminFetch(`product_import_conflicts?id=eq.${encodeURIComponent(item.id)}`, {
      method: "PATCH",
      body: {
        reason: `${item.classification}: ${item.reason}`,
        available_choices: choices,
      },
    });
  }

  return {
    importRunId,
    totalReviewed: items.length,
    exactRepeatedListings: items.filter((item) => item.classification === "repeated_source_listing").length,
    importableVariants: items.filter((item) => item.classification === "importable_variant").length,
    unresolvedConflicts: items.filter((item) => item.classification === "unresolved_conflict").length,
    errors: items.filter((item) => item.classification === "parse_error").length,
    items,
  };
}

export async function importEuropFoodsConflictDrafts(input: {
  importRunId: string;
  conflictIds?: string[];
  importAllImportable?: boolean;
}) {
  const run = await loadRun(input.importRunId);
  const supplier = await findOrCreateSupplier("Europ Foods");
  const rows = await loadPendingConflicts(input.importRunId);
  const offers = await loadSupplierOffers(supplier.id, run.import_batch);
  const classified = classifyRows({ run, rows, offers });
  const selected = classified.filter((item) => input.importAllImportable || input.conflictIds?.includes(item.id));
  const importableIds = new Set(selected.filter((item) => item.classification === "importable_variant").map((item) => item.id));
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const productsToImport: Array<{ conflictId: string; product: SupplierImportProduct }> = [];
  const importedIdentities = new Set<string>();
  const skipped: Array<{ conflictId: string; reason: string }> = [];

  for (const item of selected) {
    if (!importableIds.has(item.id)) {
      skipped.push({ conflictId: item.id, reason: item.reason });
      continue;
    }
    const row = rowsById.get(item.id);
    const product = row ? conflictProduct(row, run) : undefined;
    if (!product) {
      skipped.push({ conflictId: item.id, reason: "Stored row could not be parsed." });
      continue;
    }
    const identity = groupKey(product);
    if (importedIdentities.has(identity)) {
      skipped.push({ conflictId: item.id, reason: "Exact repeat selected more than once." });
      continue;
    }
    importedIdentities.add(identity);
    productsToImport.push({ conflictId: item.id, product });
  }

  if (!productsToImport.length) {
    return { createdProducts: 0, supplierOffersCreated: 0, skipped, imported: [] as Array<{ conflictId: string; productCode: string }> };
  }

  const reservedCodes = await supabaseAdminFetch<ReservedCode[]>("rpc/reserve_nancy_product_codes", {
    method: "POST",
    body: { p_count: productsToImport.length },
  });
  const productRows = productsToImport.map((item, index) => buildProductRow(item.product, reservedCodes[index].product_code));
  const insertedProducts = await supabaseAdminFetch<Array<{ id: string }>>("products", {
    method: "POST",
    body: productRows,
  });
  const offerRows = productsToImport.map((item, index) => buildOfferRow(item.product, reservedCodes[index].product_code, supplier.id));
  const insertedOffers = await supabaseAdminFetch<Array<{ id: string }>>("supplier_product_offers", {
    method: "POST",
    body: offerRows,
  });

  for (let index = 0; index < productsToImport.length; index += 1) {
    const productCode = reservedCodes[index].product_code;
    await supabaseAdminFetch(`product_import_conflicts?id=eq.${encodeURIComponent(productsToImport[index].conflictId)}`, {
      method: "PATCH",
      body: {
        resolution: "import_as_new",
        incoming_product_id: productCode,
        resolved_by: "admin",
        resolved_at: new Date().toISOString(),
        reason: "Recovered as new Europ Foods draft product.",
      },
    });
  }

  await supabaseAdminFetch(`product_import_runs?id=eq.${encodeURIComponent(input.importRunId)}`, {
    method: "PATCH",
    body: {
      created_product_count: run.created_product_count + insertedProducts.length,
      updated_offer_count: run.updated_offer_count + insertedOffers.length,
      skipped_count: Math.max(0, run.skipped_count - insertedProducts.length),
      report_json: {
        ...(run.report_json ?? {}),
        recovery: {
          recoveredAt: new Date().toISOString(),
          createdProducts: insertedProducts.length,
          supplierOffersCreated: insertedOffers.length,
          skipped,
        },
      },
    },
  });

  await logAdminAction({
    recordType: "supplier_import",
    recordId: input.importRunId,
    action: "recover_europ_foods_conflicts",
    metadata: {
      createdProducts: insertedProducts.length,
      supplierOffersCreated: insertedOffers.length,
      conflictIds: productsToImport.map((item) => item.conflictId),
    },
  });

  return {
    createdProducts: insertedProducts.length,
    supplierOffersCreated: insertedOffers.length,
    skipped,
    imported: productsToImport.map((item, index) => ({ conflictId: item.conflictId, productCode: reservedCodes[index].product_code })),
  };
}
