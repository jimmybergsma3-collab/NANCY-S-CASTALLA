"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, CalendarClock, ChevronRight, Download, FileText, Mail, MessageCircle, PackagePlus, Phone, RotateCcw, Search, Send, ShieldAlert, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { businessConfig } from "@/config/business";
import { invoiceLabel } from "@/lib/invoice-format";
import { paymentMethodLabel } from "@/lib/payment";
import { formatEuro } from "@/lib/pricing";
import { readSafeJson } from "@/lib/safe-json";
import type { BackofficeOrder, BackofficeOrderItem, OrderStatus, PaymentStatus } from "@/types/backoffice";
import type { Product, ProductPackageOption } from "@/types/product";

const statuses: OrderStatus[] = ["new", "confirmed", "processing", "ready_for_collection", "shipped", "delivered", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "refunded", "cancelled"];
const kindFilters = ["all", "real", "test", "archived"] as const;
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

type EditableOrderLine = {
  localId: string;
  productId: string;
  productName: string;
  quantity: number;
  packageLabel: string;
  packageQuantity: number;
  salePriceInclVat: number;
  vatRate: number;
};

type OrderSearchProduct = Product & {
  orderSearchAllowed?: boolean;
  orderSearchBlockers?: string[];
};

function editableLineTotal(line: EditableOrderLine) {
  return Math.round(line.quantity * line.salePriceInclVat * 100) / 100;
}

function editableLineExVat(line: EditableOrderLine) {
  return Math.round((editableLineTotal(line) / (1 + line.vatRate / 100)) * 100) / 100;
}

function productPackages(product: Product): ProductPackageOption[] {
  return product.packageOptions?.length ? product.packageOptions : [{ label: product.unit, quantity: 1, salePriceInclVat: product.salePriceInclVat }];
}

