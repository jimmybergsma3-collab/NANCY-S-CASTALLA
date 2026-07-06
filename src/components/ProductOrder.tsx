"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Search, ShoppingCart } from "lucide-react";
import type { Product, ProductCategory } from "@/types/product";
import { formatEuro } from "@/lib/pricing";
import { defaultLocale, getDictionary, type Locale } from "@/i18n/config";
import { getPublicProductDescription } from "@/lib/product-display";
import { getProductCategories, productMatchesCategory } from "@/lib/product-categories";
import { getCustomerDisplayUnit, getEffectivePackageOptions } from "@/lib/product-packaging";
import { evaluateProductAvailability } from "@/lib/product-availability";
import { getUiCopy } from "@/i18n/ui";
import { getCartCopy } from "@/i18n/cart";
import { useCart } from "@/components/cart/CartProvider";

type Props = { products: Product[]; initialCategory?: ProductCategory | "All"; locale?: Locale; compactCardImages?: boolean };

export function ProductOrder({ products, initialCategory = "All", locale = defaultLocale, compactCardImages = false }: Props) {
  const dictionary = getDictionary(locale);
  const ui = getUiCopy(locale);
  const cartCopy = getCartCopy(locale);
  const { addItem } = useCart();
  const [category, setCategory] = useState<ProductCategory | "All">(initialCategory);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [addedKey, setAddedKey] = useState("");

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.flatMap(getProductCategories)))] as const, [products]);
  const visibleProducts = (category === "All" ? products : products.filter((product) => productMatchesCategory(product, category))).filter((product) => {
    const query = search.trim().toLowerCase();
    return !query || [product.id, product.name, product.description, getProductCategories(product).join(" "), product.origin, product.supplierCode].join(" ").toLowerCase().includes(query);
  });

  return (
    <div className="min-w-0">
      <label className="mb-4 flex items-center gap-3 rounded-full border border-forest/15 bg-white px-4 py-3 text-forest shadow-soft">
        <Search size={18} />
        <input className="w-full bg-transparent text-sm outline-none placeholder:text-forest/45" onChange={(event) => setSearch(event.target.value)} placeholder={ui.products.searchPlaceholder} type="search" value={search} />
      </label>
      <div className="mb-5 flex min-w-0 gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible">
        {categories.map((item) => (
          <button key={item} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${category === item ? "border-forest bg-forest text-cream" : "border-forest/20 bg-white text-forest hover:border-forest"}`} type="button" onClick={() => setCategory(item)}>
            {item === "All" ? dictionary.common.all : ui.categories[item]}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {visibleProducts.length === 0 ? <div className="rounded-lg border border-forest/10 bg-white p-6 text-sm text-forest/70 shadow-soft md:col-span-2">{ui.products.noProducts}</div> : null}
        {visibleProducts.map((product) => {
          const productHref = `/${locale}/products/${encodeURIComponent(product.id)}`;
          const packageOptions = getEffectivePackageOptions(product);
          const optionIndex = selectedOptions[product.id] ?? 0;
          const packageOption = packageOptions[optionIndex];
          const displayUnit = packageOption?.label ?? getCustomerDisplayUnit(product);
          const displayPrice = packageOption?.salePriceInclVat ?? product.salePriceInclVat;
          const packageQuantity = packageOption?.quantity ?? 1;
          const availability = evaluateProductAvailability({ stockStatus: product.stockStatus, trackInventory: Boolean(product.trackInventory), stockQuantity: Number(product.stockQuantity ?? 0), requestedUnits: packageQuantity });
          const canOrder = availability === "available";
          const key = `${product.id}:${displayUnit}`;
          const feedback = product.stockStatus === "preorder" ? cartCopy.preorderNote : availability === "coming_soon" ? cartCopy.comingSoon : availability === "insufficient_stock" ? cartCopy.insufficientStock : "";

          return (
            <article key={product.id} className="group rounded-lg border border-forest/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brass/50">
              {product.imageUrl ? <Link className={`mb-4 block aspect-[4/3] overflow-hidden rounded-md bg-cream ${compactCardImages ? "mx-auto w-full max-w-[320px]" : ""}`} href={productHref}><img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} /></Link> : null}
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-coffee">{getProductCategories(product).map((item) => ui.categories[item]).join(" · ")}</p><Link href={productHref}><h3 className="mt-2 font-serif text-2xl font-bold text-forest transition group-hover:text-coffee">{product.name}</h3></Link></div>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-forest">{ui.statuses[product.stockStatus]}</span>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-forest/75">{getPublicProductDescription(product)}</p>
              <Link className="mt-3 inline-flex text-sm font-bold text-coffee underline-offset-4 hover:underline" href={productHref}>{ui.products.viewDetails}</Link>
              {packageOptions.length > 1 ? <label className="mt-4 block text-sm font-bold text-forest">{ui.products.package}<select className="mt-1 w-full rounded-lg border border-forest/15 bg-linen px-3 py-2 text-sm font-normal text-forest" onChange={(event) => setSelectedOptions((current) => ({ ...current, [product.id]: Number(event.target.value) }))} value={optionIndex}>{packageOptions.map((option, index) => <option key={`${option.label}-${index}`} value={index}>{option.label} - {formatEuro(option.salePriceInclVat)}</option>)}</select></label> : null}
              {feedback ? <p className={`mt-3 text-xs leading-5 ${canOrder ? "text-forest/65" : "font-bold text-red-700"}`}>{feedback}</p> : null}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div><div className="text-xl font-bold text-forest">{displayPrice > 0 ? formatEuro(displayPrice) : dictionary.common.soon}</div><div className="text-xs text-forest/60">{displayUnit}</div></div>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream disabled:cursor-not-allowed disabled:bg-forest/30" disabled={!canOrder} type="button" onClick={() => { addItem({ productId: product.id, name: product.name, packageLabel: displayUnit, packageQuantity }); setAddedKey(key); window.setTimeout(() => setAddedKey((current) => current === key ? "" : current), 1800); }}>{addedKey === key ? <Check size={17} /> : <ShoppingCart size={17} />}{addedKey === key ? cartCopy.added : cartCopy.add}</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
