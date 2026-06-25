/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductOrder } from "@/components/ProductOrder";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";
import { formatEuro } from "@/lib/pricing";
import { getProductById } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale, productId: rawProductId } = (await params) as {
    locale?: string;
    productId?: string;
  };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);
  const productId = rawProductId ? decodeURIComponent(rawProductId) : "";
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Link className="text-sm font-bold text-coffee underline-offset-4 hover:underline" href={`/${locale}/products`}>
        Back to products
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          {product.imageUrl ? (
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-forest/10 bg-cream shadow-soft">
              <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
            </div>
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-lg border border-forest/10 bg-cream text-sm font-bold text-forest/55 shadow-soft">
              Photo coming soon
            </div>
          )}
        </div>
        <div className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-coffee">{product.category}</p>
          <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{product.name}</h1>
          <p className="mt-4 leading-7 text-forest/72">{product.description}</p>
          <div className="mt-6 grid gap-3 rounded-lg bg-cream p-4 text-sm text-forest">
            <div className="flex justify-between gap-4">
              <span>Product code</span>
              <strong>{product.id}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>Price</span>
              <strong>{product.salePriceInclVat > 0 ? formatEuro(product.salePriceInclVat) : dictionary.common.soon}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>Unit</span>
              <strong>{product.unit}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>Status</span>
              <strong className="capitalize">{product.stockStatus.replace("-", " ")}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>Origin</span>
              <strong>{product.origin}</strong>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-forest/65">
            Add this item below and send the request. Nancy&apos;s Castalla confirms availability, pickup or delivery, and
            payment instructions.
          </p>
        </div>
      </div>
      <div className="mt-10">
        <ProductOrder initialCategory={product.category} locale={locale} products={[product]} />
      </div>
    </section>
  );
}
