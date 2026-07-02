"use client";

import { useEffect, useState } from "react";
import type { BackofficeOrder, OrderStatus, PaymentStatus } from "@/types/backoffice";

const statuses: OrderStatus[] = ["new", "confirmed", "processing", "ready_for_collection", "shipped", "delivered", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];

export function OrdersPanel() {
  const [orders, setOrders] = useState<BackofficeOrder[]>([]);
  const [message, setMessage] = useState("Loading orders...");

  useEffect(() => { fetch("/api/admin/orders").then((response) => response.json()).then((data) => { setOrders(data.orders ?? []); setMessage(""); }).catch(() => setMessage("Orders could not be loaded.")); }, []);

  async function save(order: BackofficeOrder, patch: Partial<BackofficeOrder>) {
    const next = { ...order, ...patch };
    setOrders((current) => current.map((item) => item.id === order.id ? next : item));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: next.id, status: next.status, paymentStatus: next.payment_status }) });
  }

  if (message) return <p className="mt-6 text-sm text-forest/65">{message}</p>;
  return <div className="mt-6 overflow-x-auto rounded-md border border-forest/10 bg-white"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-forest text-cream"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Payment</th></tr></thead><tbody>{orders.map((order) => <tr className="border-t border-forest/10" key={order.id}><td className="p-3 font-bold">{order.order_number ? `NC-${String(order.order_number).padStart(6, "0")}` : order.id}</td><td className="p-3">{order.customer_name}<br/><span className="text-xs text-forest/55">{order.customer_email}</span></td><td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td><td className="p-3">€{Number(order.total).toFixed(2)}</td><td className="p-3"><select className="rounded border p-2" value={order.status} onChange={(event) => save(order, { status: event.target.value as OrderStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td><td className="p-3"><select className="rounded border p-2" value={order.payment_status} onChange={(event) => save(order, { payment_status: event.target.value as PaymentStatus })}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>{orders.length === 0 ? <p className="p-5 text-forest/60">No orders yet.</p> : null}</div>;
}
