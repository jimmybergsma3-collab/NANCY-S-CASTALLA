import type { Product } from "@/types/product";
import type { SupplierImportConflictSample, SupplierImportParseResult, SupplierImportPreviewReport, SupplierImportProduct } from "@/types/imports";

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

function findNextProductCode(products: Product[]) {
  const highest = products.reduce((max, product) => {
    const match = /^NC-(\d{5})$/i.exec(product.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `NC-${String(highest + 1).padStart(5, "0")}`;
}

function addToMap(map: Map<string, string[]>, key: string, productId: string) {
  if (!key) return;
  map.set(key, [...(map.get(key) ?? []), productId]);
}

function productNamePackageKey(product: Product) {
  return `${normalizeText(product.name)}|${normalizePackage(product.unit || product.packSize || "")}`;
}

function normalizePrice(value?: number) {
  return value === undefined || !Number.isFinite(value) ? "" : value.toFixed(4);
}

function importSourceIdentity(product: SupplierImportProduct) {
  return [
    normalizeCode(product.supplier),
    normalizeCode(product.supplierCode),
    normalizeText(product.supplierProductName),
    normalizePackage(product.packageDescription),
    normalizePrice(product.casePrice ?? product.priceExVat),
    normalizePrice(product.unitPrice),
  ].join("|");
}

export function buildImportPreview(parseResult: SupplierImportParseResult, existingProducts: Product[]): SupplierImportPreviewReport {
  const activeProducts = existingProducts.filter((product) => (product.lifecycleStatus ?? "active") === "active");
  const archivedProducts = existingProducts.filter((product) => product.lifecycleStatus === "archived");

  const activeBySupplierCode = new Map<string, string[]>();
  const archivedBySupplierCode = new Map<string, string[]>();
  const activeByEan = new Map<string, string[]>();
  const archivedByEan = new Map<string, string[]>();
  const activeByNamePackage = new Map<string, string[]>();
  const archivedByNamePackage = new Map<string, string[]>();

  for (const product of activeProducts) {
    addToMap(activeBySupplierCode, `${normalizeCode(product.supplier)}|${normalizeCode(product.supplierCode)}`, product.id);
    addToMap(activeByEan, normalizeEan(product.ean ?? ""), product.id);
    addToMap(activeByNamePackage, productNamePackageKey(product), product.id);
  }

  for (const product of archivedProducts) {
    addToMap(archivedBySupplierCode, `${normalizeCode(product.supplier)}|${normalizeCode(product.supplierCode)}`, product.id);
    addToMap(archivedByEan, normalizeEan(product.ean ?? ""), product.id);
    addToMap(archivedByNamePackage, productNamePackageKey(product), product.id);
  }

  const incomingSupplierCodeGroups = new Map<string, SupplierImportProduct[]>();
  const incomingIdentityGroups = new Map<string, SupplierImportProduct[]>();
  for (const product of parseResult.products) {
    const supplierKey = `${normalizeCode(product.supplier)}|${normalizeCode(product.supplierCode)}`;
    incomingSupplierCodeGroups.set(supplierKey, [...(incomingSupplierCodeGroups.get(supplierKey) ?? []), product]);
    const identityKey = importSourceIdentity(product);
    incomingIdentityGroups.set(identityKey, [...(incomingIdentityGroups.get(identityKey) ?? []), product]);
  }

  let possibleActiveMatches = 0;
  let possibleArchivedMatches = 0;
  let possibleInFileDuplicates = 0;
  const conflictSamples: SupplierImportConflictSample[] = [];

  for (const product of parseResult.products) {
    const matches: SupplierImportConflictSample["matches"] = [];
    const supplierKey = `${normalizeCode(product.supplier)}|${normalizeCode(product.supplierCode)}`;
    const eanKey = normalizeEan(product.ean);

    const activeSupplier = activeBySupplierCode.get(supplierKey);
    const archivedSupplier = archivedBySupplierCode.get(supplierKey);
    const activeEan = eanKey ? activeByEan.get(eanKey) : undefined;
    const archivedEan = eanKey ? archivedByEan.get(eanKey) : undefined;
    const inFileSupplier = incomingSupplierCodeGroups.get(supplierKey);
    const inFileIdentity = incomingIdentityGroups.get(importSourceIdentity(product));
    const supplierCodeIdentityCount = new Set((inFileSupplier ?? []).map(importSourceIdentity)).size;

    if (activeEan?.length) matches.push({ type: "active_ean", productIds: activeEan.slice(0, 5), reason: "Exact EAN match with active product." });
    if (activeSupplier?.length) matches.push({ type: "active_supplier_code", productIds: activeSupplier.slice(0, 5), reason: "Same supplier and supplier code on active product." });
    if (archivedEan?.length) matches.push({ type: "archived_ean", productIds: archivedEan.slice(0, 5), reason: "Exact EAN match with archived product; never restore automatically." });
    if (archivedSupplier?.length) matches.push({ type: "archived_supplier_code", productIds: archivedSupplier.slice(0, 5), reason: "Same supplier and supplier code on archived product; never update automatically." });
    if ((inFileIdentity?.length ?? 0) > 1 || supplierCodeIdentityCount > 1) {
      matches.push({
        type: "in_file_duplicate",
        reason: supplierCodeIdentityCount > 1
          ? "Same supplier code has different name, package or price."
          : "Exact repeated source listing inside the same supplier file.",
      });
    }

    if (matches.some((match) => match.type.startsWith("active"))) possibleActiveMatches += 1;
    if (matches.some((match) => match.type.startsWith("archived"))) possibleArchivedMatches += 1;
    if (matches.some((match) => match.type === "in_file_duplicate")) possibleInFileDuplicates += 1;
    if (matches.length && conflictSamples.length < 25) {
      conflictSamples.push({
        incoming: {
          supplier: product.supplier,
          supplierCode: product.supplierCode,
          ean: product.ean,
          name: product.supplierProductName,
          packageDescription: product.packageDescription,
        },
        matches,
      });
    }
  }

  const duplicateSupplierCodeGroups = Array.from(incomingSupplierCodeGroups.entries())
    .filter(([, products]) => new Set(products.map(importSourceIdentity)).size > 1)
    .map(([key, products]) => ({
      supplierCode: key.split("|")[1],
      count: products.length,
      samples: products.slice(0, 5).map((product) => `${product.supplierProductName} (${product.packageDescription || "no package"})`),
    }));

  return {
    ...parseResult,
    databaseProductCount: existingProducts.length,
    activeProductCount: activeProducts.length,
    archivedProductCount: archivedProducts.length,
    nextProductCode: findNextProductCode(existingProducts),
    parsedProductCount: parseResult.products.length,
    duplicateSupplierCodeCount: duplicateSupplierCodeGroups.length,
    duplicateSupplierCodeGroups: duplicateSupplierCodeGroups.slice(0, 50),
    missingEanCount: parseResult.products.filter((product) => !product.ean).length,
    unclearPackageCount: parseResult.products.filter((product) => !product.packageDescription).length,
    missingPriceCount: parseResult.products.filter((product) => product.unitPrice === undefined && product.casePrice === undefined).length,
    possibleActiveMatches,
    possibleArchivedMatches,
    possibleInFileDuplicates,
    taxReviewRequiredCount: parseResult.products.filter((product) => product.needsTaxReview).length,
    categoryReviewRequiredCount: parseResult.products.filter((product) => product.needsCategoryReview).length,
    imageReviewRequiredCount: parseResult.products.filter((product) => product.needsImageReview).length,
    translationReviewRequiredCount: parseResult.products.filter((product) => product.needsTranslationReview).length,
    conflictSamples,
  };
}
