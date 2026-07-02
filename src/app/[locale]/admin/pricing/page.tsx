import { PricingTable } from "@/components/PricingTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin-page";

export default async function PricingPage({ params }: { params: Promise<unknown> }) {
  const locale = await requireAdmin(params);
  return (
    <AdminShell locale={locale} title="Pricing helper" subtitle="Review purchase cost, IVA, sale price and profit without exposing supplier data publicly.">
      <p className="mt-6 max-w-3xl leading-7 text-forest/72">
        Edit prices in <code className="rounded bg-cream px-2 py-1">src/data/products.ts</code>. This helper recalculates
        estimated profit and margin from supplier case cost, purchase cost per customer unit, IVA rate and your manually
        chosen sale price. IVA is shown separately, because it is not profit.
      </p>
      <div className="mt-8">
        <PricingTable />
      </div>
    </AdminShell>
  );
}
