"use client";

import { useEffect, useMemo, useState } from "react";

type Supplier = {
  id: string;
  code: string | null;
  name: string;
};

type SupplierOffer = {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_code: string | null;
  supplier_product_name: string | null;
  brand: string | null;
  package_description: string | null;
  units_per_case: number | null;
  case_price: number | null;
  unit_price: number | null;
  price_ex_vat: number | null;
  currency: string | null;
  source_batch: string | null;
};

type PurchaseOrder = {
  id: string;
  purchase_number: number | string | null;
  supplier_id: string | null;
  status: string;
  total_ex_vat: number | null;
  total_vat: number | null;
  total_incl_vat: number | null;
  created_at: string;
};

type PurchaseOrderItem = {
  id: string;
  purchase_order_id: string;
  supplier_product_offer_id: string | null;
  supplier_code: string | null;
  product_name: string;
  package_description: string | null;
  units_per_case: number;
  ordered_cases: number;
  ordered_units: number;
  unit_cost_ex_vat: number;
  line_total_ex_vat: number;
  vat_rate: number | null;
  received_units: number;
};

type SupplierInvoice = {
  id: string;
  supplier_id: string;
  purchase_order_id: string | null;
  supplier_invoice_number: string | null;
  invoice_date: string | null;
  status: string;
  total_ex_vat: number | null;
  vat_total: number | null;
  total_incl_vat: number | null;
  file_path: string | null;
  needs_review: boolean | null;
  review_reason: string | null;
  created_at: string;
};

type GoodsReceipt = {
  id: string;
  purchase_order_id: string;
  supplier_invoice_id: string | null;
  status: string;
  received_at: string | null;
  processed_at: string | null;
  created_at: string;
};

type PurchasingOverview = {
  schemaReady: boolean;
  diagnostics: string[];
  suppliers: Supplier[];
  offers: SupplierOffer[];
  purchaseOrders: PurchaseOrder[];
  purchaseOrderItems: PurchaseOrderItem[];
  supplierInvoices: SupplierInvoice[];
  goodsReceipts: GoodsReceipt[];
};

type ApiResponse =
  | { ok: true; diagnosticId: string; overview: PurchasingOverview }
  | { ok: false; diagnosticId: string; message: string; errorCode: string };

function money(value: number | null | undefined) {
  return `EUR ${(Number(value) || 0).toFixed(2)}`;
}

function purchaseNumber(order: PurchaseOrder) {
  return `PO-${String(order.purchase_number ?? order.id.slice(0, 8)).padStart(6, "0")}`;
}

