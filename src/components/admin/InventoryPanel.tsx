"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  minimum_stock: number;
};

type Movement = {
  id: string;
  product_id: string | null;
  order_id: string | null;
  purchase_order_id?: string | null;
  supplier_invoice_id?: string | null;
  goods_receipt_id?: string | null;
  movement_type: string;
  quantity: number;
  resulting_quantity?: number | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

export function InventoryPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function loadInventory() {
    const response = await fetch("/api/admin/inventory");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message ?? "Inventory could not be loaded.");
    setRows(data.products ?? []);
    setMovements(data.movements ?? []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInventory().catch((error) => setMessage(error instanceof Error ? error.message : "Inventory could not be loaded."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function adjust(row: Row) {
    const quantity = Number(adjustments[row.id]);
    if (!Number.isFinite(quantity) || quantity === 0) return;
    setMessage("");
    const response = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: row.id, quantity, reference: "Backoffice adjustment" }),
    });
    const data = await response.json();
    if (response.ok) {
      setRows((current) => current.map((item) => (item.id === row.id ? data.product : item)));
      setAdjustments((current) => ({ ...current, [row.id]: "" }));
      loadInventory().catch(() => undefined);
    } else {
      setMessage(data.message ?? "Inventory could not be updated.");
    }
  }

  return (
    <div className="mt-6 grid gap-6">
      {message ? <p className="rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-forest">{message}</p> : null}
      <section className="grid gap-3">
        {rows.map((row) => (
          <div className="grid gap-3 rounded-md border border-forest/10 bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={row.id}>
            <div>
              <strong>{row.name}</strong>
              <p className="text-xs text-forest/55">{row.sku || row.id}</p>
            </div>
            <p className={Number(row.stock_quantity) <= Number(row.minimum_stock) ? "font-bold text-red-700" : "font-bold text-forest"}>
              {row.stock_quantity} in stock - minimum {row.minimum_stock}
            </p>
            <div className="flex gap-2">
              <input
                aria-label={`Adjustment for ${row.name}`}
                className="w-24 rounded border px-3 py-2"
                onChange={(event) => setAdjustments((current) => ({ ...current, [row.id]: event.target.value }))}
                placeholder="+12 / -1"
                type="number"
                value={adjustments[row.id] ?? ""}
              />
              <button className="rounded-md bg-forest px-3 py-2 font-bold text-cream" onClick={() => adjust(row)} type="button">
                Apply
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 ? <p className="text-sm text-forest/65">Enable inventory tracking on products to manage stock here.</p> : null}
      </section>
      <section className="rounded-md border border-forest/10 bg-white p-4">
        <h2 className="font-serif text-2xl text-forest">Inventory history</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-forest/55">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Result</th>
                <th className="py-2 pr-4">Reference</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr className="border-t border-forest/10" key={movement.id}>
                  <td className="py-2 pr-4">{movement.created_at ? new Date(movement.created_at).toLocaleString() : "-"}</td>
                  <td className="py-2 pr-4 font-semibold">{movement.movement_type}</td>
                  <td className="py-2 pr-4">{movement.product_id ?? "-"}</td>
                  <td className="py-2 pr-4">{movement.quantity}</td>
                  <td className="py-2 pr-4">{movement.resulting_quantity ?? "-"}</td>
                  <td className="py-2 pr-4">{movement.reference ?? movement.purchase_order_id ?? movement.order_id ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {movements.length === 0 ? <p className="mt-3 text-sm text-forest/65">No inventory movements recorded yet.</p> : null}
      </section>
    </div>
  );
}
