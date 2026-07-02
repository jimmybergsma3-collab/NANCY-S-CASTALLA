import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin-page";
import { getProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params }: { params: Promise<unknown> }) {
  const locale = await requireAdmin(params);
  const products = await getProducts({ includeHidden: true });
  const visible = products.filter((product) => product.isVisible).length;
  const lowStock = products.filter((product) => product.trackInventory && Number(product.stockQuantity) <= Number(product.minimumStock)).length;
  const cards = [["Products", products.length], ["Online", visible], ["Hidden", products.length - visible], ["Low stock", lowStock]] as const;
  return <AdminShell locale={locale} title="Dashboard" subtitle="A clear overview of products, availability and daily operations."><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <div className="rounded-md border border-forest/10 bg-white p-5 shadow-soft" key={label}><p className="text-xs font-bold uppercase tracking-[0.14em] text-coffee">{label}</p><p className="mt-2 font-serif text-4xl font-bold text-forest">{value}</p></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><Link className="rounded-md bg-forest px-4 py-3 font-bold text-cream" href={`/${locale}/admin/products`}>Manage products</Link><Link className="rounded-md border border-forest/20 bg-white px-4 py-3 font-bold text-forest" href={`/${locale}/admin/orders`}>View orders</Link><Link className="rounded-md border border-forest/20 bg-white px-4 py-3 font-bold text-forest" href={`/${locale}/admin/inventory`}>Manage inventory</Link></div></AdminShell>;
}
