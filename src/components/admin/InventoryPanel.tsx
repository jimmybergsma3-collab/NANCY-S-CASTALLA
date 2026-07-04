"use client";

import { useEffect, useState } from "react";

type Row = { id: string; name: string; sku: string; stock_quantity: number; minimum_stock: number };

export function InventoryPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/admin/inventory").then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.message); setRows(data.products ?? []); }).catch((error) => setMessage(error instanceof Error ? error.message : "Inventory could not be loaded.")); }, []);
  async function adjust(row: Row) { const quantity = Number(adjustments[row.id]); if (!Number.isFinite(quantity) || quantity === 0) return; setMessage(""); const response = await fetch("/api/admin/inventory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: row.id, quantity, reference: "Backoffice adjustment" }) }); const data = await response.json(); if (response.ok) { setRows((current) => current.map((item) => item.id === row.id ? data.product : item)); setAdjustments((current) => ({ ...current, [row.id]: "" })); } else setMessage(data.message ?? "Inventory could not be updated."); }
  return <div className="mt-6 grid gap-3">{message ? <p className="rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-forest">{message}</p> : null}{rows.map((row) => <div className="grid gap-3 rounded-md border border-forest/10 bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={row.id}><div><strong>{row.name}</strong><p className="text-xs text-forest/55">{row.sku || row.id}</p></div><p className={Number(row.stock_quantity) <= Number(row.minimum_stock) ? "font-bold text-red-700" : "font-bold text-forest"}>{row.stock_quantity} in stock · minimum {row.minimum_stock}</p><div className="flex gap-2"><input aria-label={`Adjustment for ${row.name}`} className="w-24 rounded border px-3 py-2" onChange={(event) => setAdjustments((current) => ({ ...current, [row.id]: event.target.value }))} placeholder="+12 / -1" type="number" value={adjustments[row.id] ?? ""}/><button className="rounded-md bg-forest px-3 py-2 font-bold text-cream" onClick={() => adjust(row)} type="button">Apply</button></div></div>)}{rows.length === 0 ? <p className="text-sm text-forest/65">Enable inventory tracking on products to manage stock here.</p> : null}</div>;
}
