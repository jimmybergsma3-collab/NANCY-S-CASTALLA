import { products as localProducts } from "@/data/products";
import type { Product } from "@/types/product";
import { hasSupabaseAdmin } from "./env";
import { supabaseAdminFetch } from "./supabase-rest";

type ProductRow = {
  id: string;
  name: string;
  image_url?: string;
  category: Product["category"];
  description: string;
  price: number;
  unit: string;
  stock_status: Product["stockStatus"];
  type: Product["type"];
  origin: Product["origin"];
  featured: boolean;
  cost_price_ex_vat: number;
  vat_rate: number;
  sale_price_incl_vat: number;
  margin_percent: number;
  profit_per_unit: number;
  supplier: string;
  supplier_code: string;
  pack_size: string;
  unit_cost: number;
  package_options?: Product["packageOptions"];
};

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url ?? "",
    category: row.category,
    description: row.description,
    price: row.price,
    unit: row.unit,
    stockStatus: row.stock_status,
    type: row.type,
    origin: row.origin,
    featured: row.featured,
    costPriceExVat: row.cost_price_ex_vat,
    vatRate: row.vat_rate,
    salePriceInclVat: row.sale_price_incl_vat,
    marginPercent: row.margin_percent,
    profitPerUnit: row.profit_per_unit,
    supplier: row.supplier,
    supplierCode: row.supplier_code,
    packSize: row.pack_size,
    unitCost: row.unit_cost,
    packageOptions: row.package_options ?? [],
  };
}

export function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    image_url: product.imageUrl ?? "",
    category: product.category,
    description: product.description,
    price: product.price,
    unit: product.unit,
    stock_status: product.stockStatus,
    type: product.type,
    origin: product.origin,
    featured: product.featured,
    cost_price_ex_vat: product.costPriceExVat,
    vat_rate: product.vatRate,
    sale_price_incl_vat: product.salePriceInclVat,
    margin_percent: product.marginPercent,
    profit_per_unit: product.profitPerUnit,
    supplier: product.supplier,
    supplier_code: product.supplierCode,
    pack_size: product.packSize,
    unit_cost: product.unitCost,
    package_options: product.packageOptions ?? [],
  };
}

export async function getProducts() {
  if (!hasSupabaseAdmin()) {
    return localProducts;
  }

  try {
    const rows = await supabaseAdminFetch<ProductRow[]>("products?select=*&order=category.asc,name.asc");
    return rows.map(rowToProduct);
  } catch {
    return localProducts;
  }
}

export async function getProductById(id: string) {
  const products = await getProducts();
  return products.find((product) => product.id.toLowerCase() === id.toLowerCase());
}

export async function createProduct(product: Product) {
  const rows = await supabaseAdminFetch<ProductRow[]>("products?on_conflict=id", {
    method: "POST",
    body: productToRow(product),
    prefer: "resolution=merge-duplicates,return=representation",
  });
  return rowToProduct(rows[0]);
}
