"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Download, Mail, RotateCcw } from "lucide-react";
import { businessConfig } from "@/config/business";
import { invoiceLabel } from "@/lib/invoice-format";
import { formatEuro } from "@/lib/pricing";
import type { BackofficeInvoice } from "@/types/backoffice";

const filters = ["all", "production", "test", "archived", "cancelled"] as const;

export function InvoicesPanel() {
  const [invoices, setInvoices] = useState<BackofficeInvoice[]>([]);
  const [message, setMessage] = useState("Loading invoices...");
  const [sending, setSending] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  useEffect(() => {
    fetch("/api/admin/invoices")
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.invoices ?? []; })
      .then((rows) => { setInvoices(rows); setMessage(""); })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Invoices could not be loaded."));
  }, []);

  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    if (filter === "production") return !invoice.is_test && !invoice.archived_at;
    if (filter === "test") return Boolean(invoice.is_test);
    if (filter === "archived") return Boolean(invoice.archived_at);
    if (filter === "cancelled") return invoice.status === "cancelled";
    return true;
  }), [filter, invoices]);

  function mergeInvoice(row: BackofficeInvoice) {
    setInvoices((current) => current.map((invoice) => invoice.id === row.id ? row : invoice));
  }

  async function emailInvoice(invoice: BackofficeInvoice) {
    setSending(invoice.id);
    setMessage("");
    const response = await fetch("/api/admin/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "email", invoiceId: invoice.id }) });
    const data = await response.json();
    setSending("");
    if (!response.ok) { setMessage(data.message ?? "Invoice email failed. The invoice remains saved."); return; }
    mergeInvoice(data.invoice);
    setMessage(data.email?.sent ? "Invoice emailed to the customer." : "Email is not configured; the invoice remains available for download.");
  }

  async function invoiceAdminAction(invoice: BackofficeInvoice, action: "mark-test" | "unmark-test" | "archive" | "restore") {
    setSending(invoice.id);
    setMessage("");
    const body = action === "mark-test" || action === "unmark-test"
      ? { action: "mark_test", invoiceId: invoice.id, isTest: action === "mark-test" }
      : { action: "archive", invoiceId: invoice.id, archived: action === "archive" };
    const response = await fetch("/api/admin/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    setSending("");
    if (!response.ok) { setMessage(data.message ?? "Invoice action failed."); return; }
    mergeInvoice(data.invoice);
    setMessage("Invoice updated.");
  }

  const fiscalIncomplete = !businessConfig.fiscalName || !businessConfig.fiscalId;
  return (
    <div className="mt-6 min-w-0">
      {fiscalIncomplete ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">Fiscal business details are incomplete. Invoice may not be legally complete.</p> : null}
      <p className="mb-4 rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-coffee">Production series: {businessConfig.invoiceSeries}. Test series: {businessConfig.invoiceTestSeries}. Existing invoice numbers are never changed automatically.</p>
      {message ? <p className="mb-4 rounded-md border border-brass/30 bg-cream p-3 text-sm text-forest">{message}</p> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => <button className={`rounded-full border px-3 py-2 text-xs font-bold ${filter === item ? "border-forest bg-forest text-cream" : "border-forest/15 bg-white text-forest"}`} key={item} onClick={() => setFilter(item)} type="button">{item.replace(/^./, (letter) => letter.toUpperCase())}</button>)}
      </div>
      <div className="grid gap-3 md:hidden">
        {filteredInvoices.map((invoice) => <article className="rounded-md border border-forest/10 bg-white p-4" key={invoice.id}><div className="flex justify-between gap-3"><strong>{invoiceLabel(invoice)}</strong><strong>{formatEuro(Number(invoice.total_incl_vat))}</strong></div><p className="mt-2 text-sm font-bold">{invoice.customer_name}</p><p className="mt-1 text-xs text-forest/60">Order NC-{String(invoice.order_number).padStart(6, "0")} · {new Date(invoice.issued_at).toLocaleDateString()} · {invoice.status}</p><Badges invoice={invoice} /><InvoiceActions invoice={invoice} onAction={invoiceAdminAction} onEmail={emailInvoice} sending={sending === invoice.id} /></article>)}
      </div>
      <div className="hidden overflow-x-auto rounded-md border border-forest/10 bg-white md:block">
        <table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-forest text-cream"><tr><th className="p-3">Invoice</th><th className="p-3">Customer</th><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Email</th><th className="p-3">Actions</th></tr></thead><tbody>{filteredInvoices.map((invoice) => <tr className="border-t border-forest/10" key={invoice.id}><td className="p-3 font-bold">{invoiceLabel(invoice)}<Badges invoice={invoice} /></td><td className="p-3">{invoice.customer_name}<br/><span className="text-xs text-forest/55">{invoice.customer_email}</span></td><td className="p-3">NC-{String(invoice.order_number).padStart(6, "0")}</td><td className="p-3">{new Date(invoice.issued_at).toLocaleDateString()}</td><td className="p-3 font-bold">{formatEuro(Number(invoice.total_incl_vat))}</td><td className="p-3">{invoice.status}</td><td className="p-3">{invoice.email_sent_at ? "Yes" : "No"}</td><td className="p-3"><InvoiceActions invoice={invoice} onAction={invoiceAdminAction} onEmail={emailInvoice} sending={sending === invoice.id} /></td></tr>)}</tbody></table>
      </div>
      {!message && filteredInvoices.length === 0 ? <p className="rounded-md border border-forest/10 bg-white p-5 text-sm text-forest/60">No invoices match this filter.</p> : null}
    </div>
  );
}

function Badges({ invoice }: { invoice: BackofficeInvoice }) {
  return <span className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold">{invoice.is_test ? <span className="rounded-full bg-brass/20 px-2 py-1 text-coffee">Test</span> : <span className="rounded-full bg-forest/10 px-2 py-1 text-forest">Production</span>}{invoice.archived_at ? <span className="rounded-full bg-forest px-2 py-1 text-cream">Archived</span> : null}</span>;
}

function InvoiceActions({ invoice, onAction, onEmail, sending }: { invoice: BackofficeInvoice; onAction: (invoice: BackofficeInvoice, action: "mark-test" | "unmark-test" | "archive" | "restore") => Promise<void>; onEmail: (invoice: BackofficeInvoice) => Promise<void>; sending: boolean }) {
  return <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
    <a className="inline-flex min-h-9 items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" href={`/api/admin/invoices/${invoice.id}/pdf`}><Download size={15}/>PDF</a>
    <button className="inline-flex min-h-9 items-center gap-2 rounded-md bg-forest px-3 py-2 text-xs font-bold text-cream disabled:opacity-50" disabled={sending} onClick={() => void onEmail(invoice)} type="button"><Mail size={15}/>{sending ? "Sending..." : invoice.email_sent_at ? "Email again" : "Email"}</button>
    {invoice.archived_at ? <button className="inline-flex min-h-9 items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" disabled={sending} onClick={() => void onAction(invoice, "restore")} type="button"><RotateCcw size={15}/>Restore</button> : <button className="inline-flex min-h-9 items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" disabled={sending} onClick={() => void onAction(invoice, "archive")} type="button"><Archive size={15}/>Archive</button>}
    <button className="rounded-md border border-brass/50 px-3 py-2 text-xs font-bold text-coffee disabled:opacity-50" disabled={sending} onClick={() => void onAction(invoice, invoice.is_test ? "unmark-test" : "mark-test")} type="button">{invoice.is_test ? "Unmark test" : "Mark test"}</button>
  </div>;
}
