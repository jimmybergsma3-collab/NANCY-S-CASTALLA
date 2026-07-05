import { RegisterForm } from "@/components/RegisterForm";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getAuthCopy } from "@/i18n/auth";

export default async function RegisterPage({ params }: { params: Promise<unknown> }) {
  const { locale: raw } = await params as { locale?: string };
  const locale = isLocale(raw) ? raw : defaultLocale;
  const copy = getAuthCopy(locale);
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{copy.account}</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{copy.register}</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">{copy.registerIntro}</p>
      <RegisterForm locale={locale} />
    </section>
  );
}
