"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Download, Mail, Plus, RotateCcw, Trash2 } from "lucide-react";
import { businessConfig } from "@/config/business";
import { invoiceLabel } from "@/lib/invoice-format";
import { formatEuro } from "@/lib/pricing";
import type { BackofficeCustomer, BackofficeInvoice } from "@/types/backoffice";
import type { Product, ProductPackageOption } from "@/types/product";

const filters = ["all", "production", "test", "archived", "cancelled"] as const;
const paymentMethods = ["pending", "bizum", "bank-transfer", "cash", "card"] as const;

type ManualInvoiceLine = {
  productId: string;
  productName: string;
  packageLabel: string;
  quantity: string;
  unitPriceInclVat: string;
  vatRate: string;
};

type ManualCustomer = {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingAddress: string;
  customerFiscalId: string;
  customerCompanyName: string;
  customerFiscalAddress: string;
  paymentMethod: string;
};

type OrderSearchProduct = Product & {
  orderSearchAllowed?: boolean;
  orderSearchBlockers?: string[];
};

const emptyLine = (): ManualInvoiceLine => ({
  productId: "",
  productName: "",
  packageLabel: "",
  quantity: "1",
  unitPriceInclVat: "",
  vatRate: "10",
});

function productPackages(product: Product): ProductPackageOption[] {
  return product.packageOptions?.length ? product.packageOptions : [{ label: product.unit, quantity: 1, salePriceInclVat: product.salePriceInclVat }];
}

