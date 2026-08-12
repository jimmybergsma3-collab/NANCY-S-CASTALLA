import { hasSupabaseAdmin } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

export type InventoryRow = {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  minimum_stock: number;
  track_inventory: boolean;
};

export type InventoryMovementRow = {
  id: string;
  product_id: string | null;
  order_id: string | null;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
  purchase_order_id?: string | null;
  supplier_invoice_id?: string | null;
  goods_receipt_id?: string | null;
  resulting_quantity?: number | null;
};

export async function listInventory() {
  if (!hasSupabaseAdmin()) return [];
  return supabaseAdminFetch<InventoryRow[]>(
    "products?select=id,name,sku,stock_quantity,minimum_stock,track_inventory&track_inventory=eq.true&order=name.asc",
  );
}

export async function listRecentInventoryMovements(limit = 80) {
  if (!hasSupabaseAdmin()) return [];
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
  try {
    return await supabaseAdminFetch<InventoryMovementRow[]>(
      `inventory_movements?select=id,product_id,order_id,movement_type,quantity,reference,notes,created_at,purchase_order_id,supplier_invoice_id,goods_receipt_id,resulting_quantity&order=created_at.desc&limit=${safeLimit}`,
    );
  } catch {
    return supabaseAdminFetch<InventoryMovementRow[]>(
      `inventory_movements?select=id,product_id,order_id,movement_type,quantity,reference,notes,created_at&order=created_at.desc&limit=${safeLimit}`,
    );
  }
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
