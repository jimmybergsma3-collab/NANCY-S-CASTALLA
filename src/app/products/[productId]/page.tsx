import { redirect } from "next/navigation";

export default async function ProductDetailRedirectPage({ params }: { params: Promise<unknown> }) {
  const { productId } = (await params) as { productId?: string };
  redirect(`/en/products/${encodeURIComponent(productId ?? "")}`);
}
