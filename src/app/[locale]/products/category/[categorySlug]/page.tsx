import { notFound } from "next/navigation";
import { ProductOrder } from "@/components/ProductOrder";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";
import { productMatchesCategory, slugToCategory } from "@/lib/product-categories";
import { getProducts } from "@/lib/product-store";
import { getUiCopy } from "@/i18n/ui";

export const dynamic = "force-dynamic";

export default async function ProductCategoryPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale, categorySlug: rawCategorySlug } = (await params) as {
    locale?: string;
    categorySlug?: string;
  };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);
  const ui = getUiCopy(locale);
  const category = rawCategorySlug ? slugToCategory(rawCategorySlug) : undefined;

  if (!category) {
    notFound();
  }

  const products = (await getProducts()).filter((product) => productMatchesCategory(product, category));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{dictionary.products.eyebrow}</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{ui.categories[category]}</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">{ui.products.browseCategory}</p>
      <div className="mt-8">
        <ProductOrder initialCategory={category} locale={locale} products={products} />
      </div>
    </section>
  );
}
