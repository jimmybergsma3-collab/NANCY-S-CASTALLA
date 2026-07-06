"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getCartCopy } from "@/i18n/cart";
import { useCart } from "./CartProvider";

export function CartButton({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const { itemCount } = useCart();
  const copy = getCartCopy(locale);
  return (
    <Link
      aria-label={`${copy.cart}: ${itemCount} ${copy.badgeLabel}`}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full border border-forest/15 bg-white text-forest ${compact ? "h-11 w-11" : "px-4 py-2 text-sm font-bold"}`}
      href={`/${locale}/cart`}
    >
      <ShoppingCart size={19} />
      {!compact ? <span>{copy.cart}</span> : null}
      {itemCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coffee px-1 text-[11px] font-bold text-white">{itemCount > 99 ? "99+" : itemCount}</span> : null}
    </Link>
  );
}
