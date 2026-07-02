import { AdminProductManager } from "@/components/AdminProductManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin-page";
import { getProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ params }: { params: Promise<unknown> }) {
  const locale = await requireAdmin(params);
  const products = await getProducts({ includeHidden: true });
  return (
    <AdminShell locale={locale} title="Products" subtitle="Add, edit, publish, filter and remove products from one workspace.">
      <AdminProductManager initialProducts={products} />
    </AdminShell>
  );
}
