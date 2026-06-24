import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  return (
    <>
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </>
  );
}
