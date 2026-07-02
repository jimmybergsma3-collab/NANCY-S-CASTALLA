"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  FolderTree,
  Gauge,
  LogOut,
  PackageSearch,
  Plug,
  ReceiptText,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

const modules = [
  { slug: "", label: "Dashboard", icon: Gauge },
  { slug: "products", label: "Products", icon: PackageSearch },
  { slug: "categories", label: "Categories", icon: FolderTree },
  { slug: "customers", label: "Customers", icon: Users },
  { slug: "orders", label: "Orders", icon: ShoppingCart },
  { slug: "inventory", label: "Inventory", icon: Boxes },
  { slug: "suppliers", label: "Suppliers", icon: Building2 },
  { slug: "purchasing", label: "Purchasing", icon: ClipboardList },
  { slug: "invoicing", label: "Invoicing", icon: FileText },
  { slug: "vat", label: "VAT", icon: ReceiptText },
  { slug: "reports", label: "Reports", icon: ChartNoAxesCombined },
  { slug: "settings", label: "Settings", icon: Settings },
  { slug: "integrations", label: "API integrations", icon: Plug },
] as const;

export function AdminShell({ children, locale, subtitle, title }: { children: React.ReactNode; locale: Locale; subtitle?: string; title: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace(`/${locale}/admin/login`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[1700px] px-4 py-8">
      <div className="grid gap-6 xl:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="h-fit border-b border-forest/10 pb-5 xl:sticky xl:top-28 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-coffee">Nancy&apos;s Castalla</p>
              <p className="mt-1 font-serif text-2xl font-bold text-forest">Backoffice</p>
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-md border border-forest/15 text-forest" onClick={logout} title="Sign out" type="button">
              <LogOut size={18} />
            </button>
          </div>
          <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-1">
            {modules.map(({ icon: Icon, label, slug }) => {
              const href = `/${locale}/admin${slug ? `/${slug}` : ""}`;
              const active = pathname === href || (slug === "products" && pathname.startsWith(`${href}/`));
              return (
                <Link className={`flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${active ? "bg-forest text-cream" : "text-forest hover:bg-cream"}`} href={href} key={label}>
                  <Icon size={17} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0">
          <header className="border-b border-forest/10 pb-5">
            <h1 className="font-serif text-4xl font-bold text-forest">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-4xl text-sm leading-6 text-forest/65">{subtitle}</p> : null}
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
