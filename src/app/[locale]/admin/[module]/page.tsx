import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { businessConfig } from "@/config/business";
import { requireAdmin } from "@/lib/admin-page";
import { productCategories } from "@/lib/product-categories";
import { getProducts } from "@/lib/product-store";
import { integrationRegistry } from "@/services/integrations/registry";

const moduleCopy = {
  categories: ["Categories", "Manage the structure customers use to browse products."],
  customers: ["Customers", "Customer profiles and order history are prepared in the database."],
  orders: ["Orders", "Review orders and manage order and payment statuses."],
  inventory: ["Inventory", "Stock control, deliveries and low-stock monitoring."],
  suppliers: ["Suppliers", "Supplier details are separated from public product information."],
  purchasing: ["Purchasing", "Purchase orders and incoming deliveries are ready for the next phase."],
  invoicing: ["Invoicing", "Invoice records are prepared; no external invoicing service is active."],
  vat: ["VAT", "Review IVA rates used by products and future invoices."],
  reports: ["Reports", "Reporting is prepared for sales, margins, stock and VAT."],
  settings: ["Settings", "Central business and communication settings."],
  integrations: ["API integrations", "Prepared connection points. No external integration is active."],
} as const;

export const dynamic = "force-dynamic";

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
  else if (moduleName === "settings") content = <div className="mt-6 rounded-md border border-forest/10 bg-white p-5 text-sm leading-7 text-forest"><p><strong>Information:</strong> {businessConfig.emails.info}</p><p><strong>Orders:</strong> {businessConfig.emails.orders}</p><p><strong>Accounts:</strong> {businessConfig.emails.account}</p><p className="mt-3 text-forest/60">Business values are centrally configurable in config/business.ts.</p></div>;
  else { const products = await getProducts({ includeHidden: true }); const label = moduleName === "vat" ? `${new Set(products.map((p) => p.vatRate)).size} IVA rates in use` : "Module prepared"; content = <div className="mt-6 rounded-md border border-forest/10 bg-white p-6"><p className="font-bold text-forest">{label}</p><p className="mt-2 text-sm text-forest/65">The database and service boundaries are ready for this module without activating an external provider.</p></div>; }
  return <AdminShell locale={locale} title={title} subtitle={subtitle}>{content}</AdminShell>;
}
