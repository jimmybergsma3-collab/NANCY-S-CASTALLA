import { businessConfig } from "@/config/business";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getLegalCopy } from "@/i18n/legal";

export default async function PrivacyPage({ params }: { params: Promise<unknown> }) { const { locale: rawLocale } = await params as { locale?: string }; const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale; const copy = getLegalCopy(locale); return <section className="mx-auto max-w-4xl px-4 py-12"><h1 className="font-serif text-5xl font-bold text-forest">{copy.privacyTitle}</h1><div className="mt-6 space-y-5 leading-7 text-forest/75">{copy.privacy.map((text) => <p key={text}>{text}</p>)}<a className="font-bold text-coffee" href={`mailto:${businessConfig.emails.account}`}>{businessConfig.emails.account}</a></div></section>; }