function orderItemsToEditableLines(items?: BackofficeOrderItem[]): EditableOrderLine[] {
  return (items ?? []).map((item) => ({
    localId: `${item.id}`,
    productId: item.product_id ?? "",
    productName: item.product_name,
    quantity: Number(item.quantity) || 1,
    packageLabel: item.package_label || item.unit,
    packageQuantity: Number(item.package_quantity) || 1,
    salePriceInclVat: Number(item.sale_price_incl_vat) || 0,
    vatRate: Number(item.vat_rate) || 0,
  }));
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<BackofficeOrder[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("Loading orders...");
  const [saving, setSaving] = useState("");
  const [invoiceBusy, setInvoiceBusy] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState<(typeof kindFilters)[number]>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(async (response) => {
        const { data, message, diagnosticId } = await readSafeJson<{ orders?: BackofficeOrder[]; data?: { orders?: BackofficeOrder[] } }>(response);
        if (!response.ok || !data) throw new Error(`${message || "Orders could not be loaded."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`);
        return data.orders ?? data.data?.orders ?? [];
      })
      .then((loadedOrders: BackofficeOrder[]) => {
        setOrders(loadedOrders);
        setSelectedId(loadedOrders[0]?.id || "");
        setNotesDraft(loadedOrders[0]?.notes ?? "");
        setMessage("");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Orders could not be loaded."));
  }, []);

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = !needle || `${orderLabel(order)} ${order.customer_name} ${order.customer_email}`.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter;
      const matchesKind = kindFilter === "all" || (kindFilter === "real" ? !order.is_test && !order.archived_at : kindFilter === "test" ? Boolean(order.is_test) : Boolean(order.archived_at));
      const matchesDate = !dateFilter || order.created_at?.slice(0, 10) === dateFilter;
      return matchesSearch && matchesStatus && matchesPayment && matchesKind && matchesDate;
    });
  }, [dateFilter, kindFilter, orders, paymentFilter, search, statusFilter]);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId), [orders, selectedId]);

  function mergeOrder(row: Partial<BackofficeOrder> & { id: string }) {
    setOrders((current) => current.map((item) => item.id === row.id ? { ...item, ...row, customer: row.customer ?? item.customer, order_items: row.order_items ?? item.order_items, invoices: row.invoices ?? item.invoices } : item));
  }

  async function save(order: BackofficeOrder, patch: Partial<BackofficeOrder>) {
    const next = { ...order, ...patch };
    setSaving(order.id);
    setMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: next.id, status: next.status, paymentStatus: next.payment_status }),
    });
    const { data, message, diagnosticId } = await readSafeJson<{ order?: BackofficeOrder; email?: { sent?: boolean; skipped?: boolean }; data?: { order?: BackofficeOrder; email?: { sent?: boolean; skipped?: boolean } } }>(response);
    setSaving("");
    if (!response.ok || !data) { setMessage(`${message || "Order could not be updated."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`); return; }
    const updatedOrder = data.order ?? data.data?.order;
    const email = data.email ?? data.data?.email;
    mergeOrder({ ...next, ...(updatedOrder ?? {}) });
    if (email && !email.sent && !email.skipped) setMessage("Status saved, but the customer email could not be sent.");
  }

  async function invoiceAction(order: BackofficeOrder, action: "create" | "email", invoiceId?: string) {
    setInvoiceBusy(action);
    setMessage("");
    const response = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "create" ? { action, orderId: order.id } : { action, invoiceId }),
    });
    const { data, message, diagnosticId } = await readSafeJson<{ invoice?: BackofficeOrder["invoices"] extends Array<infer T> ? T : never; email?: { sent?: boolean }; data?: { invoice?: BackofficeOrder["invoices"] extends Array<infer T> ? T : never; email?: { sent?: boolean } } }>(response);
    setInvoiceBusy("");
    if (!response.ok || !data) { setMessage(`${message || "Invoice action failed."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`); return; }
    const invoice = data.invoice ?? data.data?.invoice;
    const email = data.email ?? data.data?.email;
    if (invoice) {
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, invoices: [invoice] } : item));
    }
    setMessage(action === "create" ? "Invoice created." : email?.sent ? "Invoice emailed to the customer." : "Invoice saved, but email is not configured.");
  }

  async function saveNotes(order: BackofficeOrder) {
    setSaving(order.id);
    setMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, action: "notes", notes: notesDraft }),
    });
    const { data, message, diagnosticId } = await readSafeJson<{ order?: BackofficeOrder; data?: { order?: BackofficeOrder } }>(response);
    setSaving("");
    if (!response.ok || !data) { setMessage(`${message || "Notes could not be saved."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`); return; }
    const updatedOrder = data.order ?? data.data?.order;
    mergeOrder({ id: order.id, notes: updatedOrder?.notes ?? notesDraft });
    setMessage("Notes saved.");
  }

  async function orderAdminAction(order: BackofficeOrder, action: "mark-test" | "unmark-test" | "archive" | "restore" | "delete-test") {
    setSaving(order.id);
    setMessage("");
    if (action === "delete-test") {
      const confirmation = window.prompt(`Type DELETE TEST ORDER to permanently delete ${orderLabel(order)}.`);
      if (confirmation !== "DELETE TEST ORDER") { setSaving(""); return; }
      const response = await fetch("/api/admin/orders", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: order.id, confirmation }) });
      const { message, diagnosticId } = await readSafeJson<{ ok?: boolean }>(response);
      setSaving("");
      if (!response.ok) { setMessage(`${message || "Test order could not be deleted safely."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`); return; }
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setSelectedId((current) => current === order.id ? orders.find((item) => item.id !== order.id)?.id ?? "" : current);
      setMessage("Test order deleted.");
      return;
    }
    const body = action === "mark-test" || action === "unmark-test"
      ? { id: order.id, action: "mark_test", isTest: action === "mark-test", reason: action === "mark-test" ? "Marked from admin cleanup" : "" }
      : { id: order.id, action: "archive", archived: action === "archive" };
    const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const { data, message, diagnosticId } = await readSafeJson<{ order?: BackofficeOrder; data?: { order?: BackofficeOrder } }>(response);
    setSaving("");
    if (!response.ok || !data) { setMessage(`${message || "Order action failed."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`); return; }
    const updatedOrder = data.order ?? data.data?.order;
    if (!updatedOrder) { setMessage("Order action returned no order record."); return; }
    mergeOrder(updatedOrder);
    setMessage("Order updated.");
  }

  async function archiveSelectedTestOrders() {
    const targets = orders.filter((order) => selectedIds.includes(order.id) && order.is_test && !order.archived_at);
    for (const order of targets) await orderAdminAction(order, "archive");
    setSelectedIds([]);
    setMessage(`${targets.length} test order(s) archived.`);
  }

  return (
    <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="min-w-0">
        {message ? <p className="mb-4 rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-forest">{message}</p> : null}
        <div className="mb-3 rounded-md border border-forest/10 bg-white p-3">
          <label className="flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-sm">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer or email" value={search} />
          </label>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <select className="rounded-md border border-forest/15 bg-white p-2 text-sm" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select>
            <select className="rounded-md border border-forest/15 bg-white p-2 text-sm" onChange={(event) => setPaymentFilter(event.target.value)} value={paymentFilter}><option value="all">All payments</option>{paymentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select>
            <select className="rounded-md border border-forest/15 bg-white p-2 text-sm" onChange={(event) => setKindFilter(event.target.value as typeof kindFilter)} value={kindFilter}>{kindFilters.map((kind) => <option key={kind} value={kind}>{statusLabel(kind)}</option>)}</select>
            <input className="rounded-md border border-forest/15 bg-white p-2 text-sm" onChange={(event) => setDateFilter(event.target.value)} type="date" value={dateFilter} />
          </div>
          <button className="mt-3 inline-flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest disabled:opacity-45" disabled={!selectedIds.some((id) => orders.find((order) => order.id === id)?.is_test)} onClick={() => void archiveSelectedTestOrders()} type="button"><Archive size={14} />Archive selected test orders</button>
        </div>
        <div className="overflow-hidden rounded-md border border-forest/10 bg-white">
          <div className="border-b border-forest/10 bg-forest px-4 py-3 text-sm font-bold text-cream">Order overview</div>
          <div className="max-h-[72vh] overflow-y-auto">
            {filteredOrders.map((order) => (
              <div className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-forest/10 p-3 text-left transition last:border-b-0 ${selectedId === order.id ? "bg-cream" : "hover:bg-linen"}`} key={order.id}>
                <input checked={selectedIds.includes(order.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, order.id] : current.filter((id) => id !== order.id))} type="checkbox" />
                <button className="min-w-0 text-left" onClick={() => { setSelectedId(order.id); setNotesDraft(order.notes ?? ""); }} type="button">
                  <span className="flex flex-wrap items-center gap-2"><strong className="text-forest">{orderLabel(order)}</strong><span className="rounded-full bg-linen px-2 py-1 text-[11px] font-bold text-coffee">{statusLabel(order.status)}</span></span>
                  <span className="mt-1 block truncate text-sm font-bold text-forest">{order.customer_name}</span>
                  <span className="mt-1 block truncate text-xs text-forest/55">{order.customer_email}</span>
                  <span className="mt-1 block text-xs text-forest/55">{new Date(order.created_at).toLocaleString()} · {formatEuro(Number(order.total))}</span>
                  <span className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold">{order.is_test ? <span className="rounded-full bg-brass/20 px-2 py-1 text-coffee">Test</span> : null}{order.archived_at ? <span className="rounded-full bg-forest px-2 py-1 text-cream">Archived</span> : null}</span>
                </button>
                <ChevronRight className="text-coffee" size={19} />
              </div>
            ))}
            {!message && filteredOrders.length === 0 ? <p className="p-5 text-sm text-forest/60">No orders match this filter.</p> : null}
          </div>
        </div>
      </section>

      {selectedOrder ? <OrderDetail invoiceBusy={invoiceBusy} key={selectedOrder.id} notesDraft={notesDraft} onAdminAction={orderAdminAction} onInvoiceAction={invoiceAction} onNotesChange={setNotesDraft} onOrderUpdated={mergeOrder} onSave={save} onSaveNotes={saveNotes} order={selectedOrder} saving={saving === selectedOrder.id} /> : (
        <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-forest/20 bg-linen p-6 text-center text-sm text-forest/60">Select an order to view customer and product details.</div>
      )}
    </div>
  );
}

function OrderDetail({ invoiceBusy, notesDraft, onAdminAction, onInvoiceAction, onNotesChange, onOrderUpdated, onSave, onSaveNotes, order, saving }: {
  invoiceBusy: string;
  notesDraft: string;
  onAdminAction: (order: BackofficeOrder, action: "mark-test" | "unmark-test" | "archive" | "restore" | "delete-test") => Promise<void>;
  onInvoiceAction: (order: BackofficeOrder, action: "create" | "email", invoiceId?: string) => Promise<void>;
  onNotesChange: (notes: string) => void;
  onOrderUpdated: (row: Partial<BackofficeOrder> & { id: string }) => void;
  onSave: (order: BackofficeOrder, patch: Partial<BackofficeOrder>) => Promise<void>;
  onSaveNotes: (order: BackofficeOrder) => Promise<void>;
  order: BackofficeOrder;
  saving: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [editLines, setEditLines] = useState<EditableOrderLine[]>(() => orderItemsToEditableLines(order.order_items));
  const [editReason, setEditReason] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<OrderSearchProduct[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const phone = order.customer_phone || order.customer?.phone || "";
  const email = order.customer_email || order.customer?.email || "";
  const whatsappNumber = phone.replace(/\D/g, "");
  const items = order.order_items ?? [];
  const calculatedExVat = items.reduce((sum, item) => sum + (Number(item.line_total_ex_vat) || lineTotal(item) / (1 + Number(item.vat_rate) / 100)), 0);
  const subtotalExVat = Number(order.subtotal_ex_vat) || calculatedExVat;
  const vatTotal = Number(order.vat_total) || Math.max(0, Number(order.total) - subtotalExVat);
  const invoiceHistory = order.invoices ?? [];
  const invoice = invoiceHistory.find((item) => item.status !== "void" && !item.voided_at);
  const voidInvoices = invoiceHistory.filter((item) => item.status === "void" || item.voided_at);
  const canInvoice = ["confirmed", "ready_for_collection", "delivered"].includes(order.status) || order.payment_status === "paid";
  const canDeleteTest = Boolean(order.is_test) && !order.inventory_committed && !invoice?.invoice_series?.startsWith("NC");
  const canEditOrder = !invoice && !["cancelled", "delivered"].includes(order.status) && order.payment_status !== "paid" && !order.inventory_committed;
  const invoiceCanBeVoided = Boolean(invoice && !invoice.email_sent_at && order.payment_status !== "paid" && !["cancelled", "delivered"].includes(order.status) && !["paid", "cancelled", "credited", "exported"].includes(invoice.status));
  const canResetInvoice = invoiceCanBeVoided && !order.inventory_committed;
  const canVoidInvoiceAndReleaseInventory = invoiceCanBeVoided && Boolean(order.inventory_committed);
  const canResetLegacyCommitFlag = invoiceCanBeVoided && Boolean(order.inventory_committed);

  const editSubtotalExVat = editLines.reduce((sum, line) => sum + editableLineExVat(line), 0);
  const editTotal = editLines.reduce((sum, line) => sum + editableLineTotal(line), 0);
  const editVatByRate = Array.from(editLines.reduce((map, line) => {
    const rate = Number(line.vatRate) || 0;
    map.set(rate, (map.get(rate) ?? 0) + editableLineTotal(line) - editableLineExVat(line));
    return map;
  }, new Map<number, number>()).entries()).sort(([a], [b]) => a - b);

  async function searchProducts() {
    const query = productQuery.trim();
    if (query.length < 2) {
      setEditMessage("Typ minimaal 2 tekens om producten te zoeken.");
      return;
    }
    setProductLoading(true);
    setEditMessage("");
    try {
      const response = await fetch(`/api/admin/products?mode=order-search&q=${encodeURIComponent(query)}`);
      const { data, message, diagnosticId } = await readSafeJson<{ products?: OrderSearchProduct[] }>(response);
      if (!response.ok || !data) {
        setEditMessage(`${message || "Product search failed."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`);
        setProductResults([]);
        return;
      }
      const results = data.products ?? [];
      setProductResults(results);
      if (results.length === 0) {
        setEditMessage(`Geen producten gevonden voor "${query}". Probeer Magners, cider, 568, productcode of EAN.`);
      }
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "Product search failed.");
      setProductResults([]);
    } finally {
      setProductLoading(false);
    }
  }

  function addProductLine(product: Product, option: ProductPackageOption) {
    setEditLines((current) => {
      const existing = current.find((line) => line.productId === product.id && line.packageLabel === option.label && Number(line.packageQuantity) === Number(option.quantity));
      if (existing) {
        return current.map((line) => line.localId === existing.localId ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, {
        localId: `${product.id}-${option.label}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        packageLabel: option.label,
        packageQuantity: option.quantity,
        salePriceInclVat: option.salePriceInclVat,
        vatRate: Number(product.vatRate) || 0,
      }];
    });
  }

  async function saveCorrectedOrder() {
    if (editReason.trim().length < 3) {
      setEditMessage("Vul eerst een interne reden van minimaal 3 tekens in.");
      return;
    }
    setEditSaving(true);
    setEditMessage("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          action: "replace_items",
          reason: editReason,
          lines: editLines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            packageLabel: line.packageLabel,
            packageQuantity: line.packageQuantity,
          })),
          expectedUpdatedAt: order.updated_at ?? order.created_at,
        }),
      });
      const { data, message, diagnosticId } = await readSafeJson<{ order?: BackofficeOrder; data?: { order?: BackofficeOrder } }>(response);
      if (!response.ok || !data) {
        setEditMessage(`${message || "Order correction could not be saved."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`);
        return;
      }
      const updated = data.order ?? data.data?.order;
      if (updated) {
        onOrderUpdated(updated);
        setEditLines(orderItemsToEditableLines(updated.order_items));
        setEditOpen(false);
        setEditReason("");
        setProductResults([]);
        setProductQuery("");
        setEditMessage("Orderregels zijn server-side opnieuw berekend.");
      } else {
        setEditMessage("Order correction succeeded but the server did not return the updated order. Refresh the admin page.");
      }
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "Order correction could not be saved.");
    } finally {
      setEditSaving(false);
    }
  }

  async function resetInvoiceForCorrection() {
    const reason = window.prompt(`Waarom moet de factuur voor ${orderLabel(order)} worden ingetrokken voor ordercorrectie?`);
    if (!reason || reason.trim().length < 3) return;
    const confirmation = window.prompt("Typ VOID INVOICE om deze nog niet verzonden/onbetaalde factuur in te trekken voor ordercorrectie.");
    if (confirmation !== "VOID INVOICE") return;
    setEditSaving(true);
    setEditMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, action: "reset_invoice_for_correction", reason }),
    });
    const { data, message, diagnosticId } = await readSafeJson<{ order?: BackofficeOrder; data?: { order?: BackofficeOrder } }>(response);
    setEditSaving(false);
    if (!response.ok || !data) {
      setEditMessage(`${message || "Invoice could not be reset for correction."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`);
      return;
    }
    const updated = data.order ?? data.data?.order;
    if (updated) {
      onOrderUpdated(updated);
      setEditOpen(true);
      setEditReason(reason);
      setEditMessage("Factuur is ingetrokken voor ordercorrectie. Corrigeer nu de orderregels en maak daarna een nieuwe factuur met een nieuw nummer.");
    }
  }

  async function voidInvoiceAndReleaseInventoryForCorrection() {
    const reason = window.prompt(`Waarom moet de factuur en voorraadcommit voor ${orderLabel(order)} worden ingetrokken voor ordercorrectie?`);
    if (!reason || reason.trim().length < 3) return;
    const confirmation = window.prompt("Typ RELEASE INVENTORY om de factuur in te trekken en uitsluitend de voorraadmutaties van deze order terug te boeken.");
    if (confirmation !== "RELEASE INVENTORY") return;
    setEditSaving(true);
    setEditMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, action: "void_invoice_release_inventory_for_correction", reason }),
    });
    const { data, message, diagnosticId } = await readSafeJson<{ order?: BackofficeOrder; data?: { order?: BackofficeOrder } }>(response);
    setEditSaving(false);
    if (!response.ok || !data) {
      setEditMessage(`${message || "Invoice and inventory could not be released for correction."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`);
      return;
    }
    const updated = data.order ?? data.data?.order;
    if (updated) {
      onOrderUpdated(updated);
      setEditOpen(true);
      setEditReason(reason);
      setEditMessage("Factuur is ingetrokken en de voorraadcommit van deze order is teruggeboekt. Corrigeer nu de orderregels en maak daarna een nieuwe factuur met een nieuw nummer.");
    }
  }

  async function resetInventoryCommitFlagWithoutMovement() {
    const reason = window.prompt(`Waarom moet alleen de foutieve voorraadcommit-vlag van ${orderLabel(order)} worden hersteld? Er wordt geen voorraadmutatie gemaakt.`);
    if (!reason || reason.trim().length < 3) return;
    const confirmation = window.prompt("Typ RESET COMMIT FLAG om alleen de inventory_committed-vlag te herstellen zonder voorraadbeweging.");
    if (confirmation !== "RESET COMMIT FLAG") return;
    setEditSaving(true);
    setEditMessage("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, action: "reset_inventory_commit_flag_without_movement", reason }),
    });
    const { data, message, diagnosticId } = await readSafeJson<{ order?: BackofficeOrder; data?: { order?: BackofficeOrder } }>(response);
    setEditSaving(false);
    if (!response.ok || !data) {
      setEditMessage(`${message || "Inventory commit flag could not be repaired."}${diagnosticId ? ` Diagnostic ID: ${diagnosticId}` : ""}`);
      return;
    }
    const updated = data.order ?? data.data?.order;
    if (updated) {
      onOrderUpdated(updated);
      setEditMessage("Voorraadcommit-vlag is hersteld zonder voorraadmutatie. Trek nu de factuur apart in voor ordercorrectie.");
    }
  }

  return (
    <section className="min-w-0 rounded-md border border-forest/10 bg-white shadow-soft">
      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-forest/10 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-coffee">Order detail</p><h2 className="mt-1 font-serif text-3xl font-bold text-forest">{orderLabel(order)}</h2><p className="mt-2 flex items-center gap-2 text-sm text-forest/60"><CalendarClock size={16} />{new Date(order.created_at).toLocaleString()}</p></div>
        <div className="flex flex-wrap gap-2">
          {phone ? <a className="inline-flex min-h-9 items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" href={`tel:${phone}`}><Phone size={15} />Call</a> : null}
          {whatsappNumber ? <a className="inline-flex min-h-9 items-center gap-2 rounded-md bg-forest px-3 py-2 text-xs font-bold text-cream" href={`https://wa.me/${whatsappNumber}`} rel="noreferrer" target="_blank"><MessageCircle size={15} />WhatsApp</a> : null}
          {email ? <a className="inline-flex min-h-9 items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" href={`mailto:${email}?subject=${encodeURIComponent(`Nancy's Castalla order ${orderLabel(order)}`)}`}><Mail size={15} />Email</a> : null}
        </div>
      </header>

      <div className="grid gap-3 p-4 lg:grid-cols-2">
        <div className="rounded-md bg-linen p-3"><h3 className="flex items-center gap-2 font-serif text-lg font-bold text-forest"><UserRound size={18} />Customer</h3><dl className="mt-3 grid gap-2 text-sm"><DetailRow label="Name" value={order.customer_name || order.customer?.name} /><DetailRow label="Email" value={email} /><DetailRow label="Phone" value={phone || "Not provided"} /><DetailRow label="Address" value={orderAddress(order)} /><DetailRow label="Language" value={(order.customer?.language || "Unknown").toUpperCase()} /></dl></div>
        <div className="rounded-md bg-linen p-3"><h3 className="flex items-center gap-2 font-serif text-lg font-bold text-forest"><ShoppingBag size={18} />Order</h3><dl className="mt-3 grid gap-2 text-sm"><DetailRow label="Fulfilment" value={order.delivery_method || order.fulfillment || "Not provided"} /><DetailRow label="Status" value={statusLabel(order.status)} /><DetailRow label="Payment" value={statusLabel(order.payment_status)} /><DetailRow label="Method" value={paymentMethodLabel(order.payment_method, "en")} /><DetailRow label="Notes/time" value={visibleNotes(order)} /></dl></div>
      </div>

      <div className="grid gap-3 border-y border-forest/10 p-4 lg:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm font-bold text-forest">Order status<select className="mt-1 w-full rounded-md border border-forest/15 bg-white p-2 font-normal" disabled={saving} onChange={(event) => void onSave(order, { status: event.target.value as OrderStatus })} value={order.status}>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
        <label className="text-sm font-bold text-forest">Payment status<select className="mt-1 w-full rounded-md border border-forest/15 bg-white p-2 font-normal" disabled={saving} onChange={(event) => void onSave(order, { payment_status: event.target.value as PaymentStatus })} value={order.payment_status}>{paymentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
        <div className="flex flex-wrap items-end gap-2">
          {order.archived_at ? <button className="inline-flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" onClick={() => void onAdminAction(order, "restore")} type="button"><RotateCcw size={15} />Restore</button> : <button className="inline-flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" onClick={() => void onAdminAction(order, "archive")} type="button"><Archive size={15} />Archive</button>}
          {order.is_test ? <button className="rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest" onClick={() => void onAdminAction(order, "unmark-test")} type="button">Unmark test</button> : <button className="rounded-md border border-brass/50 px-3 py-2 text-xs font-bold text-coffee" onClick={() => void onAdminAction(order, "mark-test")} type="button">Mark test</button>}
          <button className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40" disabled={!canDeleteTest} onClick={() => void onAdminAction(order, "delete-test")} type="button"><Trash2 size={15} />Delete test</button>
        </div>
      </div>
      {!canDeleteTest ? <p className="mx-4 mt-3 flex gap-2 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800"><ShieldAlert size={18} />Delete is intentionally blocked unless this is an explicit test order with no committed inventory and no official live invoice.</p> : null}

      <details className="border-b border-forest/10 p-4">
        <summary className="cursor-pointer text-sm font-bold text-forest">Internal notes</summary>
        <textarea className="mt-2 min-h-20 w-full rounded-md border border-forest/15 bg-white p-3 text-sm" maxLength={5000} onChange={(event) => onNotesChange(event.target.value)} value={notesDraft}/>
        <button className="mt-2 rounded-md bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={saving || notesDraft === order.notes} onClick={() => void onSaveNotes(order)} type="button">{saving ? "Saving..." : "Save notes"}</button>
      </details>

      <div className="border-b border-forest/10 bg-cream/45 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="flex items-center gap-2 font-serif text-xl font-bold text-forest"><FileText size={19} />Invoice</h3><p className="mt-1 text-sm text-forest/60">{invoice ? `${invoiceLabel(invoice)} · ${invoice.is_test ? "Test" : "Production"} · ${statusLabel(invoice.status)}` : canInvoice ? "This order is eligible for invoicing." : "Confirm, complete or mark the order as paid first."}</p>{!businessConfig.fiscalName || !businessConfig.fiscalId ? <p className="mt-2 text-sm font-bold text-red-700">Fiscal business details are incomplete. Invoice may not be legally complete.</p> : null}</div>
          <div className="flex flex-wrap gap-2">
            {!invoice ? <button className="inline-flex min-h-9 items-center gap-2 rounded-md bg-forest px-3 py-2 text-xs font-bold text-cream disabled:opacity-50" disabled={!canInvoice || Boolean(invoiceBusy)} onClick={() => void onInvoiceAction(order, "create")} type="button"><FileText size={15} />{invoiceBusy === "create" ? "Creating..." : "Order definitief maken en factuur aanmaken"}</button> : <>
              <a className="inline-flex min-h-9 items-center gap-2 rounded-md border border-forest/15 bg-white px-3 py-2 text-xs font-bold text-forest" href={`/api/admin/invoices/${invoice.id}/pdf`}><Download size={15} />PDF</a>
              <button className="inline-flex min-h-9 items-center gap-2 rounded-md bg-forest px-3 py-2 text-xs font-bold text-cream disabled:opacity-50" disabled={Boolean(invoiceBusy)} onClick={() => void onInvoiceAction(order, "email", invoice.id)} type="button"><Send size={15} />{invoiceBusy === "email" ? "Sending..." : invoice.email_sent_at ? "Email again" : "Email customer"}</button>
              <button className="inline-flex min-h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40" disabled={!canResetInvoice || editSaving} onClick={() => void resetInvoiceForCorrection()} type="button"><RotateCcw size={15} />Factuur intrekken voor ordercorrectie</button>
              <button className="inline-flex min-h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40" disabled={!canVoidInvoiceAndReleaseInventory || editSaving} onClick={() => void voidInvoiceAndReleaseInventoryForCorrection()} type="button"><RotateCcw size={15} />Factuur intrekken en voorraad vrijgeven voor ordercorrectie</button>
              <button className="inline-flex min-h-9 items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-800 disabled:opacity-40" disabled={!canResetLegacyCommitFlag || editSaving} onClick={() => void resetInventoryCommitFlagWithoutMovement()} type="button"><ShieldAlert size={15} />Voorraadcommit-vlag herstellen zonder voorraadmutatie</button>
            </>}
          </div>
        </div>
        {voidInvoices.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {voidInvoices.map((voidInvoice) => (
              <article className="rounded-md border border-red-100 bg-white p-3 text-sm" key={voidInvoice.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-red-800">{invoiceLabel(voidInvoice)} · Ingetrokken</p>
                    <p className="mt-1 text-xs text-forest/65">{voidInvoice.voided_at ? new Date(voidInvoice.voided_at).toLocaleString() : "Datum onbekend"} · {voidInvoice.voided_by || "beheerder onbekend"}</p>
                  </div>
                  <a className="inline-flex min-h-9 items-center gap-2 rounded-md border border-forest/15 bg-white px-3 py-2 text-xs font-bold text-forest" href={`/api/admin/invoices/${voidInvoice.id}/pdf`}><Download size={15} />Historische PDF</a>
                </div>
                <p className="mt-2 text-xs text-forest/70">{voidInvoice.void_reason || "Geen reden opgeslagen."}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <div className="border-b border-forest/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-forest"><PackagePlus size={19} />Order controleren en bewerken</h3>
            <p className="mt-1 text-sm text-forest/60">{canEditOrder ? "Pas producten en aantallen aan voordat je de order definitief factureert." : "Orderregels zijn vergrendeld door status, betaling, voorraadboeking of factuur."}</p>
          </div>
          <button className="rounded-md bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-45" disabled={!canEditOrder} onClick={() => setEditOpen((open) => !open)} type="button">
            {editOpen ? "Editor sluiten" : "Order bewerken"}
          </button>
        </div>
        {editMessage ? <p className="mt-3 rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-forest">{editMessage}</p> : null}
        {editOpen ? (
          <div className="mt-4 grid gap-4">
            <label className="text-sm font-bold text-forest">Interne reden voor correctie
              <textarea className="mt-1 min-h-20 w-full rounded-md border border-forest/15 bg-white p-3 font-normal" onChange={(event) => setEditReason(event.target.value)} placeholder="Bijv. Magners cans unavailable, replaced with Magners bottles 568 ml." value={editReason} />
            </label>
            <div className="grid gap-3">
              {editLines.map((line) => (
                <article className="rounded-md border border-forest/10 bg-linen p-3" key={line.localId}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><p className="text-xs font-bold text-coffee">{line.productId}</p><h4 className="font-bold text-forest">{line.productName}</h4><p className="text-xs text-forest/60">{line.packageLabel} · IVA {line.vatRate}%</p></div>
                    <button className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700" onClick={() => setEditLines((current) => current.filter((item) => item.localId !== line.localId))} type="button"><Trash2 size={14} />Verwijder</button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_140px] sm:items-end">
                    <label className="text-xs font-bold text-forest">Aantal<input className="mt-1 h-11 w-full rounded-md border border-forest/15 bg-white px-3 text-sm" min="1" onChange={(event) => setEditLines((current) => current.map((item) => item.localId === line.localId ? { ...item, quantity: Math.max(1, Number(event.target.value) || 1) } : item))} type="number" value={line.quantity} /></label>
                    <div className="text-xs text-forest/65">Server rekent bij opslaan de actuele prijs, IVA en verpakking opnieuw uit.</div>
                    <strong className="text-right text-forest">{formatEuro(editableLineTotal(line))}</strong>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-md border border-forest/10 bg-white p-3">
              <label className="flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-sm">
                <Search size={16} />
                <input className="w-full bg-transparent outline-none" onChange={(event) => setProductQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchProducts(); } }} placeholder="Zoek productnaam, code, EAN of verpakking" value={productQuery} />
              </label>
              <button className="mt-2 rounded-md bg-forest px-4 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={productLoading} onClick={() => void searchProducts()} type="button">{productLoading ? "Zoeken..." : "Product zoeken"}</button>
              <div className="mt-3 grid gap-2">
                {productResults.map((product) => {
                  const blockers = product.orderSearchBlockers ?? [];
                  const allowed = product.orderSearchAllowed !== false && blockers.length === 0;
                  return (
                  <article className="rounded-md border border-forest/10 bg-linen p-3" key={product.id}>
                    <div><p className="text-xs font-bold text-coffee">{product.id}{product.supplierCode ? ` · Supplier ${product.supplierCode}` : ""}</p><h4 className="font-bold text-forest">{product.name}</h4><p className="text-xs text-forest/60">{product.unit} · IVA {product.vatRate}% · {formatEuro(Number(product.salePriceInclVat))}</p></div>
                    {!allowed ? <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs font-bold text-amber-900">Niet toe te voegen: {blockers.join(" ")}</div> : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {productPackages(product).map((option) => <button className="rounded-md border border-forest/15 bg-white px-3 py-2 text-xs font-bold text-forest disabled:cursor-not-allowed disabled:opacity-40" disabled={!allowed} key={`${product.id}-${option.label}-${option.quantity}`} onClick={() => addProductLine(product, option)} type="button">Toevoegen: {option.label} · {formatEuro(option.salePriceInclVat)}</button>)}
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 z-20 ml-auto grid w-full max-w-md gap-2 rounded-md border border-forest/10 bg-cream p-4 text-sm shadow-soft">
              <div className="flex justify-between gap-4"><span>Subtotaal excl. IVA</span><strong>{formatEuro(editSubtotalExVat)}</strong></div>
              {editVatByRate.map(([rate, value]) => <div className="flex justify-between gap-4" key={rate}><span>IVA {rate}%</span><strong>{formatEuro(value)}</strong></div>)}
              <div className="flex justify-between gap-4 border-t border-forest/10 pt-2 text-lg"><span className="font-bold">Totaal incl. IVA</span><strong>{formatEuro(editTotal)}</strong></div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button className="rounded-md bg-forest px-4 py-3 text-sm font-bold text-cream disabled:opacity-50" disabled={editSaving || editLines.length === 0} onClick={() => void saveCorrectedOrder()} type="button">{editSaving ? "Opslaan..." : "Correctie opslaan"}</button>
                <button className="rounded-md border border-forest/15 bg-white px-4 py-3 text-sm font-bold text-forest disabled:opacity-50" disabled={editSaving} onClick={() => { setEditOpen(false); setEditLines(orderItemsToEditableLines(order.order_items)); setProductResults([]); setProductQuery(""); setEditMessage(""); }} type="button">Annuleren</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-4"><h3 className="font-serif text-2xl font-bold text-forest">Ordered products</h3>{items.length === 0 ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Deze order heeft geen orderregels.</p> : <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-forest text-cream"><tr><th className="p-2">Code</th><th className="p-2">Product</th><th className="p-2">Package</th><th className="p-2">Qty</th><th className="p-2">Unit</th><th className="p-2">VAT</th><th className="p-2 text-right">Total</th></tr></thead><tbody>{items.map((item) => <tr className="border-b border-forest/10" key={item.id}><td className="p-2 font-bold">{item.product_id || "-"}</td><td className="p-2">{item.product_name}</td><td className="p-2">{item.package_label || item.unit}</td><td className="p-2">{item.quantity}</td><td className="p-2">{formatEuro(Number(item.sale_price_incl_vat))}</td><td className="p-2">{Number(item.vat_rate)}%</td><td className="p-2 text-right font-bold">{formatEuro(lineTotal(item))}</td></tr>)}</tbody></table></div><div className="mt-4 grid gap-3 md:hidden">{items.map((item) => <article className="rounded-md border border-forest/10 p-4" key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-coffee">{item.product_id || "-"}</p><h4 className="mt-1 font-bold text-forest">{item.product_name}</h4></div><strong>{formatEuro(lineTotal(item))}</strong></div><dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-forest/65"><DetailRow label="Package" value={item.package_label || item.unit} /><DetailRow label="Quantity" value={String(item.quantity)} /><DetailRow label="Unit price" value={formatEuro(Number(item.sale_price_incl_vat))} /><DetailRow label="VAT" value={`${Number(item.vat_rate)}%`} /></dl></article>)}</div></>}</div>

      <div className="ml-auto grid max-w-md gap-2 border-t border-forest/10 p-4 text-sm"><div className="flex justify-between gap-4"><span>Subtotal excl. VAT</span><strong>{formatEuro(subtotalExVat)}</strong></div><div className="flex justify-between gap-4"><span>VAT</span><strong>{formatEuro(vatTotal)}</strong></div><div className="flex justify-between gap-4 border-t border-forest/10 pt-2 text-lg"><span className="font-bold">Total incl. VAT</span><strong>{formatEuro(Number(order.total))}</strong></div></div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)]"><dt className="font-bold text-forest/60">{label}</dt><dd className="min-w-0 break-words text-forest">{value || "-"}</dd></div>;
}
