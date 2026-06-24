"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2 } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const pathWithoutLocale = parts.slice(2).join("/");

  return (
    <div className="flex items-center gap-2 rounded-full border border-forest/15 bg-white px-3 py-2 text-xs font-bold text-forest">
      <Globe2 size={15} />
      <div className="flex items-center gap-2">
        {locales.map((locale) => (
          <Link
            aria-label={`Switch language to ${localeLabels[locale]}`}
            className={locale === currentLocale ? "text-coffee" : "hover:text-coffee"}
            href={`/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}`}
            key={locale}
          >
            {locale.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
