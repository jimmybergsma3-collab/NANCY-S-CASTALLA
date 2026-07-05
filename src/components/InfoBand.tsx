import { CheckCircle2 } from "lucide-react";
import { defaultLocale, getDictionary, type Locale } from "@/i18n/config";
import { getUiCopy } from "@/i18n/ui";

export function InfoBand({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const ui = getUiCopy(locale);

  return (
    <section className="border-y border-brass/20 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:grid-cols-5">
        {ui.infoPoints.map((point) => (
          <div key={point} className="flex items-center gap-2 text-sm font-semibold text-forest">
            <CheckCircle2 className="shrink-0 text-coffee" size={18} />
            <span>{point}</span>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-7xl px-4 pb-5 text-sm text-forest/75">{dictionary.home.intro}</p>
    </section>
  );
}
