import { products as localProducts } from "@/data/products";
import type { Product } from "@/types/product";
import { hasSupabaseAdmin } from "./env";
import { supabaseAdminFetch } from "./supabase-rest";
import { getProductCategories } from "./product-categories";
import { evaluateSalesUnitSafety } from "./sales-unit-safety";

type ProductRow = {
  id: string;
  uuid?: string;
  sku?: string;
  ean?: string;
  name: string;
  image_url?: string;
  images?: string[];
  is_visible?: boolean;
  is_new?: boolean;
  product_status?: Product["lifecycleStatus"];
  import_batch?: string;
  archived_at?: string;
  category: Product["category"];
  categories?: Product["categories"];
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
  sales_unit_type?: Product["salesUnitType"];
  sales_unit_quantity?: number;
  sales_unit_confirmed?: boolean;
  price_basis_confirmed?: boolean;
  supplier_case_price?: number;
  supplier_unit_price?: number;
  supplier_case_quantity?: number;
  source_package_text?: string;
  stock_quantity?: number;
  minimum_stock?: number;
  track_inventory?: boolean;
  weight?: string;
  package_options?: Product["packageOptions"];
  ingredients?: string;
  directions?: string;
  conservation?: string;
  additional_info?: string;
};

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    uuid: row.uuid ?? "",
    sku: row.sku ?? row.id,
    ean: row.ean ?? "",
    name: row.name,
    imageUrl: row.image_url ?? "",
    images: row.images ?? (row.image_url ? [row.image_url] : []),
    isVisible: row.is_visible ?? true,
    isNew: row.is_new ?? false,
    lifecycleStatus: row.product_status ?? "active",
    importBatch: row.import_batch ?? "",
    archivedAt: row.archived_at ?? "",
    category: row.category,
    categories: row.categories?.length ? row.categories : [row.category],
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
    salesUnitType: row.sales_unit_type ?? "",
    salesUnitQuantity: row.sales_unit_quantity ?? 0,
    salesUnitConfirmed: row.sales_unit_confirmed ?? false,
    priceBasisConfirmed: row.price_basis_confirmed ?? false,
    supplierCasePrice: row.supplier_case_price ?? 0,
    supplierUnitPrice: row.supplier_unit_price ?? 0,
    supplierCaseQuantity: row.supplier_case_quantity ?? 0,
    sourcePackageText: row.source_package_text ?? "",
    stockQuantity: row.stock_quantity ?? 0,
    minimumStock: row.minimum_stock ?? 0,
    trackInventory: row.track_inventory ?? false,
    weight: row.weight ?? "",
    packageOptions: row.package_options ?? [],
    ingredients: row.ingredients ?? "",
    directions: row.directions ?? "",
    conservation: row.conservation ?? "",
    additionalInfo: row.additional_info ?? "",
  };
}

export function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    uuid: product.uuid || undefined,
    sku: product.sku || product.id,
    ean: product.ean ?? "",
    name: product.name,
    image_url: product.imageUrl ?? "",
    images: product.images ?? (product.imageUrl ? [product.imageUrl] : []),
    is_visible: product.isVisible ?? false,
    is_new: product.isNew ?? false,
    product_status: product.lifecycleStatus ?? "active",
    import_batch: product.importBatch ?? "",
    archived_at: product.archivedAt || undefined,
    category: product.category,
    categories: getProductCategories(product),
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
    sales_unit_type: product.salesUnitType ?? "",
    sales_unit_quantity: product.salesUnitQuantity ?? 0,
    sales_unit_confirmed: product.salesUnitConfirmed ?? false,
    price_basis_confirmed: product.priceBasisConfirmed ?? false,
    supplier_case_price: product.supplierCasePrice ?? 0,
    supplier_unit_price: product.supplierUnitPrice ?? 0,
    supplier_case_quantity: product.supplierCaseQuantity ?? 0,
    source_package_text: product.sourcePackageText ?? "",
    stock_quantity: product.stockQuantity ?? 0,
    minimum_stock: product.minimumStock ?? 0,
    track_inventory: product.trackInventory ?? false,
    weight: product.weight ?? "",
    package_options: product.packageOptions ?? [],
    ingredients: product.ingredients ?? "",
    directions: product.directions ?? "",
    conservation: product.conservation ?? "",
    additional_info: product.additionalInfo ?? "",
  };
}

