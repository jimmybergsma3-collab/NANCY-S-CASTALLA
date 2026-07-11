import Link from "next/link";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";
import { categoryToSlug, productCategories, productMatchesCategory } from "@/lib/product-categories";
import { getProducts } from "@/lib/product-store";
import { getUiCopy } from "@/i18n/ui";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);
  const ui = getUiCopy(locale);
  const products = await getProducts();
  const categoryCounts = new Map(
    productCategories.map((category) => [
      category,
      products.filter((product) => productMatchesCategory(product, category)).length,
    ]),
  );
  const visibleCategories = productCategories.filter((category) => (categoryCounts.get(category) ?? 0) > 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{dictionary.products.eyebrow}</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{dictionary.products.title}</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">{dictionary.products.intro}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleCategories.map((category) => {
          const count = categoryCounts.get(category) ?? 0;

          return (
            <Link
              className="rounded-lg border border-forest/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brass/60"
              href={`/${locale}/products/category/${categoryToSlug(category)}`}
              key={category}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-coffee">{count} {ui.products.products}</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-forest">{ui.categories[category]}</h2>
              <p className="mt-3 text-sm leading-6 text-forest/65">{ui.products.categoryDescription}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
