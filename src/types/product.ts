export type ProductStatus = "available" | "preorder" | "coming-soon";
export type ProductType = "frozen" | "fresh" | "ambient";
export type ProductOrigin = "Dutch" | "British" | "Irish" | "South American" | "Other";

export type ProductCategory =
  | "Dutch products"
  | "British & Irish products"
  | "Frozen snacks"
  | "Bread & bakery"
  | "Breakfast products"
  | "Coffee & drinks"
  | "Sauces & condiments"
  | "South American products";

export type Product = {
  id: string;
  name: string;
  imageUrl?: string;
  category: ProductCategory;
  description: string;
  price: number;
  unit: string;
  stockStatus: ProductStatus;
  type: ProductType;
  origin: ProductOrigin;
  featured: boolean;
  costPriceExVat: number;
  vatRate: number;
  salePriceInclVat: number;
  marginPercent: number;
  profitPerUnit: number;
  supplier: string;
  supplierCode: string;
  packSize: string;
  unitCost: number;
};
