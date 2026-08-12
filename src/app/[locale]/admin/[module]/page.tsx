import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { InvoicesPanel } from "@/components/admin/InvoicesPanel";
import { CustomersPanel } from "@/components/admin/CustomersPanel";
import { SupplierImportsPanel } from "@/components/admin/SupplierImportsPanel";
import { PurchasingPanel } from "@/components/admin/PurchasingPanel";
import { ReportsPanel } from "@/components/admin/ReportsPanel";
import { businessConfig } from "@/config/business";
import { requireAdmin } from "@/lib/admin-page";
import { productCategories } from "@/lib/product-categories";
import { getProducts } from "@/lib/product-store";
import { integrationRegistry } from "@/services/integrations/registry";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

const moduleCopy = {
  categories: ["Categories", "Manage the structure customers use to browse products."],
  customers: ["Customers", "Review, archive and safely clean up customer records without deleting real accounts."],
  orders: ["Orders", "Review orders and manage order and payment statuses."],
  inventory: ["Inventory", "Stock control, deliveries and low-stock monitoring."],
  suppliers: ["Suppliers", "Supplier details are separated from public product information."],
  imports: ["Supplier imports", "Dry-run supplier lists, review conflicts and prepare approved live catalogue batches."],
  purchasing: ["Purchasing", "Supplier purchase orders, supplier invoices and goods receipts."],
  invoicing: ["Invoicing", "Review, download and email invoices created from eligible orders."],
  vat: ["VAT", "Review IVA rates used by products and future invoices."],
  reports: ["Reports", "Sales and purchase IVA reporting with test data excluded by default."],
  settings: ["Settings", "Central business and communication settings."],
  integrations: ["API integrations", "Prepared connection points. No external integration is active."],
} as const;

export const dynamic = "force-dynamic";

function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<React.ReactNode>> }) {
  return <div className="mt-6 overflow-x-auto rounded-md border border-forest/10 bg-white"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-forest text-cream"><tr>{columns.map((column) => <th className="p-3" key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr className="border-t border-forest/10" key={index}>{row.map((cell, cellIndex) => <td className="p-3" key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 ? <p className="p-5 text-forest/60">No records yet.</p> : null}</div>;
}

async function safeRows<T>(path: string) { try { return await supabaseAdminFetch<T[]>(path); } catch { return []; } }

export default async function AdminModulePage({ params }: { params: Promise<unknown> }) {
  const resolved = await params as { locale?: string; module?: string };
  const locale = await requireAdmin(Promise.resolve(resolved));
  const moduleName = resolved.module as keyof typeof moduleCopy;
  if (!moduleCopy[moduleName]) notFound();
  const [title, subtitle] = moduleCopy[moduleName];
  let content: React.ReactNode;
  if (moduleName === "orders") content = <OrdersPanel />;
  else if (moduleName === "inventory") content = <InventoryPanel />;
  else if (moduleName === "categories") content = <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{productCategories.map((category) => <div className="rounded-md border border-forest/10 bg-white p-4 font-bold text-forest" key={category}>{category}</div>)}</div>;
  else if (moduleName === "integrations") content = <div className="mt-6 grid gap-3 sm:grid-cols-2">{integrationRegistry.map((item) => <div className="flex items-center justify-between rounded-md border border-forest/10 bg-white p-4" key={item.id}><strong>{item.name}</strong><span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-forest">{item.status}</span></div>)}</div>;
  else if (moduleName === "settings") content = <div className="mt-6 rounded-md border border-forest/10 bg-white p-5 text-sm leading-7 text-forest"><p><strong>Information:</strong> {businessConfig.emails.info}</p><p><strong>Orders:</strong> {businessConfig.emails.orders}</p><p><strong>Accounts:</strong> {businessConfig.emails.account}</p><p><strong>Business mode:</strong> {businessConfig.businessMode}</p><p><strong>Production invoice series:</strong> {businessConfig.invoiceSeries}</p><p><strong>Test invoice series:</strong> {businessConfig.invoiceTestSeries}</p><p className="mt-3 rounded-md border border-brass/30 bg-cream p-3 font-bold text-coffee">Warning: switching from prelaunch to live affects only future invoices. Existing invoice numbers are never changed automatically.</p><p className="mt-3 text-forest/60">Business values are centrally configurable in config/business.ts.</p></div>;
  else if (moduleName === "customers") content = <CustomersPanel />;
  else if (moduleName === "suppliers") { const rows = await safeRows<{ name: string; code: string; email: string; phone: string; active: boolean }>("suppliers?select=name,code,email,phone,active&order=name.asc&limit=500"); content = <DataTable columns={["Supplier", "Code", "Email", "Phone", "Status"]} rows={rows.map((row) => [row.name, row.code || "-", row.email || "-", row.phone || "-", row.active ? "Active" : "Inactive"])}/>; }
  else if (moduleName === "imports") content = <SupplierImportsPanel />;
  else if (moduleName === "purchasing") content = <PurchasingPanel />;
  else if (moduleName === "invoicing") content = <InvoicesPanel />;
  else if (moduleName === "reports") content = <ReportsPanel />;
  else { const products = await getProducts({ includeHidden: true }); const label = moduleName === "vat" ? `${new Set(products.map((p) => p.vatRate)).size} IVA rates in use` : "Module prepared"; content = <div className="mt-6 rounded-md border border-forest/10 bg-white p-6"><p className="font-bold text-forest">{label}</p><p className="mt-2 text-sm text-forest/65">The database and service boundaries are ready for this module without activating an external provider.</p></div>; }
  return <AdminShell locale={locale} title={title} subtitle={subtitle}>{content}</AdminShell>;
}
