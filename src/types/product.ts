export type ProductStatus = "available" | "preorder" | "coming-soon";
export type ProductType = "frozen" | "fresh" | "ambient";
export type ProductOrigin = "Dutch" | "British" | "Irish" | "German" | "Scandinavian" | "Asian" | "Indonesian" | "South American" | "Other";

export type ProductCategory =
  | "Dutch products"
  | "British & Irish products"
  | "German products"
  | "Scandinavian products"
  | "Asian & Indonesian products"
  | "South American products"
  | "Frozen snacks"
  | "Bread & bakery"
  | "Breakfast products"
  | "Coffee & drinks"
  | "Sauces & condiments"
  | "Non-food & packaging";

export type ProductPackageOption = {
  label: string;
  quantity: number;
  salePriceInclVat: number;
};

export type Product = {
  id: string;
  name: string;
  imageUrl?: string;
  isVisible?: boolean;
  category: ProductCategory;
  categories?: ProductCategory[];
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
  packageOptions?: ProductPackageOption[];
  ingredients?: string;
  directions?: string;
  conservation?: string;
  additionalInfo?: string;
};
