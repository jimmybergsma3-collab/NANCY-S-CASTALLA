import { hasSupabaseAdmin } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

type InventoryRow = {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  minimum_stock: number;
  track_inventory: boolean;
};

export async function listInventory() {
  if (!hasSupabaseAdmin()) return [];
  return supabaseAdminFetch<InventoryRow[]>(
    "products?select=id,name,sku,stock_quantity,minimum_stock,track_inventory&track_inventory=eq.true&order=name.asc",
  );
}

export async function adjustInventory(productId: string, quantity: number, reference = "Manual adjustment") {
  const rows = await supabaseAdminFetch<InventoryRow[]>(
    `products?select=id,name,sku,stock_quantity,minimum_stock,track_inventory&id=eq.${encodeURIComponent(productId)}&limit=1`,
  );
  const product = rows[0];
  if (!product) throw new Error("Product not found.");
  const nextStock = Math.max(0, Number(product.stock_quantity) + quantity);
  await supabaseAdminFetch(`products?id=eq.${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: { stock_quantity: nextStock },
  });
  await supabaseAdminFetch("inventory_movements", {
    method: "POST",
    body: { product_id: productId, movement_type: quantity >= 0 ? "delivery" : "adjustment", quantity, reference },
  });
  return { ...product, stock_quantity: nextStock };
}
