import { ProductOrder } from "@/components/ProductOrder";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";
import { getProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export default async function BreadPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);
  const breadProducts = (await getProducts()).filter((product) => product.category === "Bread & bakery");

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{dictionary.bread.eyebrow}</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{dictionary.bread.title}</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">{dictionary.bread.intro}</p>
      <div className="mt-8 rounded-lg border border-brass/25 bg-cream p-5 text-forest">
        <strong>{dictionary.bread.how}</strong> {dictionary.bread.howText}
      </div>
      <div className="mt-8">
        <ProductOrder products={breadProducts} initialCategory="Bread & bakery" locale={locale} />
      </div>
    </section>
  );
}
