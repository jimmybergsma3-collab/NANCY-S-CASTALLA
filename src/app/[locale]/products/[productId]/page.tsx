/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductOrder } from "@/components/ProductOrder";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";
import { formatEuro } from "@/lib/pricing";
import { getProductById, getProducts } from "@/lib/product-store";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

function getDirections(product: Product) {
  if (product.type === "frozen") {
    return "Prepare from frozen or thawed according to the supplier label. Oven, air fryer or deep-fryer instructions can differ per product, so Nancy's Castalla confirms the packaging details with the order.";
  }

  if (product.type === "fresh") {
    return "Fresh items are supplied by pre-order. Keep chilled where required and follow the confirmed collection or delivery timing.";
  }

  return "Ambient products can be kept in a cool, dry place. Follow the supplier label after opening.";
}

function getConservation(product: Product) {
  if (product.type === "frozen") {
    return "Frozen product: store at -18C. Keep frozen until preparation.";
  }

  if (product.type === "fresh") {
    return "Fresh product: keep chilled and consume within the advised date on the packaging.";
  }

  return "Ambient product: store cool and dry, away from direct sunlight.";
}

function DetailPanel({ children, open, title }: { children: React.ReactNode; open?: boolean; title: string }) {
  return (
    <details className="border-t border-forest/15 py-4 text-sm text-forest" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
        {title}
        <span className="text-xl leading-none text-coffee">+</span>
      </summary>
      <div className="mt-3 leading-7 text-forest/70">{children}</div>
    </details>
  );
}

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

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Link className="text-sm font-bold text-coffee underline-offset-4 hover:underline" href={`/${locale}/products`}>
        Back to products
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div>
          {product.imageUrl ? (
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-forest/10 bg-white shadow-soft">
              <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
            </div>
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-lg border border-forest/10 bg-cream text-sm font-bold text-forest/55 shadow-soft">
              Photo coming soon
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-coffee">{product.category}</p>
          <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{product.name}</h1>
          <div className="mt-3 text-2xl font-bold text-forest">
            {product.salePriceInclVat > 0 ? formatEuro(product.salePriceInclVat) : dictionary.common.soon}
          </div>
          <p className="mt-5 leading-7 text-forest/72">{product.description}</p>
          <div className="mt-6 grid gap-3 rounded-lg border border-forest/10 bg-cream p-4 text-sm text-forest">
            <div className="flex justify-between gap-4">
              <span>Product code</span>
              <strong>{product.id}</strong>
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
          <div className="mt-6 border-b border-forest/15">
            <DetailPanel open title="Ingredients">
              Ingredients and allergen information are checked from the supplier packaging. For frozen snacks and imported
              products, Nancy&apos;s Castalla can confirm label details before collection or delivery.
            </DetailPanel>
            <DetailPanel title="Directions for use">{getDirections(product)}</DetailPanel>
            <DetailPanel title="Conservation">{getConservation(product)}</DetailPanel>
            <DetailPanel title="Additional information">
              Supplier code: <strong>{product.supplierCode || "TBC"}</strong>. Pack size:{" "}
              <strong>{product.packSize || product.unit}</strong>. Origin: <strong>{product.origin}</strong>.
            </DetailPanel>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <ProductOrder initialCategory={product.category} locale={locale} products={[product]} />
      </div>
      {relatedProducts.length > 0 ? (
        <div className="mt-14">
          <h2 className="font-serif text-3xl font-bold text-forest">You may also like</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link
                className="rounded-lg border border-forest/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brass/60"
                href={`/${locale}/products/${encodeURIComponent(item.id)}`}
                key={item.id}
              >
                {item.imageUrl ? (
                  <div className="aspect-[4/3] overflow-hidden rounded-md bg-cream">
                    <img alt={item.name} className="h-full w-full object-cover" src={item.imageUrl} />
                  </div>
                ) : (
                  <div className="grid aspect-[4/3] place-items-center rounded-md bg-cream text-xs font-bold text-forest/50">
                    Photo soon
                  </div>
                )}
                <h3 className="mt-4 min-h-12 text-sm font-bold text-forest">{item.name}</h3>
                <p className="mt-2 text-sm font-bold text-coffee">
                  {item.salePriceInclVat > 0 ? formatEuro(item.salePriceInclVat) : dictionary.common.soon}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
