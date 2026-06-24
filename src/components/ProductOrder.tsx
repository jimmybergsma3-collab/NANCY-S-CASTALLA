"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Minus, Plus, ShoppingBasket } from "lucide-react";
import type { Product, ProductCategory } from "@/types/product";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatEuro } from "@/lib/pricing";
import { businessConfig } from "@/config/business";
import { defaultLocale, getDictionary, type Locale } from "@/i18n/config";

type Props = {
  products: Product[];
  initialCategory?: ProductCategory | "All";
  locale?: Locale;
};

export function ProductOrder({ products, initialCategory = "All", locale = defaultLocale }: Props) {
  const dictionary = getDictionary(locale);
  const [category, setCategory] = useState<ProductCategory | "All">(initialCategory);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<"Collection" | "Local delivery">("Collection");

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category)))] as const, [products]);
  const visibleProducts = category === "All" ? products : products.filter((product) => product.category === category);
  const cartLines = products
    .map((product) => ({ product, quantity: quantities[product.id] ?? 0 }))
    .filter((line) => line.quantity > 0);
  const total = cartLines.reduce((sum, line) => sum + line.product.salePriceInclVat * line.quantity, 0);
  const whatsAppUrl = buildWhatsAppUrl(buildWhatsAppMessage(cartLines, fulfillment));

  function updateQuantity(id: string, nextQuantity: number) {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, nextQuantity) }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                category === item
                  ? "border-forest bg-forest text-cream"
                  : "border-forest/20 bg-white text-forest hover:border-forest"
              }`}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item === "All" ? dictionary.common.all : item}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {visibleProducts.map((product) => {
            const quantity = quantities[product.id] ?? 0;
            const disabled = product.stockStatus === "coming-soon";

            return (
              <article key={product.id} className="rounded-lg border border-forest/10 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-coffee">{product.category}</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-forest">{product.name}</h3>
                  </div>
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold capitalize text-forest">
                    {product.stockStatus.replace("-", " ")}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-forest/75">{product.description}</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xl font-bold text-forest">
                      {product.salePriceInclVat > 0 ? formatEuro(product.salePriceInclVat) : dictionary.common.soon}
                    </div>
                    <div className="text-xs text-forest/60">{product.unit}</div>
                  </div>
                  <div className="flex h-10 items-center overflow-hidden rounded-full border border-forest/15 bg-linen">
                    <button
                      aria-label={`Decrease ${product.name}`}
                      className="grid h-10 w-10 place-items-center text-forest disabled:opacity-40"
                      disabled={disabled || quantity === 0}
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="grid h-10 min-w-10 place-items-center text-sm font-bold text-forest">{quantity}</span>
                    <button
                      aria-label={`Increase ${product.name}`}
                      className="grid h-10 w-10 place-items-center bg-forest text-cream disabled:bg-forest/30"
                      disabled={disabled}
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <aside className="h-fit rounded-lg border border-forest/10 bg-cream p-5 shadow-soft lg:sticky lg:top-32">
        <div className="flex items-center gap-2 text-forest">
          <ShoppingBasket size={20} />
          <h2 className="font-serif text-2xl font-bold">{dictionary.order.title}</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-white p-1">
          {(["Collection", "Local delivery"] as const).map((option) => (
            <button
              key={option}
              className={`rounded-full px-3 py-2 text-sm font-bold ${
                fulfillment === option ? "bg-forest text-cream" : "text-forest"
              }`}
              type="button"
              onClick={() => setFulfillment(option)}
            >
              {option === "Collection" ? dictionary.common.collection : dictionary.common.localDelivery}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {cartLines.length === 0 ? (
            <p className="text-sm text-forest/70">{dictionary.order.empty}</p>
          ) : (
            cartLines.map((line) => (
              <div key={line.product.id} className="flex justify-between gap-3 text-sm text-forest">
                <span>
                  {line.quantity} x {line.product.name}
                </span>
                <strong>{formatEuro(line.quantity * line.product.salePriceInclVat)}</strong>
              </div>
            ))
          )}
        </div>
        <div className="mt-5 border-t border-forest/15 pt-4">
          <div className="flex justify-between text-lg font-bold text-forest">
            <span>{dictionary.order.estimatedTotal}</span>
            <span>{formatEuro(total)}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-forest/65">
            {dictionary.order.deliveryNote} {formatEuro(businessConfig.deliveryMinimum)}. Delivery fee from{" "}
            {formatEuro(businessConfig.deliveryFee)} within around {businessConfig.deliveryRadiusKm} km when possible.
          </p>
        </div>
        <a
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-cream shadow-soft transition hover:bg-leaf"
          href={whatsAppUrl}
          target="_blank"
        >
          <MessageCircle size={18} />
          {dictionary.common.orderViaWhatsApp}
        </a>
        <p className="mt-4 text-xs leading-5 text-forest/65">
          {dictionary.order.after}
        </p>
      </aside>
    </div>
  );
}
