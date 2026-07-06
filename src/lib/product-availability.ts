import type { ProductStatus } from "@/types/product";

export type AvailabilityCode = "available" | "coming_soon" | "insufficient_stock";

export function evaluateProductAvailability(input: {
  stockStatus: ProductStatus;
  trackInventory: boolean;
  stockQuantity: number;
  requestedUnits: number;
}): AvailabilityCode {
  if (input.stockStatus === "coming-soon") return "coming_soon";
  if (input.stockStatus === "preorder") return "available";
  if (input.trackInventory && input.requestedUnits > input.stockQuantity) return "insufficient_stock";
  return "available";
}
