"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import { locales, type Locale } from "@/i18n/config";
import { persistLocalePreference, updateProfileLocale } from "@/i18n/locale-client";
import { replacePathLocale } from "@/i18n/locale-preference";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getUiCopy } from "@/i18n/ui";
import { getAuthCopy } from "@/i18n/auth";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const ui = getUiCopy(currentLocale);
  const authCopy = getAuthCopy(currentLocale);

  async function selectLocale(locale: Locale) {
    persistLocalePreference(locale);
    try {
      const { data } = await getSupabaseBrowserClient().auth.getSession();
      if (data.session) await updateProfileLocale(data.session.access_token, locale);
    } catch {
      // Guest language switching must keep working when account services are unavailable.
    }
    router.push(`${replacePathLocale(pathname, locale)}${window.location.search}`);
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-forest/15 bg-white px-3 py-2 text-xs font-bold text-forest">
      <Globe2 size={15} />
      <div className="flex items-center gap-2">
        {locales.map((locale) => (
          <button
            aria-label={`${ui.header.switchLanguage} ${authCopy.languages[locale]}`}
            className={locale === currentLocale ? "text-coffee" : "hover:text-coffee"}
            key={locale}
            onClick={() => void selectLocale(locale)}
            type="button"
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
