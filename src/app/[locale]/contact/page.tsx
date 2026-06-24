import { MapPin, MessageCircle } from "lucide-react";
import { businessConfig } from "@/config/business";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";

export default async function ContactPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{dictionary.contact.eyebrow}</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">{dictionary.contact.title}</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft">
          <MessageCircle className="text-coffee" />
          <h2 className="mt-4 font-serif text-3xl font-bold text-forest">WhatsApp</h2>
          <p className="mt-3 text-forest/75">{businessConfig.displayWhatsappNumber}</p>
          <a
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 font-bold text-cream"
            href={`https://wa.me/${businessConfig.whatsappNumber.replace(/\D/g, "")}`}
          >
            {dictionary.contact.send}
          </a>
        </div>
        <div className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft">
          <MapPin className="text-coffee" />
          <h2 className="mt-4 font-serif text-3xl font-bold text-forest">{dictionary.contact.address}</h2>
          <p className="mt-3 text-forest/75">{businessConfig.address}</p>
          <p className="mt-5 text-sm leading-6 text-forest/65">{dictionary.contact.note}</p>
        </div>
      </div>
    </section>
  );
}
