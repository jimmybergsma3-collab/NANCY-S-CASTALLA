export type ProductStatus = "available" | "preorder" | "coming-soon";
export type ProductLifecycleStatus = "active" | "archived" | "disabled" | "draft";
export type ProductType = "frozen" | "fresh" | "ambient";
export type ProductOrigin = "Dutch" | "British" | "Irish" | "German" | "Scandinavian" | "Asian" | "Indonesian" | "South American" | "Other";

export type ProductCategory =
  | "Dutch products"
  | "British & Irish products"
  | "German products"
  | "Scandinavian products"
  | "Asian & Indonesian products"
  | "South American products"
  | "Vegan & vegetarian"
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
  uuid?: string;
  sku?: string;
  ean?: string;
  name: string;
  imageUrl?: string;
  images?: string[];
  isVisible?: boolean;
  isNew?: boolean;
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
