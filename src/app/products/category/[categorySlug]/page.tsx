import { redirect } from "next/navigation";

export default async function ProductCategoryRedirectPage({ params }: { params: Promise<unknown> }) {
  const { categorySlug } = (await params) as { categorySlug?: string };
  redirect(`/en/products/category/${encodeURIComponent(categorySlug ?? "")}`);
}
