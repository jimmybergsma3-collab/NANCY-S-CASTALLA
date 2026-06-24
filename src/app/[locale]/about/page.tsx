import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";

export default async function AboutPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{dictionary.about.eyebrow}</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{dictionary.about.title}</h1>
      <div className="mt-7 space-y-5 text-lg leading-8 text-forest/74">
        <p>{dictionary.about.p1}</p>
        <p>{dictionary.about.p2}</p>
        <p>{dictionary.about.p3}</p>
      </div>
    </section>
  );
}
