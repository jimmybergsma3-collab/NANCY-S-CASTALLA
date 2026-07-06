import { Truck } from "lucide-react";
import { businessConfig } from "@/config/business";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n/config";
import { formatEuro } from "@/lib/pricing";
import { getUiCopy } from "@/i18n/ui";

export default async function CollectionDeliveryPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dictionary = getDictionary(locale);
  const ui = getUiCopy(locale);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center gap-3 text-coffee">
        <Truck />
        <p className="text-sm font-bold uppercase tracking-[0.18em]">{dictionary.delivery.eyebrow}</p>
      </div>
      <h1 className="mt-3 font-serif text-5xl font-bold text-forest">{dictionary.delivery.title}</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-3xl font-bold text-forest">{dictionary.delivery.collectionTitle}</h2>
          <p className="mt-3 leading-7 text-forest/72">
            {dictionary.delivery.collectionText} {businessConfig.address}.
          </p>
        </div>
        <div className="rounded-lg border border-forest/10 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-3xl font-bold text-forest">{dictionary.delivery.localTitle}</h2>
          <p className="mt-3 leading-7 text-forest/72">
            {dictionary.delivery.localText} {ui.order.deliveryMinimum} {formatEuro(businessConfig.deliveryMinimum)}. {ui.order.deliveryFeeFrom}{" "}
            {formatEuro(businessConfig.deliveryFee)} {ui.order.withinRadius.replace("{km}", String(businessConfig.deliveryRadiusKm))}
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-lg bg-forest p-6 text-cream">
        <h2 className="font-serif text-3xl font-bold">{dictionary.delivery.paymentTitle}</h2>
        <p className="mt-3 leading-7 text-cream/82">{dictionary.delivery.paymentText}</p>
      </div>
    </section>
  );
}
