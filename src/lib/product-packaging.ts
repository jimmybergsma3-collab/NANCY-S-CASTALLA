import type { Product, ProductPackageOption } from "@/types/product";

export function getEffectivePackageOptions(product: Product): ProductPackageOption[] {
  if ((product.packageOptions ?? []).length > 0) {
    return product.packageOptions ?? [];
  }

  const match = /^x\s*(\d+)$/i.exec(product.unit.trim());
  const quantity = match ? Number(match[1]) : 1;

  if (quantity <= 1 || product.salePriceInclVat <= 0) {
    return [];
  }

  return [{
    label: `Pack of ${quantity}`,
    quantity,
    salePriceInclVat: Math.round(product.salePriceInclVat * quantity * 100) / 100,
  }];
}

export function getDisplayedProductPrice(product: Product) {
  return getEffectivePackageOptions(product)[0]?.salePriceInclVat ?? product.salePriceInclVat;
}

export function getCustomerDisplayUnit(product: Product) {
  const packageOption = getEffectivePackageOptions(product)[0];
  if (packageOption) {
    return packageOption.label;
  }

  const caseWithItemSize = /^\d+\s*x\s*(.+)$/i.exec(product.unit.trim());
  if (caseWithItemSize?.[1]) {
    return caseWithItemSize[1].trim();
  }

  if (/\(x\s*\d+\)$/i.test(product.unit.trim())) {
    return "1 piece";
  }

  return product.unit;
}
