import type { Product } from "@/types/product";

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculatePricing(product: Pick<Product, "costPriceExVat" | "vatRate" | "salePriceInclVat">) {
  const costInclVat = product.costPriceExVat * (1 + product.vatRate / 100);
  const profitPerUnit = roundMoney(product.salePriceInclVat - costInclVat);
  const marginPercent = product.costPriceExVat > 0 ? Math.round((profitPerUnit / product.costPriceExVat) * 100) : 0;

  return {
    costInclVat: roundMoney(costInclVat),
    profitPerUnit,
    marginPercent,
  };
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