function cls(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PurchasingPanel() {
  const [overview, setOverview] = useState<PurchasingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [offerSearch, setOfferSearch] = useState("");
  const [offerId, setOfferId] = useState("");
  const [orderedCases, setOrderedCases] = useState("1");
  const [orderedUnits, setOrderedUnits] = useState("0");
  const [vatRate, setVatRate] = useState("21");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [invoiceSupplierId, setInvoiceSupplierId] = useState("");
  const [invoicePurchaseOrderId, setInvoicePurchaseOrderId] = useState("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceTotals, setInvoiceTotals] = useState({ exVat: "", vat: "", inclVat: "" });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [receiptPurchaseOrderId, setReceiptPurchaseOrderId] = useState("");
  const [receiptSupplierInvoiceId, setReceiptSupplierInvoiceId] = useState("");
  const [receiptItemId, setReceiptItemId] = useState("");
  const [receivedCases, setReceivedCases] = useState("1");
  const [receivedUnits, setReceivedUnits] = useState("0");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadOverview() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/purchasing", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.ok ? "Purchasing overview could not be loaded." : `${data.message} (${data.diagnosticId})`);
      }
      setOverview(data.overview);
      setSupplierId((current) => current || data.overview.suppliers[0]?.id || "");
      setInvoiceSupplierId((current) => current || data.overview.suppliers[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Purchasing overview could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOverview();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const suppliersById = useMemo(() => new Map((overview?.suppliers ?? []).map((supplier) => [supplier.id, supplier])), [overview]);
  const ordersById = useMemo(() => new Map((overview?.purchaseOrders ?? []).map((order) => [order.id, order])), [overview]);
  const offerQuery = offerSearch.trim().toLowerCase();
  const filteredOffers = useMemo(() => {
    const offers = overview?.offers ?? [];
    return offers
      .filter((offer) => !supplierId || offer.supplier_id === supplierId)
      .filter((offer) => {
        if (!offerQuery) return true;
        return [
          offer.supplier_product_name,
          offer.supplier_code,
          offer.brand,
          offer.package_description,
          offer.source_batch,
        ]
          .join(" ")
          .toLowerCase()
          .includes(offerQuery);
      })
      .slice(0, 80);
  }, [offerQuery, overview?.offers, supplierId]);

  const selectedOffer = filteredOffers.find((offer) => offer.id === offerId) ?? overview?.offers.find((offer) => offer.id === offerId);
  const receiptItems = (overview?.purchaseOrderItems ?? []).filter((item) => item.purchase_order_id === receiptPurchaseOrderId);
  const receiptSupplierInvoices = useMemo(
    () =>
      (overview?.supplierInvoices ?? []).filter(
        (invoice) =>
          !receiptPurchaseOrderId ||
          !invoice.purchase_order_id ||
          invoice.purchase_order_id === receiptPurchaseOrderId,
      ),
    [overview?.supplierInvoices, receiptPurchaseOrderId],
  );

  async function postJson(body: Record<string, unknown>) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/purchasing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || data.ok === false) throw new Error(`${data.message || "Request failed"} (${data.diagnosticId || "no diagnostic"})`);
      setMessage("Saved.");
      await loadOverview();
      return data;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Request failed.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function createPurchaseOrder() {
    if (!selectedOffer) {
      setError("Select a supplier offer first.");
      return;
    }
    await postJson({
      action: "create_purchase_order",
      purchaseOrder: {
        supplierId: selectedOffer.supplier_id,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes: poNotes,
        vatRate: vatRate === "" ? null : Number(vatRate),
        items: [{ offerId: selectedOffer.id, orderedCases: Number(orderedCases), orderedUnits: Number(orderedUnits) }],
      },
    });
  }

  async function uploadInvoice() {
    if (!invoiceFile) {
      setError("Select a supplier invoice file first.");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.set("supplierId", invoiceSupplierId);
      formData.set("purchaseOrderId", invoicePurchaseOrderId);
      formData.set("supplierInvoiceNumber", supplierInvoiceNumber);
      formData.set("invoiceDate", invoiceDate);
      formData.set("totalExVat", invoiceTotals.exVat);
      formData.set("vatTotal", invoiceTotals.vat);
      formData.set("totalInclVat", invoiceTotals.inclVat);
      formData.set("file", invoiceFile);
      const response = await fetch("/api/admin/purchasing", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || data.ok === false) throw new Error(`${data.message || "Upload failed"} (${data.diagnosticId || "no diagnostic"})`);
      setMessage(data.message || "Supplier invoice uploaded for review.");
      setInvoiceFile(null);
      await loadOverview();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  }

  async function createGoodsReceipt() {
    await postJson({
      action: "create_goods_receipt",
      goodsReceipt: {
        purchaseOrderId: receiptPurchaseOrderId,
        supplierInvoiceId: receiptSupplierInvoiceId || undefined,
        notes: receiptNotes,
        items: [{ purchaseOrderItemId: receiptItemId, receivedCases: Number(receivedCases), receivedUnits: Number(receivedUnits) }],
      },
    });
  }

  async function processReceipt(goodsReceiptId: string) {
    await postJson({ action: "process_goods_receipt", goodsReceiptId });
  }

  if (loading) return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">Loading purchasing...</div>;
  if (!overview) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Purchasing could not be loaded."}</div>;

  return (
    <div className="space-y-6">
      {!overview.schemaReady ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Run the purchasing migration before using this module. Diagnostics: {overview.diagnostics.join(" | ")}
        </div>
      ) : null}
      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create purchase order</h2>
          <div className="mt-4 space-y-3">
            <select className="w-full rounded-md border border-slate-300 p-2" value={supplierId} onChange={(event) => { setSupplierId(event.target.value); setOfferId(""); }}>
              {overview.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            <input className="w-full rounded-md border border-slate-300 p-2" placeholder="Search supplier offer" value={offerSearch} onChange={(event) => setOfferSearch(event.target.value)} />
            <select className="w-full rounded-md border border-slate-300 p-2" value={offerId} onChange={(event) => setOfferId(event.target.value)}>
              <option value="">Select product</option>
              {filteredOffers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.supplier_code || "no code"} - {offer.supplier_product_name || offer.brand || offer.id}
                </option>
              ))}
            </select>
            {selectedOffer ? (
              <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                <strong>{selectedOffer.package_description || "No package"}</strong><br />
                Case: {money(selectedOffer.case_price)} | Unit: {money(selectedOffer.unit_price || selectedOffer.price_ex_vat)} | Batch: {selectedOffer.source_batch || "-"}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border border-slate-300 p-2" type="number" min="0" value={orderedCases} onChange={(event) => setOrderedCases(event.target.value)} placeholder="Cases" />
              <input className="rounded-md border border-slate-300 p-2" type="number" min="0" value={orderedUnits} onChange={(event) => setOrderedUnits(event.target.value)} placeholder="Loose units" />
            </div>
            <select className="w-full rounded-md border border-slate-300 p-2" value={vatRate} onChange={(event) => setVatRate(event.target.value)}>
              <option value="">IVA review later</option>
              <option value="4">4%</option>
              <option value="10">10%</option>
              <option value="21">21%</option>
            </select>
            <input className="w-full rounded-md border border-slate-300 p-2" type="date" value={expectedDeliveryDate} onChange={(event) => setExpectedDeliveryDate(event.target.value)} />
            <textarea className="min-h-20 w-full rounded-md border border-slate-300 p-2" placeholder="Notes" value={poNotes} onChange={(event) => setPoNotes(event.target.value)} />
            <button type="button" className="w-full rounded-md bg-emerald-800 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={saving || !overview.schemaReady} onClick={createPurchaseOrder}>Create purchase order</button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upload supplier invoice</h2>
          <div className="mt-4 space-y-3">
            <select className="w-full rounded-md border border-slate-300 p-2" value={invoiceSupplierId} onChange={(event) => setInvoiceSupplierId(event.target.value)}>
              {overview.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            <select className="w-full rounded-md border border-slate-300 p-2" value={invoicePurchaseOrderId} onChange={(event) => setInvoicePurchaseOrderId(event.target.value)}>
              <option value="">No purchase order link</option>
              {overview.purchaseOrders.map((order) => (
                <option key={order.id} value={order.id}>{purchaseNumber(order)} - {suppliersById.get(order.supplier_id || "")?.name || "Supplier"}</option>
              ))}
            </select>
            <input className="w-full rounded-md border border-slate-300 p-2" value={supplierInvoiceNumber} onChange={(event) => setSupplierInvoiceNumber(event.target.value)} placeholder="Supplier invoice number" />
            <input className="w-full rounded-md border border-slate-300 p-2" type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <input className="rounded-md border border-slate-300 p-2" type="number" step="0.01" placeholder="Ex IVA" value={invoiceTotals.exVat} onChange={(event) => setInvoiceTotals((current) => ({ ...current, exVat: event.target.value }))} />
              <input className="rounded-md border border-slate-300 p-2" type="number" step="0.01" placeholder="IVA" value={invoiceTotals.vat} onChange={(event) => setInvoiceTotals((current) => ({ ...current, vat: event.target.value }))} />
              <input className="rounded-md border border-slate-300 p-2" type="number" step="0.01" placeholder="Incl IVA" value={invoiceTotals.inclVat} onChange={(event) => setInvoiceTotals((current) => ({ ...current, inclVat: event.target.value }))} />
            </div>
            <input className="w-full rounded-md border border-slate-300 p-2" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setInvoiceFile(event.target.files?.[0] || null)} />
            <button type="button" className="w-full rounded-md bg-emerald-800 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={saving || !overview.schemaReady} onClick={uploadInvoice}>Upload for review</button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Receive goods</h2>
          <div className="mt-4 space-y-3">
            <select className="w-full rounded-md border border-slate-300 p-2" value={receiptPurchaseOrderId} onChange={(event) => { setReceiptPurchaseOrderId(event.target.value); setReceiptItemId(""); setReceiptSupplierInvoiceId(""); }}>
              <option value="">Select purchase order</option>
              {overview.purchaseOrders.map((order) => (
                <option key={order.id} value={order.id}>{purchaseNumber(order)} - {order.status}</option>
              ))}
            </select>
            <select className="w-full rounded-md border border-slate-300 p-2" value={receiptSupplierInvoiceId} onChange={(event) => setReceiptSupplierInvoiceId(event.target.value)}>
              <option value="">No supplier invoice link</option>
              {receiptSupplierInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.supplier_invoice_number || invoice.id.slice(0, 8)} - {invoice.status}
                </option>
              ))}
            </select>
            <select className="w-full rounded-md border border-slate-300 p-2" value={receiptItemId} onChange={(event) => setReceiptItemId(event.target.value)}>
              <option value="">Select line</option>
              {receiptItems.map((item) => (
                <option key={item.id} value={item.id}>{item.supplier_code || "-"} - {item.product_name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border border-slate-300 p-2" type="number" min="0" value={receivedCases} onChange={(event) => setReceivedCases(event.target.value)} placeholder="Cases received" />
              <input className="rounded-md border border-slate-300 p-2" type="number" min="0" value={receivedUnits} onChange={(event) => setReceivedUnits(event.target.value)} placeholder="Loose units" />
            </div>
            <textarea className="min-h-20 w-full rounded-md border border-slate-300 p-2" placeholder="Receipt notes" value={receiptNotes} onChange={(event) => setReceiptNotes(event.target.value)} />
            <button type="button" className="w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={saving || !overview.schemaReady || !receiptItemId} onClick={createGoodsReceipt}>Create draft receipt</button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Purchase orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-2">PO</th><th className="p-2">Supplier</th><th className="p-2">Status</th><th className="p-2">Ex IVA</th><th className="p-2">IVA</th><th className="p-2">Total</th></tr>
            </thead>
            <tbody>
              {overview.purchaseOrders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="p-2 font-medium">{purchaseNumber(order)}</td>
                  <td className="p-2">{suppliersById.get(order.supplier_id || "")?.name || "-"}</td>
                  <td className="p-2">{order.status}</td>
                  <td className="p-2">{money(order.total_ex_vat)}</td>
                  <td className="p-2">{money(order.total_vat)}</td>
                  <td className="p-2 font-semibold">{money(order.total_incl_vat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Supplier invoices</h2>
          <div className="mt-4 space-y-3">
            {overview.supplierInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-md border border-slate-100 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <strong>{invoice.supplier_invoice_number || invoice.id.slice(0, 8)}</strong>
                  <span className={cls("rounded-full px-2 py-1 text-xs", invoice.needs_review ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>{invoice.status}</span>
                </div>
                <div className="mt-1 text-slate-600">{suppliersById.get(invoice.supplier_id)?.name || "Supplier"} - {money(invoice.total_incl_vat)}</div>
                {invoice.review_reason ? <div className="mt-1 text-xs text-amber-700">{invoice.review_reason}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Goods receipts</h2>
          <div className="mt-4 space-y-3">
            {overview.goodsReceipts.map((receipt) => {
              const order = ordersById.get(receipt.purchase_order_id);
              return (
                <div key={receipt.id} className="rounded-md border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{order ? purchaseNumber(order) : receipt.id.slice(0, 8)}</strong>
                    <span>{receipt.status}</span>
                  </div>
                  <div className="mt-1 text-slate-600">Received: {receipt.received_at ? new Date(receipt.received_at).toLocaleDateString() : "-"}</div>
                  {receipt.status !== "processed" ? (
                    <button type="button" className="mt-3 rounded-md bg-emerald-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" disabled={saving || !overview.schemaReady} onClick={() => processReceipt(receipt.id)}>Process into stock</button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