async function getAllProductRows() {
  const pageSize = 1000;
  const rows: ProductRow[] = [];

  for (let page = 0; page < 20; page += 1) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const pageRows = await supabaseAdminFetch<ProductRow[]>("products?select=*&order=id.asc", {
      range: { from, to },
    });

    rows.push(...pageRows);

    if (pageRows.length < pageSize) {
      break;
    }
  }

  return rows;
}

function isActivePublicProduct(product: Product) {
  return product.isVisible === true && (product.lifecycleStatus ?? "active") === "active" && evaluateSalesUnitSafety(product).ok;
}

export async function getProducts({ includeHidden = false, includeArchived = false }: { includeHidden?: boolean; includeArchived?: boolean } = {}) {
  if (!hasSupabaseAdmin()) {
    return includeHidden ? localProducts : localProducts.filter(isActivePublicProduct);
  }

  try {
    const rows = await getAllProductRows();
    const products = rows.map(rowToProduct);
    if (includeArchived) return products;
    return includeHidden ? products.filter((product) => (product.lifecycleStatus ?? "active") === "active") : products.filter(isActivePublicProduct);
  } catch {
    return includeHidden ? localProducts : localProducts.filter(isActivePublicProduct);
  }
}

export async function getHomepageProducts(limit = 8) {
  if (!hasSupabaseAdmin()) {
    return localProducts.filter((product) => product.isVisible !== false && product.featured && product.imageUrl).slice(0, limit);
  }

  try {
    const featuredRows = await supabaseAdminFetch<ProductRow[]>(
      `products?select=*&is_visible=eq.true&product_status=eq.active&featured=eq.true&image_url=neq.&order=id.asc&limit=${limit * 3}`,
    );
    const featured = featuredRows.map(rowToProduct).filter((product) => product.imageUrl?.trim());
    if (featured.length >= limit) return featured.slice(0, limit);

    const fallbackRows = await supabaseAdminFetch<ProductRow[]>(
      `products?select=*&is_visible=eq.true&product_status=eq.active&image_url=neq.&order=id.asc&limit=${limit * 4}`,
    );
    const fallback = fallbackRows
      .map(rowToProduct)
      .filter((product) => product.imageUrl?.trim() && !featured.some((item) => item.id === product.id));
    return [...featured, ...fallback].slice(0, limit);
  } catch {
    return localProducts.filter((product) => product.isVisible !== false && product.featured && product.imageUrl).slice(0, limit);
  }
}

export async function getProductById(id: string, { includeHidden = false }: { includeHidden?: boolean } = {}) {
  const products = await getProducts({ includeHidden });
  return products.find((product) => product.id.toLowerCase() === id.toLowerCase());
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  if (!hasSupabaseAdmin()) return localProducts.filter((product) => ids.includes(product.id));
  const escaped = ids.map((id) => `"${id.replaceAll('"', '')}"`).join(",");
  const rows = await supabaseAdminFetch<ProductRow[]>(`products?select=*&id=in.(${encodeURIComponent(escaped)})&product_status=eq.active`);
  return rows.map(rowToProduct).filter((product) => (product.lifecycleStatus ?? "active") === "active");
}

export async function createProduct(product: Product) {
  const existing = await supabaseAdminFetch<ProductRow[]>(`products?select=id,product_status&id=eq.${encodeURIComponent(product.id)}&limit=1`);
  if (existing[0]?.product_status === "archived") {
    throw new Error("Archived products are protected. Restore the product first or use a new product code for a new import.");
  }
  const rows = await supabaseAdminFetch<ProductRow[]>("products?on_conflict=id", {
    method: "POST",
    body: productToRow(product),
    prefer: "resolution=merge-duplicates,return=representation",
  });
  return rowToProduct(rows[0]);
}

export async function deleteProduct(id: string) {
  const rows = await supabaseAdminFetch<ProductRow[]>(`products?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { product_status: "archived", is_visible: false, featured: false, archived_at: new Date().toISOString() },
  });
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function archiveCurrentCatalogue(importBatch = "IMPORT_2026_PRELAUNCH") {
  return supabaseAdminFetch<number>("rpc/archive_current_catalogue", { method: "POST", body: { p_import_batch: importBatch } });
}

export async function restoreArchivedProduct(id: string) {
  const rows = await supabaseAdminFetch<ProductRow[]>("rpc/restore_archived_product", { method: "POST", body: { p_product_id: id } });
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}
