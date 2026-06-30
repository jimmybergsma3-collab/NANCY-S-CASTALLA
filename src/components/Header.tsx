"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import { businessConfig } from "@/config/business";
import { defaultLocale, getDictionary, type Locale } from "@/i18n/config";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale = defaultLocale }: { locale?: Locale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dictionary = getDictionary(locale);
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/products`, label: dictionary.nav.products },
    { href: `/${locale}/bread`, label: dictionary.nav.bread },
    { href: `/${locale}/collection-delivery`, label: dictionary.nav.delivery },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
    { href: `/${locale}/register`, label: dictionary.nav.register },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-forest/10 bg-linen/95 backdrop-blur">
      <div className="bg-forest px-4 py-2 text-center text-sm font-semibold text-cream">
        {dictionary.common.phase}
      </div>
      <div className="mx-auto max-w-7xl px-4 py-3 md:flex md:items-center md:gap-6 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/${locale}`} aria-label="Nancy's Castalla home" onClick={() => setMenuOpen(false)}>
            <BrandMark />
          </Link>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full border border-forest/15 bg-white text-forest md:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <div className={`${menuOpen ? "flex" : "hidden"} mt-4 min-w-0 flex-col gap-4 border-t border-forest/10 pt-4 md:mt-0 md:flex md:flex-1 md:flex-row md:items-center md:justify-end md:border-0 md:pt-0`}>
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-semibold text-forest md:flex md:flex-wrap md:items-center md:justify-end md:gap-x-5 md:gap-y-2">
            {navItems.map((item) => (
              <Link key={item.href} className="hover:text-coffee" href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap md:shrink-0">
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
      </div>
    </header>
  );
}
