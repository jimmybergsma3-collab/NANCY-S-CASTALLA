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

  return product.unit;
}
