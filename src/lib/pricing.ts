import type { Product } from "@/types/product";

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function getSupplierPackQuantity(packSize: string) {
  const value = packSize.trim();
  const leadingQuantity = /^(?:box\s*)?(\d+)\s*x/i.exec(value);
  const parenthesizedQuantity = /\(x\s*(\d+)\)/i.exec(value);
  return Number(leadingQuantity?.[1] ?? parenthesizedQuantity?.[1] ?? 1);
}

export function calculateUnitCost(caseCostExVat: number, packSize: string) {
  const quantity = getSupplierPackQuantity(packSize);
  return quantity > 0 ? roundMoney(caseCostExVat / quantity) : roundMoney(caseCostExVat);
}

export function calculatePricing(product: Pick<Product, "costPriceExVat" | "unitCost" | "vatRate" | "salePriceInclVat">) {
  const purchaseCostPerUnit = product.unitCost > 0 ? product.unitCost : product.costPriceExVat;
  const salePriceExVat = product.vatRate > -100 ? product.salePriceInclVat / (1 + product.vatRate / 100) : 0;
  const ivaAmount = product.salePriceInclVat - salePriceExVat;
  const profitPerUnit = roundMoney(salePriceExVat - purchaseCostPerUnit);
  const marginPercent = salePriceExVat > 0 ? Math.round((profitPerUnit / salePriceExVat) * 100) : 0;
  const markupPercent = purchaseCostPerUnit > 0 ? Math.round((profitPerUnit / purchaseCostPerUnit) * 100) : 0;

  return {
    purchaseCostPerUnit: roundMoney(purchaseCostPerUnit),
    salePriceExVat: roundMoney(salePriceExVat),
    ivaAmount: roundMoney(ivaAmount),
    profitPerUnit,
    marginPercent,
    markupPercent,
  };
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
