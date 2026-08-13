export type ProductStatus = "available" | "preorder" | "coming-soon";
export type ProductLifecycleStatus = "active" | "archived" | "disabled" | "draft";
export type ProductType = "frozen" | "fresh" | "ambient";
export type ProductOrigin = "Dutch" | "British" | "Irish" | "German" | "Scandinavian" | "Asian" | "Indonesian" | "South American" | "Other";

export type ProductCategory =
  | "Breakfast"
  | "Pies & Pasties"
  | "Sunday Roast"
  | "Bread"
  | "Finger Foods"
  | "Fish"
  | "Meat"
  | "Barbecue & Grill"
  | "Tex Mex & Convenience Food"
  | "Ready Meals"
  | "Dutch / Belgian"
  | "Potato, Vegetable & Fruits"
  | "Vegan & Vegetarian"
  | "Sauces"
  | "Tinned Food"
  | "Baking & Cooking"
  | "Cakes & Desserts"
  | "Snacks & Sweets"
  | "Soft Drinks"
  | "Coffee & Tea"
  | "Non-food & Packaging";

export type ProductPackageOption = {
  label: string;
  quantity: number;
  salePriceInclVat: number;
};

export type SalesUnitType = "" | "case" | "single" | "custom_pack" | "per_kg" | "per_unit";

export type Product = {
  id: string;
  uuid?: string;
  sku?: string;
  ean?: string;
  name: string;
  imageUrl?: string;
  images?: string[];
  isVisible?: boolean;
  isNew?: boolean;
  readyForPublish?: boolean;
  lifecycleStatus?: ProductLifecycleStatus;
  importBatch?: string;
  archivedAt?: string;
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
  salesUnitType?: SalesUnitType;
  salesUnitQuantity?: number;
  salesUnitConfirmed?: boolean;
  priceBasisConfirmed?: boolean;
  supplierCasePrice?: number;
  supplierUnitPrice?: number;
  supplierCaseQuantity?: number;
  sourcePackageText?: string;
  stockQuantity?: number;
  minimumStock?: number;
  trackInventory?: boolean;
  weight?: string;
  packageOptions?: ProductPackageOption[];
  ingredients?: string;
  directions?: string;
  conservation?: string;
  additionalInfo?: string;
};
