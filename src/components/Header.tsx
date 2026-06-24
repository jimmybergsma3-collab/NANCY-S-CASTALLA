import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { businessConfig } from "@/config/business";
import { defaultLocale, getDictionary, type Locale } from "@/i18n/config";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/products`, label: dictionary.nav.products },
    { href: `/${locale}/bread`, label: dictionary.nav.bread },
    { href: `/${locale}/collection-delivery`, label: dictionary.nav.delivery },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
    { href: `/${locale}/register`, label: dictionary.nav.register },
    { href: `/${locale}/admin/products`, label: dictionary.nav.admin },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-forest/10 bg-linen/95 backdrop-blur">
      <div className="bg-forest px-4 py-2 text-center text-sm font-semibold text-cream">
        {dictionary.common.phase}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href={`/${locale}`} aria-label="Nancy's Castalla home">
          <BrandMark />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-forest">
          {navItems.map((item) => (
            <Link key={item.href} className="hover:text-coffee" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <a
            className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream shadow-soft transition hover:bg-leaf"
            href={`https://wa.me/${businessConfig.whatsappNumber.replace(/\D/g, "")}`}
          >
            <MessageCircle size={17} />
            {businessConfig.whatsappCtaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
