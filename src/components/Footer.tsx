import { businessConfig } from "@/config/business";
import { defaultLocale, getDictionary, type Locale } from "@/i18n/config";
import { paymentProviders } from "@/payments/providers";

export function Footer({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <footer className="border-t border-forest/10 bg-forest text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <h2 className="font-serif text-2xl font-bold">{businessConfig.businessName}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-cream/80">
            {dictionary.home.intro}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brass">Visit</h3>
          <p className="mt-3 text-sm text-cream/85">{businessConfig.address}</p>
          <p className="mt-2 text-sm text-cream/85">WhatsApp: {businessConfig.displayWhatsappNumber}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brass">Payment V1</h3>
          <ul className="mt-3 space-y-1 text-sm text-cream/85">
            {paymentProviders
              .filter((provider) => provider.active)
              .map((provider) => (
                <li key={provider.id}>{provider.label}</li>
              ))}
            <li>Card payment later</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
