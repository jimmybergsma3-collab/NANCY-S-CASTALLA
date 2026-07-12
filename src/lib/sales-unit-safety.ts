import type { Product } from "@/types/product";

export type SalesUnitSafetyOffer = {
  casePrice?: number | null;
  unitPrice?: number | null;
  unitsPerCase?: number | null;
  packageDescription?: string | null;
};

export function isCaseLikePackage(value = "") {
  return /(?:^|\b)(?:\d+\s*[x×]\s*\d+|x\s*(?:2|4|6|8|10|12|20|24|36|40|48|72|80|100)\b|(?:2|4|6|8|10|12|20|24|36|40|48|72|80|100)\s*(?:pcs|st|units|x)\b)/i.test(value);
}

function near(a: number, b: number) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= Math.max(0.08, b * 0.12);
}

function positive(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function isSupplierImportProduct(product: Pick<Product, "importBatch">) {
  return String(product.importBatch ?? "").startsWith("IMPORT_2026_LIVE_");
}

export function evaluateSalesUnitSafety(product: Product, offer?: SalesUnitSafetyOffer) {
  if (!isSupplierImportProduct(product)) return { ok: true, reason: "" };

  const salePrice = positive(product.salePriceInclVat);
  const casePrice = positive(product.supplierCasePrice ?? offer?.casePrice ?? product.costPriceExVat);
  const unitPrice = positive(product.supplierUnitPrice ?? offer?.unitPrice ?? product.unitCost);
  const caseQuantity = positive(product.supplierCaseQuantity ?? offer?.unitsPerCase);
  const publicPackage = product.unit || "";
  const sourcePackage = product.sourcePackageText || offer?.packageDescription || product.packSize || "";
  const caseLikePublic = isCaseLikePackage(publicPackage);
  const caseLikeSource = isCaseLikePackage(sourcePackage);
  const salesUnitType = product.salesUnitType ?? "";
  const salesUnitQuantity = positive(product.salesUnitQuantity);

  if (!product.salesUnitConfirmed || !product.priceBasisConfirmed || !salesUnitType) {
    return { ok: false, reason: "Sales unit and price basis must be confirmed before this supplier import product can be sold." };
  }

  if (!salePrice) return { ok: false, reason: "Selling price is required." };
  if (!publicPackage.trim()) return { ok: false, reason: "Public package is required." };

  if (salesUnitType === "case") {
    if (casePrice > 0 && salePrice < casePrice) return { ok: false, reason: "Case sale price is below supplier case cost." };
  }

  if (salesUnitType === "single") {
    if (caseLikePublic) return { ok: false, reason: "Public package still looks like a case while sales unit is single." };
    if (unitPrice > 0 && salePrice < unitPrice) return { ok: false, reason: "Single sale price is below supplier unit cost." };
  }

  if (salesUnitType === "custom_pack") {
    if (salesUnitQuantity <= 0) return { ok: false, reason: "Custom pack quantity is required." };
    if (unitPrice > 0 && salePrice < unitPrice * salesUnitQuantity) return { ok: false, reason: "Custom pack sale price is below calculated pack cost." };
  }

  if ((caseLikePublic || caseLikeSource) && casePrice > 0 && salePrice < casePrice && salesUnitType === "case") {
    return { ok: false, reason: "Case-like product cannot be sold below case cost." };
  }

  if (caseLikePublic && unitPrice > 0 && near(salePrice, unitPrice) && salesUnitType !== "single") {
    return { ok: false, reason: "Public package looks like a case but selling price looks like supplier unit price." };
  }

  if (caseQuantity > 1 && salesUnitType === "case" && salesUnitQuantity > 0 && salesUnitQuantity !== caseQuantity) {
    return { ok: false, reason: "Case sales quantity does not match supplier case quantity." };
  }

  return { ok: true, reason: "" };
}
