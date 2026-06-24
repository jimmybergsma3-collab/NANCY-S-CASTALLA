import { PricingTable } from "@/components/PricingTable";

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Admin helper</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">Pricing helper</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">
        Edit prices in <code className="rounded bg-cream px-2 py-1">src/data/products.ts</code>. This helper recalculates
        estimated profit and margin from cost price excluding IVA, IVA rate and sale price including IVA.
      </p>
      <div className="mt-8">
        <PricingTable />
      </div>
    </section>
  );
}