export function InvoicesPanel() {
  const [invoices, setInvoices] = useState<BackofficeInvoice[]>([]);
  const [message, setMessage] = useState("Loading invoices...");
  const [sending, setSending] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCustomer, setManualCustomer] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    billingAddress: "",
    customerFiscalId: "",
    customerCompanyName: "",
    customerFiscalAddress: "",
    paymentMethod: "pending",
  });
  const [manualLines, setManualLines] = useState<ManualInvoiceLine[]>([emptyLine()]);
  const [customers, setCustomers] = useState<BackofficeCustomer[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [productResults, setProductResults] = useState<OrderSearchProduct[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSearchLine, setProductSearchLine] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/invoices")
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.invoices ?? []; })
      .then((rows) => { setInvoices(rows); setMessage(""); })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Invoices could not be loaded."));
  }, []);

  useEffect(() => {
    if (!manualOpen || customers.length) return;
    queueMicrotask(() => setCustomerLoading(true));
    fetch("/api/admin/customers")
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.customers ?? []; })
      .then((rows) => setCustomers(rows))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Customers could not be loaded."))
      .finally(() => setCustomerLoading(false));
  }, [customers.length, manualOpen]);

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

  async function createManualInvoice() {
    setSending("manual");
    setMessage("");
    const response = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_manual",
        invoice: {
          ...manualCustomer,
          items: manualLines.map((line) => ({
            productId: line.productId,
            productName: line.productName,
            packageLabel: line.packageLabel,
            quantity: Number(line.quantity),
            unitPriceInclVat: Number(line.unitPriceInclVat),
            vatRate: Number(line.vatRate),
          })),
        },
      }),
    });
    const data = await response.json();
    setSending("");
    if (!response.ok) { setMessage(data.message ?? "Manual invoice could not be created."); return; }
    setInvoices((current) => [data.invoice, ...current]);
    setManualCustomer({ customerId: "", customerName: "", customerEmail: "", customerPhone: "", billingAddress: "", customerFiscalId: "", customerCompanyName: "", customerFiscalAddress: "", paymentMethod: "pending" });
    setManualLines([emptyLine()]);
    setCustomerQuery("");
    setProductResults([]);
    setProductSearchLine(null);
    setManualOpen(false);
    setMessage("Manual invoice created.");
  }

  const fiscalIncomplete = !businessConfig.fiscalName || !businessConfig.fiscalId;
  const invoiceOrderLabel = (invoice: BackofficeInvoice) => invoice.order_number ? `NC-${String(invoice.order_number).padStart(6, "0")}` : "Passant";
  return (
    <div className="mt-6 min-w-0">
      {fiscalIncomplete ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">Fiscal business details are incomplete. Invoice may not be legally complete.</p> : null}
      <p className="mb-4 rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-coffee">Production series: {businessConfig.invoiceSeries}. Test series: {businessConfig.invoiceTestSeries}. Existing invoice numbers are never changed automatically.</p>
      <ManualInvoiceForm
        customer={manualCustomer}
        customerLoading={customerLoading}
        customerQuery={customerQuery}
        customerResults={customers}
        lines={manualLines}
        onCreate={createManualInvoice}
        onCustomerChange={setManualCustomer}
        onCustomerQueryChange={setCustomerQuery}
        onLineChange={setManualLines}
        open={manualOpen}
        productLoading={productLoading}
        productResults={productResults}
        productSearchLine={productSearchLine}
        searchProducts={async (lineIndex, query) => {
          const trimmed = query.trim();
          if (trimmed.length < 2) {
            setMessage("Typ minimaal 2 tekens om producten te zoeken.");
            return;
          }
          setProductLoading(true);
          setProductSearchLine(lineIndex);
          setMessage("");
          try {
            const response = await fetch(`/api/admin/products?mode=order-search&q=${encodeURIComponent(trimmed)}`);
            const data = await response.json() as { products?: OrderSearchProduct[]; message?: string };
            if (!response.ok) throw new Error(data.message || "Product search failed.");
            setProductResults(data.products ?? []);
            if (!data.products?.length) setMessage(`Geen producten gevonden voor "${trimmed}".`);
          } catch (error) {
            setProductResults([]);
            setMessage(error instanceof Error ? error.message : "Product search failed.");
          } finally {
            setProductLoading(false);
          }
        }}
        saving={sending === "manual"}
        setOpen={setManualOpen}
      />
      {message ? <p className="mb-4 rounded-md border border-brass/30 bg-cream p-3 text-sm text-forest">{message}</p> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => <button className={`rounded-full border px-3 py-2 text-xs font-bold ${filter === item ? "border-forest bg-forest text-cream" : "border-forest/15 bg-white text-forest"}`} key={item} onClick={() => setFilter(item)} type="button">{item.replace(/^./, (letter) => letter.toUpperCase())}</button>)}
      </div>
      <div className="grid gap-3 md:hidden">
        {filteredInvoices.map((invoice) => <article className="rounded-md border border-forest/10 bg-white p-4" key={invoice.id}><div className="flex justify-between gap-3"><strong>{invoiceLabel(invoice)}</strong><strong>{formatEuro(Number(invoice.total_incl_vat))}</strong></div><p className="mt-2 text-sm font-bold">{invoice.customer_name}</p><p className="mt-1 text-xs text-forest/60">{invoiceOrderLabel(invoice)} · {new Date(invoice.issued_at).toLocaleDateString()} · {invoice.status}</p><Badges invoice={invoice} /><InvoiceActions invoice={invoice} onAction={invoiceAdminAction} onEmail={emailInvoice} sending={sending === invoice.id} /></article>)}
      </div>
      <div className="hidden overflow-x-auto rounded-md border border-forest/10 bg-white md:block">
        <table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-forest text-cream"><tr><th className="p-3">Invoice</th><th className="p-3">Customer</th><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Email</th><th className="p-3">Actions</th></tr></thead><tbody>{filteredInvoices.map((invoice) => <tr className="border-t border-forest/10" key={invoice.id}><td className="p-3 font-bold">{invoiceLabel(invoice)}<Badges invoice={invoice} /></td><td className="p-3">{invoice.customer_name}<br/><span className="text-xs text-forest/55">{invoice.customer_email}</span></td><td className="p-3">{invoiceOrderLabel(invoice)}</td><td className="p-3">{new Date(invoice.issued_at).toLocaleDateString()}</td><td className="p-3 font-bold">{formatEuro(Number(invoice.total_incl_vat))}</td><td className="p-3">{invoice.status}</td><td className="p-3">{invoice.email_sent_at ? "Yes" : "No"}</td><td className="p-3"><InvoiceActions invoice={invoice} onAction={invoiceAdminAction} onEmail={emailInvoice} sending={sending === invoice.id} /></td></tr>)}</tbody></table>
      </div>
      {!message && filteredInvoices.length === 0 ? <p className="rounded-md border border-forest/10 bg-white p-5 text-sm text-forest/60">No invoices match this filter.</p> : null}
    </div>
  );
}

