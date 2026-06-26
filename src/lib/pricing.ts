import type { Product } from "@/types/product";

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculatePricing(product: Pick<Product, "costPriceExVat" | "vatRate" | "salePriceInclVat">) {
  const salePriceExVat = product.vatRate > -100 ? product.salePriceInclVat / (1 + product.vatRate / 100) : 0;
  const ivaAmount = product.salePriceInclVat - salePriceExVat;
  const profitPerUnit = roundMoney(salePriceExVat - product.costPriceExVat);
  const marginPercent = product.costPriceExVat > 0 ? Math.round((profitPerUnit / product.costPriceExVat) * 100) : 0;

  return {
    salePriceExVat: roundMoney(salePriceExVat),
    ivaAmount: roundMoney(ivaAmount),
    profitPerUnit,
    marginPercent,
  };
}

export function suggestedSalePriceInclVat(costPriceExVat: number, vatRate: number, targetMarginPercent = 50) {
  const salePriceExVat = costPriceExVat * (1 + targetMarginPercent / 100);
  return roundMoney(salePriceExVat * (1 + vatRate / 100));
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
