"use client";

import { useEffect, useState } from "react";

type SupplierInvoiceSummary = {
  id: string;
  supplier_invoice_number?: string | null;
  invoice_date?: string | null;
  status?: string | null;
  total_ex_vat?: number | null;
  vat_total?: number | null;
  total_incl_vat?: number | null;
  needs_review?: boolean | null;
};

type ReportsData = {
  schemaReady: boolean;
  diagnostics: string[];
  sales: {
    orderCount: number;
    productionOrderCount?: number;
    excludedTestOrderCount?: number;
    paidRevenue: number;
  };
  purchases?: {
    supplierInvoiceCount: number;
    totalExVat: number;
    vatTotal: number;
    totalInclVat: number;
  };
  supplierInvoices: SupplierInvoiceSummary[];
};

type ApiResponse =
  | { ok: true; diagnosticId: string; report: ReportsData }
  | { ok: false; diagnosticId: string; errorCode: string; message: string };

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(value ?? 0));
}

export function ReportsPanel() {
  const [report, setReport] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadReport() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/purchasing?view=reports", { cache: "no-store" });
        const data = (await response.json()) as ApiResponse;
        if (!response.ok || !data.ok) {
          throw new Error(data.ok ? "Report could not be loaded." : `${data.message} (${data.diagnosticId})`);
        }
        if (mounted) setReport(data.report);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Report could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadReport();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">Loading reports...</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (!report) return null;

  const purchaseTotals = report.purchases ?? { supplierInvoiceCount: report.supplierInvoices.length, totalExVat: 0, vatTotal: 0, totalInclVat: 0 };
  const cards = [
    ["Production orders", String(report.sales.productionOrderCount ?? report.sales.orderCount)],
    ["Test orders excluded", String(report.sales.excludedTestOrderCount ?? 0)],
    ["Paid customer revenue", money(report.sales.paidRevenue)],
    ["Purchase IVA", money(purchaseTotals.vatTotal)],
  ];

  return (
    <div className="space-y-6">
      {!report.schemaReady ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Run the purchasing migration before supplier invoice reporting is complete. Diagnostics: {report.diagnostics.join(" | ")}
        </div>
      ) : null}

      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
        Sales/customer invoices and supplier invoices are reported separately. Test orders are excluded from sales totals by default.
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div className="rounded-md border border-forest/10 bg-white p-5 shadow-soft" key={label}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-coffee">{label}</p>
            <p className="mt-2 font-serif text-3xl font-bold text-forest">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Supplier invoices</h2>
            <p className="text-sm text-slate-500">Separate purchase IVA totals for received supplier documents.</p>
          </div>
          <div className="text-right text-sm text-slate-700">
            <strong>{purchaseTotals.supplierInvoiceCount}</strong> invoices - {money(purchaseTotals.totalInclVat)} incl. IVA
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-2">Invoice</th>
                <th className="p-2">Date</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ex IVA</th>
                <th className="p-2">IVA</th>
                <th className="p-2">Incl IVA</th>
                <th className="p-2">Review</th>
              </tr>
            </thead>
            <tbody>
              {report.supplierInvoices.map((invoice) => (
                <tr className="border-t border-slate-100" key={invoice.id}>
                  <td className="p-2 font-medium">{invoice.supplier_invoice_number || invoice.id.slice(0, 8)}</td>
                  <td className="p-2">{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "-"}</td>
                  <td className="p-2">{invoice.status || "review"}</td>
                  <td className="p-2">{money(invoice.total_ex_vat)}</td>
                  <td className="p-2">{money(invoice.vat_total)}</td>
                  <td className="p-2">{money(invoice.total_incl_vat)}</td>
                  <td className="p-2">{invoice.needs_review ? "Needs review" : "OK"}</td>
                </tr>
              ))}
              {report.supplierInvoices.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-500" colSpan={7}>No supplier invoices found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
