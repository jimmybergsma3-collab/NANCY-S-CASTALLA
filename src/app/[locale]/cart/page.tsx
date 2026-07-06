import { CartView } from "@/components/cart/CartView";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getCartCopy } from "@/i18n/cart";

export default async function CartPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = await params as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const copy = getCartCopy(locale);
  return <section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Nancy&apos;s Castalla</p><h1 className="mt-2 font-serif text-5xl font-bold text-forest">{copy.title}</h1><div className="mt-8"><CartView locale={locale} /></div></section>;
}
