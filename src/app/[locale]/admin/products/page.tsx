import { AdminProductManager } from "@/components/AdminProductManager";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Admin</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">Product management</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">
        Add products manually with product codes and supplier codes. Saving requires Supabase environment variables.
      </p>
      <AdminProductManager />
    </section>
  );
}
