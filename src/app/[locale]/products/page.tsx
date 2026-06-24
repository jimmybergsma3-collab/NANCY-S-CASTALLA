import { ProductOrder } from "@/components/ProductOrder";
import { products } from "@/data/products";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";

export default async function ProductsPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{dictionary.products.eyebrow}</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{dictionary.products.title}</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">{dictionary.products.intro}</p>
      <div className="mt-8">
        <ProductOrder products={products} locale={locale} />
      </div>
    </section>
  );
}
