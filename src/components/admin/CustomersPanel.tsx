"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, RotateCcw, Search, ShieldAlert, Trash2, UserRound } from "lucide-react";
import type { BackofficeCustomer } from "@/types/backoffice";

type CustomerFilter = "active" | "archived" | "test" | "without-account" | "with-account";

const filters: Array<[CustomerFilter, string]> = [
  ["active", "Active"],
  ["archived", "Archived"],
  ["test", "Test / diagnostic"],
  ["without-account", "Without account"],
  ["with-account", "With account"],
];

function canDelete(customer: BackofficeCustomer) {
  return !customer.auth_user_id && !customer.order_count && !customer.invoice_count;
}

export function CustomersPanel() {
  const [customers, setCustomers] = useState<BackofficeCustomer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("active");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("Loading customers...");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.customers ?? []; })
      .then((rows: BackofficeCustomer[]) => { setCustomers(rows); setSelectedId(rows[0]?.id ?? ""); setMessage(""); })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Customers could not be loaded."));
  }, []);

  const filteredCustomers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch = !needle || `${customer.name} ${customer.email} ${customer.phone ?? ""}`.toLowerCase().includes(needle);
      const matchesFilter =
        filter === "active" ? !customer.archived_at :
        filter === "archived" ? Boolean(customer.archived_at) :
        filter === "test" ? Boolean(customer.is_test) :
        filter === "without-account" ? !customer.auth_user_id :
        Boolean(customer.auth_user_id);
      return matchesSearch && matchesFilter;
    });
  }, [customers, filter, search]);

  const selectedCustomer = customers.find((customer) => customer.id === selectedId);

  function updateCustomer(row: BackofficeCustomer) {
    setCustomers((current) => current.map((customer) => customer.id === row.id ? { ...customer, ...row } : customer));
  }

  async function customerAction(customer: BackofficeCustomer, action: "archive" | "restore" | "mark-test" | "unmark-test") {
    setBusy(`${customer.id}:${action}`);
    setMessage("");
    const payload = action === "archive" || action === "restore"
      ? { id: customer.id, action: "archive", archived: action === "archive" }
      : { id: customer.id, action: "mark_test", isTest: action === "mark-test", reason: action === "mark-test" ? "Marked from admin cleanup" : "" };
    const response = await fetch("/api/admin/customers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    setBusy("");
    if (!response.ok) { setMessage(data.message ?? "Customer action failed."); return; }
    updateCustomer(data.customer);
    setMessage("Customer updated.");
  }

  async function deleteCustomer(customer: BackofficeCustomer) {
    const confirmation = window.prompt(`Type this customer name or email to delete:\n${customer.name}\n${customer.email}`);
    if (!confirmation) return;
    setBusy(`${customer.id}:delete`);
    setMessage("");
    const response = await fetch("/api/admin/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: customer.id, confirmation }) });
    const data = await response.json();
    setBusy("");
    if (!response.ok) { setMessage(data.message ?? "Customer could not be deleted."); return; }
    setCustomers((current) => current.filter((item) => item.id !== customer.id));
    setSelectedId((current) => current === customer.id ? customers.find((item) => item.id !== customer.id)?.id ?? "" : current);
    setMessage("Customer deleted.");
  }

  async function archiveSelectedTests() {
    const targets = customers.filter((customer) => selectedIds.includes(customer.id) && customer.is_test && !customer.archived_at);
    for (const customer of targets) await customerAction(customer, "archive");
    setSelectedIds([]);
    setMessage(`${targets.length} test customer(s) archived.`);
  }

  return (
    <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="min-w-0">
        {message ? <p className="mb-4 rounded-md border border-brass/30 bg-cream p-3 text-sm font-bold text-forest">{message}</p> : null}
        <div className="rounded-md border border-forest/10 bg-white p-3">
          <label className="flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-sm">
            <Search size={16} />
            <input className="w-full bg-transparent outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone" value={search} />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map(([value, label]) => <button className={`rounded-full border px-3 py-2 text-xs font-bold ${filter === value ? "border-forest bg-forest text-cream" : "border-forest/15 text-forest"}`} key={value} onClick={() => setFilter(value)} type="button">{label}</button>)}
          </div>
          <button className="mt-3 inline-flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-xs font-bold text-forest disabled:opacity-45" disabled={!selectedIds.some((id) => customers.find((customer) => customer.id === id)?.is_test)} onClick={() => void archiveSelectedTests()} type="button"><Archive size={14} />Archive selected test records</button>
        </div>
        <div className="mt-3 max-h-[68vh] overflow-y-auto rounded-md border border-forest/10 bg-white">
          {filteredCustomers.map((customer) => (
            <div className={`grid grid-cols-[auto_minmax(0,1fr)] gap-2 border-b border-forest/10 p-3 last:border-b-0 ${selectedId === customer.id ? "bg-cream" : ""}`} key={customer.id}>
              <input checked={selectedIds.includes(customer.id)} className="mt-1" onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, customer.id] : current.filter((id) => id !== customer.id))} type="checkbox" />
              <button className="min-w-0 text-left" onClick={() => setSelectedId(customer.id)} type="button">
                <span className="block truncate text-sm font-bold text-forest">{customer.name || customer.email}</span>
                <span className="block truncate text-xs text-forest/60">{customer.email}</span>
                <span className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold">
                  {customer.auth_user_id ? <span className="rounded-full bg-forest/10 px-2 py-1 text-forest">Account</span> : <span className="rounded-full bg-linen px-2 py-1 text-forest/65">No account</span>}
                  {customer.is_test ? <span className="rounded-full bg-brass/20 px-2 py-1 text-coffee">Test</span> : null}
                  {customer.archived_at ? <span className="rounded-full bg-forest px-2 py-1 text-cream">Archived</span> : null}
                </span>
              </button>
            </div>
          ))}
          {!message && filteredCustomers.length === 0 ? <p className="p-5 text-sm text-forest/60">No customers match this filter.</p> : null}
        </div>
      </section>

      {selectedCustomer ? (
        <section className="min-w-0 rounded-md border border-forest/10 bg-white shadow-soft">
          <header className="sticky top-0 z-10 border-b border-forest/10 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-coffee">Customer detail</p>
            <h2 className="mt-1 flex items-center gap-2 font-serif text-3xl font-bold text-forest"><UserRound size={24} />{selectedCustomer.name || selectedCustomer.email}</h2>
          </header>
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <Detail label="Email" value={selectedCustomer.email} />
            <Detail label="Phone / WhatsApp" value={selectedCustomer.phone || "-"} />
            <Detail label="Language" value={(selectedCustomer.language || "en").toUpperCase()} />
            <Detail label="Address" value={selectedCustomer.address || "-"} />
            <Detail label="Created" value={selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleString() : "-"} />
            <Detail label="Auth linked" value={selectedCustomer.auth_user_id ? "Yes" : "No"} />
            <Detail label="Order count" value={String(selectedCustomer.order_count ?? 0)} />
            <Detail label="Invoice count" value={String(selectedCustomer.invoice_count ?? 0)} />
            <Detail label="Test reason" value={selectedCustomer.test_reason || "-"} />
            <Detail label="Archived" value={selectedCustomer.archived_at ? new Date(selectedCustomer.archived_at).toLocaleString() : "No"} />
          </div>
          <div className="border-t border-forest/10 p-4">
            <div className="flex flex-wrap gap-2">
              {selectedCustomer.archived_at ? <button className="inline-flex items-center gap-2 rounded-md border border-forest/15 px-3 py-2 text-sm font-bold text-forest disabled:opacity-50" disabled={Boolean(busy)} onClick={() => void customerAction(selectedCustomer, "restore")} type="button"><RotateCcw size={16} />Restore</button> : <button className="inline-flex items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={Boolean(busy)} onClick={() => void customerAction(selectedCustomer, "archive")} type="button"><Archive size={16} />Archive</button>}
              {selectedCustomer.is_test ? <button className="rounded-md border border-forest/15 px-3 py-2 text-sm font-bold text-forest disabled:opacity-50" disabled={Boolean(busy)} onClick={() => void customerAction(selectedCustomer, "unmark-test")} type="button">Unmark test</button> : <button className="rounded-md border border-brass/50 px-3 py-2 text-sm font-bold text-coffee disabled:opacity-50" disabled={Boolean(busy)} onClick={() => void customerAction(selectedCustomer, "mark-test")} type="button">Mark test</button>}
              <button className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-40" disabled={Boolean(busy) || !canDelete(selectedCustomer)} onClick={() => void deleteCustomer(selectedCustomer)} type="button"><Trash2 size={16} />Delete</button>
            </div>
            {!canDelete(selectedCustomer) ? <p className="mt-3 flex gap-2 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800"><ShieldAlert size={18} />Delete is blocked because this customer has an account, order or invoice. Use archive instead.</p> : <p className="mt-3 text-sm text-forest/60">Delete is only available for customers without login account, orders and invoices, and requires exact name/email confirmation.</p>}
          </div>
        </section>
      ) : <div className="grid min-h-64 place-items-center rounded-md border border-dashed border-forest/20 bg-linen p-6 text-sm text-forest/60">Select a customer.</div>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-linen p-3 text-sm"><dt className="font-bold text-forest/60">{label}</dt><dd className="mt-1 break-words font-bold text-forest">{value}</dd></div>;
}