function ManualInvoiceForm({
  customer,
  customerLoading,
  customerQuery,
  customerResults,
  lines,
  onCreate,
  onCustomerChange,
  onCustomerQueryChange,
  onLineChange,
  open,
  productLoading,
  productResults,
  productSearchLine,
  searchProducts,
  saving,
  setOpen,
}: {
  customer: ManualCustomer;
  customerLoading: boolean;
  customerQuery: string;
  customerResults: BackofficeCustomer[];
  lines: ManualInvoiceLine[];
  onCreate: () => Promise<void>;
  onCustomerChange: (value: ManualCustomer) => void;
  onCustomerQueryChange: (value: string) => void;
  onLineChange: (value: ManualInvoiceLine[]) => void;
  open: boolean;
  productLoading: boolean;
  productResults: OrderSearchProduct[];
  productSearchLine: number | null;
  searchProducts: (lineIndex: number, query: string) => Promise<void>;
  saving: boolean;
  setOpen: (value: boolean) => void;
}) {
  const estimatedTotal = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPriceInclVat) || 0), 0);
  const canSave = customer.customerName.trim() && lines.some((line) => line.productName.trim() && Number(line.quantity) > 0 && Number(line.unitPriceInclVat) >= 0);
  const customerMatches = customerQuery.trim().length < 2 ? [] : customerResults.filter((item) => {
    const query = customerQuery.trim().toLowerCase();
    return [item.name, item.email, item.phone, item.address].join(" ").toLowerCase().includes(query);
  }).slice(0, 8);

  function updateLine(index: number, patch: Partial<ManualInvoiceLine>) {
    onLineChange(lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line));
  }

  function selectCustomer(selected: BackofficeCustomer) {
    onCustomerChange({
      ...customer,
      customerId: selected.id,
      customerName: selected.name || "",
      customerEmail: selected.email || "",
      customerPhone: selected.phone || "",
      billingAddress: selected.address || "",
    });
    onCustomerQueryChange(`${selected.name} ${selected.email}`.trim());
  }

  function selectProduct(lineIndex: number, product: Product, option: ProductPackageOption) {
    updateLine(lineIndex, {
      productId: product.id,
      productName: product.name,
      packageLabel: option.label,
      unitPriceInclVat: String(Number(option.salePriceInclVat || product.salePriceInclVat || 0).toFixed(2)),
      vatRate: String(Number(product.vatRate) || 0),
    });
  }

  return <section className="mb-4 rounded-md border border-forest/10 bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="font-serif text-xl font-bold text-forest">Factuur voor passant</h3>
        <p className="text-sm text-forest/65">Maak een losse factuur zonder bestaande webshoporder.</p>
      </div>
      <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-bold text-cream" onClick={() => setOpen(!open)} type="button"><Plus size={16}/>{open ? "Sluiten" : "Nieuwe factuur"}</button>
    </div>
    {open ? <div className="mt-4 grid gap-4">
      <div className="rounded-md border border-forest/10 bg-linen p-3">
        <label className="grid gap-1 text-xs font-bold text-forest/70">Bestaande klant zoeken
          <input className="rounded-md border border-forest/15 px-3 py-2 text-sm text-forest" onChange={(event) => onCustomerQueryChange(event.target.value)} placeholder="Zoek naam, e-mail, telefoon of adres" value={customerQuery} />
        </label>
        {customerLoading ? <p className="mt-2 text-xs font-bold text-forest/60">Klanten laden...</p> : null}
        {customerMatches.length ? <div className="mt-2 grid gap-2">
          {customerMatches.map((match) => <button className="rounded-md border border-forest/10 bg-white p-3 text-left text-sm hover:border-forest/40" key={match.id} onClick={() => selectCustomer(match)} type="button">
            <strong className="text-forest">{match.name}</strong>
            <span className="ml-2 text-xs text-forest/60">{match.email}</span>
            <span className="mt-1 block text-xs text-forest/55">{[match.phone, match.address].filter(Boolean).join(" · ") || "Geen extra gegevens"}</span>
          </button>)}
        </div> : customerQuery.trim().length >= 2 ? <p className="mt-2 text-xs text-forest/60">Geen klant gevonden. Je kunt de gegevens handmatig invullen.</p> : null}
        {customer.customerId ? <p className="mt-2 text-xs font-bold text-coffee">Gekoppeld aan klantrecord: {customer.customerName}</p> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Naam" value={customer.customerName} onChange={(value) => onCustomerChange({ ...customer, customerName: value })} required />
        <Field label="E-mail optioneel" type="email" value={customer.customerEmail} onChange={(value) => onCustomerChange({ ...customer, customerEmail: value })} />
        <Field label="Telefoon" value={customer.customerPhone} onChange={(value) => onCustomerChange({ ...customer, customerPhone: value })} />
        <label className="grid gap-1 text-xs font-bold text-forest/70">Betaalmethode
          <select className="rounded-md border border-forest/15 px-3 py-2 text-sm text-forest" value={customer.paymentMethod} onChange={(event) => onCustomerChange({ ...customer, paymentMethod: event.target.value })}>
            {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </label>
        <Field label="Adres" value={customer.billingAddress} onChange={(value) => onCustomerChange({ ...customer, billingAddress: value })} />
        <Field label="NIF/CIF/NIE" value={customer.customerFiscalId} onChange={(value) => onCustomerChange({ ...customer, customerFiscalId: value })} />
        <Field label="Bedrijfsnaam" value={customer.customerCompanyName} onChange={(value) => onCustomerChange({ ...customer, customerCompanyName: value })} />
        <Field label="Fiscaal adres" value={customer.customerFiscalAddress} onChange={(value) => onCustomerChange({ ...customer, customerFiscalAddress: value })} />
      </div>
      <div className="grid gap-3">
        {lines.map((line, index) => <div className="grid gap-2 rounded-md border border-forest/10 bg-linen p-3 md:grid-cols-[0.7fr_1.4fr_0.8fr_0.55fr_0.65fr_0.5fr_auto]" key={index}>
          <Field label="Code" value={line.productId} onChange={(value) => updateLine(index, { productId: value })} />
          <Field label="Product" value={line.productName} onChange={(value) => updateLine(index, { productName: value })} required />
          <Field label="Verpakking" value={line.packageLabel} onChange={(value) => updateLine(index, { packageLabel: value })} />
          <Field label="Aantal" min="0.01" step="0.01" type="number" value={line.quantity} onChange={(value) => updateLine(index, { quantity: value })} required />
          <Field label="Prijs incl." min="0" step="0.01" type="number" value={line.unitPriceInclVat} onChange={(value) => updateLine(index, { unitPriceInclVat: value })} required />
          <Field label="IVA %" min="0" step="1" type="number" value={line.vatRate} onChange={(value) => updateLine(index, { vatRate: value })} required />
          <button aria-label="Remove line" className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-md border border-forest/15 text-forest disabled:opacity-40" disabled={lines.length === 1} onClick={() => onLineChange(lines.filter((_, lineIndex) => lineIndex !== index))} type="button"><Trash2 size={16}/></button>
          <div className="md:col-span-7">
            <button className="rounded-md border border-forest/15 bg-white px-3 py-2 text-xs font-bold text-forest disabled:opacity-50" disabled={productLoading && productSearchLine === index} onClick={() => void searchProducts(index, line.productName || line.productId)} type="button">{productLoading && productSearchLine === index ? "Zoeken..." : "Zoek product"}</button>
            {productSearchLine === index && productResults.length ? <div className="mt-2 grid gap-2">
              {productResults.map((product) => {
                const blockers = product.orderSearchBlockers ?? [];
                const allowed = product.orderSearchAllowed !== false && blockers.length === 0;
                return <article className="rounded-md border border-forest/10 bg-white p-3" key={product.id}>
                  <p className="text-xs font-bold text-coffee">{product.id}{product.supplierCode ? ` · Supplier ${product.supplierCode}` : ""}</p>
                  <h4 className="font-bold text-forest">{product.name}</h4>
                  <p className="text-xs text-forest/60">{product.unit} · IVA {product.vatRate}% · {formatEuro(Number(product.salePriceInclVat))}</p>
                  {!allowed ? <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs font-bold text-amber-900">Niet toe te voegen: {blockers.join(" ")}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {productPackages(product).map((option) => <button className="rounded-md border border-forest/15 bg-linen px-3 py-2 text-xs font-bold text-forest disabled:cursor-not-allowed disabled:opacity-40" disabled={!allowed} key={`${product.id}-${option.label}-${option.quantity}`} onClick={() => selectProduct(index, product, option)} type="button">Kies: {option.label} · {formatEuro(option.salePriceInclVat)}</button>)}
                  </div>
                </article>;
              })}
            </div> : null}
          </div>
        </div>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-forest/15 px-4 py-2 text-sm font-bold text-forest" onClick={() => onLineChange([...lines, emptyLine()])} type="button"><Plus size={16}/>Regel toevoegen</button>
        <div className="flex flex-wrap items-center gap-3">
          <strong className="text-forest">Totaal incl. IVA: {formatEuro(estimatedTotal)}</strong>
          <button className="min-h-10 rounded-md bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={saving || !canSave} onClick={() => void onCreate()} type="button">{saving ? "Opslaan..." : "Factuur maken"}</button>
        </div>
      </div>
    </div> : null}
  </section>;
}

function Field({ label, onChange, required, value, type = "text", min, step }: { label: string; onChange: (value: string) => void; required?: boolean; value: string; type?: string; min?: string; step?: string }) {
  return <label className="grid gap-1 text-xs font-bold text-forest/70">{label}
    <input className="rounded-md border border-forest/15 px-3 py-2 text-sm text-forest" min={min} onChange={(event) => onChange(event.target.value)} required={required} step={step} type={type} value={value} />
  </label>;
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
