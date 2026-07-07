import { businessConfig } from "@/config/business";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getLegalCopy } from "@/i18n/legal";

const ownerCopy: Record<Locale, string> = {
  en: `${businessConfig.businessName} is operated by ${businessConfig.termsOwnerName}, NIF/NIE ${businessConfig.fiscalId}, from ${businessConfig.fiscalAddress}.`,
  nl: `${businessConfig.businessName} wordt geëxploiteerd door ${businessConfig.termsOwnerName}, NIF/NIE ${businessConfig.fiscalId}, vanuit ${businessConfig.fiscalAddress}.`,
  de: `${businessConfig.businessName} wird von ${businessConfig.termsOwnerName}, NIF/NIE ${businessConfig.fiscalId}, unter der Anschrift ${businessConfig.fiscalAddress} betrieben.`,
  es: `${businessConfig.businessName} es operado por ${businessConfig.termsOwnerName}, NIF/NIE ${businessConfig.fiscalId}, con domicilio en ${businessConfig.fiscalAddress}.`,
  sv: `${businessConfig.businessName} drivs av ${businessConfig.termsOwnerName}, NIF/NIE ${businessConfig.fiscalId}, från ${businessConfig.fiscalAddress}.`,
};

export default async function TermsPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = await params as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const copy = getLegalCopy(locale);
  return <section className="mx-auto max-w-4xl px-4 py-12"><h1 className="font-serif text-5xl font-bold text-forest">{copy.termsTitle}</h1><div className="mt-6 space-y-5 leading-7 text-forest/75">{copy.terms.map((text) => <p key={text}>{text}</p>)}<p>{ownerCopy[locale]}</p><a className="font-bold text-coffee" href={`mailto:${businessConfig.emails.orders}`}>{businessConfig.emails.orders}</a></div></section>;
}
