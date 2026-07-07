"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ChevronRight, Download, FileText, Mail, MessageCircle, Phone, Send, ShoppingBag, UserRound } from "lucide-react";
import { formatEuro } from "@/lib/pricing";
import type { BackofficeOrder, BackofficeOrderItem, OrderStatus, PaymentStatus } from "@/types/backoffice";
import { businessConfig } from "@/config/business";
import { invoiceLabel } from "@/lib/invoice-format";

const statuses: OrderStatus[] = ["new", "confirmed", "processing", "ready_for_collection", "shipped", "delivered", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];
const addressPattern = /^(?:Address|Adres|Adresse|Dirección|Adress):\s*(.+)$/im;

function orderLabel(order: BackofficeOrder) {
  return order.order_number ? `NC-${String(order.order_number).padStart(6, "0")}` : order.id;
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function orderAddress(order: BackofficeOrder) {
  return order.notes?.match(addressPattern)?.[1]?.trim() || order.customer?.address?.trim() || "Not provided";
}

function visibleNotes(order: BackofficeOrder) {
  return order.notes?.replace(addressPattern, "").trim() || "No notes";
}

function lineTotal(line: BackofficeOrderItem) {
  return Number(line.line_total_incl_vat) || Number(line.quantity) * Number(line.sale_price_incl_vat);
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<BackofficeOrder[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("Loading orders...");
  const [saving, setSaving] = useState("");
  const [invoiceBusy, setInvoiceBusy] = useState("");
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.orders ?? []; })
      .then((loadedOrders: BackofficeOrder[]) => { setOrders(loadedOrders); setSelectedId(loadedOrders[0]?.id || ""); setNotesDraft(loadedOrders[0]?.notes ?? ""); setMessage(""); })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Orders could not be loaded."));
  }, []);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId), [orders, selectedId]);

  async function save(order: BackofficeOrder, patch: Partial<BackofficeOrder>) {
    const next = { ...order, ...patch };
    setSaving(order.id);
    setMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: next.id, status: next.status, paymentStatus: next.payment_status }),
    });
    const data = await response.json();
    setSaving("");
    if (!response.ok) { setMessage(data.message ?? "Order could not be updated."); return; }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...next, ...(data.order ?? {}), customer: item.customer, order_items: item.order_items } : item));
    if (data.email && !data.email.sent && !data.email.skipped) setMessage("Status saved, but the customer email could not be sent.");
  }

  async function invoiceAction(order: BackofficeOrder, action: "create" | "email", invoiceId?: string) {
    setInvoiceBusy(action); setMessage("");
    const response = await fetch("/api/admin/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "create" ? { action, orderId: order.id } : { action, invoiceId }) });
    const data = await response.json(); setInvoiceBusy("");
    if (!response.ok) { setMessage(data.message ?? "Invoice action failed."); return; }
    if (data.invoice) setOrders((current) => current.map((item) => item.id === order.id ? { ...item, invoices: [{ id: data.invoice.id, invoice_number: data.invoice.invoice_number, status: data.invoice.status, email_sent_at: data.invoice.email_sent_at, issued_at: data.invoice.issued_at, created_at: data.invoice.created_at }] } : item));
    setMessage(action === "create" ? "Invoice created." : data.email?.sent ? "Invoice emailed to the customer." : "Invoice saved, but email is not configured.");
  }

  async function saveNotes(order: BackofficeOrder) {
    setSaving(order.id); setMessage("");
    const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: order.id, action: "notes", notes: notesDraft }) });
    const data = await response.json(); setSaving("");
    if (!response.ok) { setMessage(data.message ?? "Notes could not be saved."); return; }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, notes: data.order?.notes ?? notesDraft } : item));
    setMessage("Notes saved.");
  }

  return (
    <div className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[430px_minmax(0,1fr)]">
      <section className="min-w-0">
        {message ? <p className="mb-4 rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-forest">{message}</p> : null}
        <div className="overflow-hidden rounded-md border border-forest/10 bg-white">
          <div className="border-b border-forest/10 bg-forest px-4 py-3 text-sm font-bold text-cream">Order overview</div>
          <div className="max-h-[72vh] overflow-y-auto">
            {orders.map((order) => (
              <button
                className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-forest/10 p-4 text-left transition last:border-b-0 ${selectedId === order.id ? "bg-cream" : "hover:bg-linen"}`}
                key={order.id}
                onClick={() => { setSelectedId(order.id); setNotesDraft(order.notes ?? ""); }}
                type="button"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2"><strong className="text-forest">{orderLabel(order)}</strong><span className="rounded-full bg-linen px-2 py-1 text-[11px] font-bold text-coffee">{statusLabel(order.status)}</span></span>
                  <span className="mt-2 block truncate text-sm font-bold text-forest">{order.customer_name}</span>
                  <span className="mt-1 block truncate text-xs text-forest/55">{order.customer_email}</span>
                  <span className="mt-2 block text-xs text-forest/55">{new Date(order.created_at).toLocaleString()} · {formatEuro(Number(order.total))}</span>
                </span>
                <ChevronRight className="text-coffee" size={19} />
              </button>
            ))}
            {!message && orders.length === 0 ? <p className="p-5 text-sm text-forest/60">No orders yet.</p> : null}
          </div>
        </div>
      </section>

      {selectedOrder ? <OrderDetail invoiceBusy={invoiceBusy} notesDraft={notesDraft} onInvoiceAction={invoiceAction} onNotesChange={setNotesDraft} onSave={save} onSaveNotes={saveNotes} order={selectedOrder} saving={saving === selectedOrder.id} /> : (
        <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-forest/20 bg-linen p-6 text-center text-sm text-forest/60">Select an order to view customer and product details.</div>
      )}
    </div>
  );
}

function OrderDetail({ invoiceBusy, notesDraft, onInvoiceAction, onNotesChange, onSave, onSaveNotes, order, saving }: { invoiceBusy: string; notesDraft: string; onInvoiceAction: (order: BackofficeOrder, action: "create" | "email", invoiceId?: string) => Promise<void>; onNotesChange: (notes: string) => void; onSave: (order: BackofficeOrder, patch: Partial<BackofficeOrder>) => Promise<void>; onSaveNotes: (order: BackofficeOrder) => Promise<void>; order: BackofficeOrder; saving: boolean }) {
  const phone = order.customer_phone || order.customer?.phone || "";
  const email = order.customer_email || order.customer?.email || "";
  const whatsappNumber = phone.replace(/\D/g, "");
  const items = order.order_items ?? [];
  const calculatedExVat = items.reduce((sum, item) => sum + (Number(item.line_total_ex_vat) || lineTotal(item) / (1 + Number(item.vat_rate) / 100)), 0);
  const subtotalExVat = Number(order.subtotal_ex_vat) || calculatedExVat;
  const vatTotal = Number(order.vat_total) || Math.max(0, Number(order.total) - subtotalExVat);
  const invoice = order.invoices?.[0];
  const canInvoice = ["confirmed", "ready_for_collection", "delivered"].includes(order.status) || order.payment_status === "paid";

  return (
    <section className="min-w-0 rounded-md border border-forest/10 bg-white shadow-soft">
      <header className="flex flex-col gap-4 border-b border-forest/10 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-coffee">Order detail</p><h2 className="mt-1 font-serif text-3xl font-bold text-forest">{orderLabel(order)}</h2><p className="mt-2 flex items-center gap-2 text-sm text-forest/60"><CalendarClock size={16} />{new Date(order.created_at).toLocaleString()}</p></div>
        <div className="flex flex-wrap gap-2">
          {phone ? <a className="inline-flex min-h-10 items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-sm font-bold text-forest" href={`tel:${phone}`}><Phone size={16} />Call</a> : null}
          {whatsappNumber ? <a className="inline-flex min-h-10 items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-bold text-cream" href={`https://wa.me/${whatsappNumber}`} rel="noreferrer" target="_blank"><MessageCircle size={16} />WhatsApp</a> : null}
          {email ? <a className="inline-flex min-h-10 items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-sm font-bold text-forest" href={`mailto:${email}?subject=${encodeURIComponent(`Nancy's Castalla order ${orderLabel(order)}`)}`}><Mail size={16} />Email</a> : null}
        </div>
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div className="rounded-md bg-linen p-4"><h3 className="flex items-center gap-2 font-serif text-xl font-bold text-forest"><UserRound size={19} />Customer</h3><dl className="mt-4 grid gap-3 text-sm"><DetailRow label="Name" value={order.customer_name || order.customer?.name} /><DetailRow label="Email" value={email} /><DetailRow label="Phone / WhatsApp" value={phone || "Not provided"} /><DetailRow label="Address" value={orderAddress(order)} /><DetailRow label="Language" value={(order.customer?.language || "Unknown").toUpperCase()} /></dl></div>
        <div className="rounded-md bg-linen p-4"><h3 className="flex items-center gap-2 font-serif text-xl font-bold text-forest"><ShoppingBag size={19} />Order</h3><dl className="mt-4 grid gap-3 text-sm"><DetailRow label="Order number" value={orderLabel(order)} /><DetailRow label="Fulfilment" value={order.delivery_method || order.fulfillment || "Not provided"} /><DetailRow label="Status" value={statusLabel(order.status)} /><DetailRow label="Payment" value={statusLabel(order.payment_status)} /><DetailRow label="Notes / preferred time" value={visibleNotes(order)} /></dl></div>
      </div>

      <div className="grid gap-4 border-y border-forest/10 p-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-forest">Order status<select className="mt-1 w-full rounded-md border border-forest/15 bg-white p-2 font-normal" disabled={saving} onChange={(event) => void onSave(order, { status: event.target.value as OrderStatus })} value={order.status}>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
        <label className="text-sm font-bold text-forest">Payment status<select className="mt-1 w-full rounded-md border border-forest/15 bg-white p-2 font-normal" disabled={saving} onChange={(event) => void onSave(order, { payment_status: event.target.value as PaymentStatus })} value={order.payment_status}>{paymentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
      </div>

      <div className="border-b border-forest/10 p-5"><label className="text-sm font-bold text-forest">Order notes<textarea className="mt-2 min-h-28 w-full rounded-md border border-forest/15 bg-white p-3 font-normal" maxLength={5000} onChange={(event) => onNotesChange(event.target.value)} value={notesDraft}/></label><button className="mt-3 rounded-md bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={saving || notesDraft === order.notes} onClick={() => void onSaveNotes(order)} type="button">{saving ? "Saving..." : "Save notes"}</button></div>

      <div className="border-b border-forest/10 bg-cream/45 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="flex items-center gap-2 font-serif text-xl font-bold text-forest"><FileText size={19} />Invoice</h3><p className="mt-1 text-sm text-forest/60">{invoice ? `${invoiceLabel(invoice)} · ${statusLabel(invoice.status)}` : canInvoice ? "This order is eligible for invoicing." : "Confirm, complete or mark the order as paid first."}</p>{!businessConfig.fiscalName || !businessConfig.fiscalId ? <p className="mt-2 text-sm font-bold text-red-700">Fiscal business details are incomplete. Invoice may not be legally complete.</p> : null}</div>
          <div className="flex flex-wrap gap-2">
            {!invoice ? <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={!canInvoice || Boolean(invoiceBusy)} onClick={() => void onInvoiceAction(order, "create")} type="button"><FileText size={16} />{invoiceBusy === "create" ? "Creating..." : "Create invoice"}</button> : <>
              <a className="inline-flex min-h-10 items-center gap-2 rounded-md border border-forest/15 bg-white px-3 py-2 text-sm font-bold text-forest" href={`/api/admin/invoices/${invoice.id}/pdf`}><Download size={16} />PDF</a>
              <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={Boolean(invoiceBusy)} onClick={() => void onInvoiceAction(order, "email", invoice.id)} type="button"><Send size={16} />{invoiceBusy === "email" ? "Sending..." : invoice.email_sent_at ? "Email again" : "Email customer"}</button>
            </>}
          </div>
        </div>
      </div>

      <div className="p-5"><h3 className="font-serif text-2xl font-bold text-forest">Ordered products</h3>{items.length === 0 ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Deze order heeft geen orderregels.</p> : <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-forest text-cream"><tr><th className="p-3">Product code</th><th className="p-3">Product</th><th className="p-3">Package</th><th className="p-3">Qty</th><th className="p-3">Unit price</th><th className="p-3">VAT</th><th className="p-3 text-right">Line total</th></tr></thead><tbody>{items.map((item) => <tr className="border-b border-forest/10" key={item.id}><td className="p-3 font-bold">{item.product_id || "-"}</td><td className="p-3">{item.product_name}</td><td className="p-3">{item.package_label || item.unit}</td><td className="p-3">{item.quantity}</td><td className="p-3">{formatEuro(Number(item.sale_price_incl_vat))}</td><td className="p-3">{Number(item.vat_rate)}%</td><td className="p-3 text-right font-bold">{formatEuro(lineTotal(item))}</td></tr>)}</tbody></table></div><div className="mt-4 grid gap-3 md:hidden">{items.map((item) => <article className="rounded-md border border-forest/10 p-4" key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-coffee">{item.product_id || "-"}</p><h4 className="mt-1 font-bold text-forest">{item.product_name}</h4></div><strong>{formatEuro(lineTotal(item))}</strong></div><dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-forest/65"><DetailRow label="Package" value={item.package_label || item.unit} /><DetailRow label="Quantity" value={String(item.quantity)} /><DetailRow label="Unit price" value={formatEuro(Number(item.sale_price_incl_vat))} /><DetailRow label="VAT" value={`${Number(item.vat_rate)}%`} /></dl></article>)}</div></>}</div>

      <div className="ml-auto grid max-w-md gap-2 border-t border-forest/10 p-5 text-sm"><div className="flex justify-between gap-4"><span>Subtotal excl. VAT</span><strong>{formatEuro(subtotalExVat)}</strong></div><div className="flex justify-between gap-4"><span>VAT</span><strong>{formatEuro(vatTotal)}</strong></div><div className="flex justify-between gap-4 border-t border-forest/10 pt-2 text-lg"><span className="font-bold">Total incl. VAT</span><strong>{formatEuro(Number(order.total))}</strong></div></div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return <div className="grid gap-1 sm:grid-cols-[130px_minmax(0,1fr)]"><dt className="font-bold text-forest/60">{label}</dt><dd className="min-w-0 break-words text-forest">{value || "-"}</dd></div>;
}
