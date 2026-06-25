"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { MailCheck, MessageCircle, Minus, Plus, Send, ShoppingBasket } from "lucide-react";
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
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

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

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          fulfillment,
          notes,
          total,
          lines: cartLines.map((line) => ({
            productId: line.product.id,
            name: line.product.name,
            quantity: line.quantity,
            unit: line.product.unit,
            salePriceInclVat: line.product.salePriceInclVat,
          })),
        }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string; orderId?: string; emailed?: boolean };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Order could not be sent.");
      }

      setStatus("sent");
      setMessage(
        result.emailed
          ? `Order ${result.orderId} sent. Please check your email.`
          : `Order ${result.orderId} received. Email provider is not configured yet.`,
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Order could not be sent.");
    }
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
                {product.imageUrl ? (
                  <div className="mb-4 aspect-[4/3] overflow-hidden rounded-md bg-cream">
                    <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
                  </div>
                ) : null}
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
        <form className="mt-5 space-y-3" onSubmit={submitOrder}>
          <input
            className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest"
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Name"
            required
            value={customerName}
          />
          <input
            className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest"
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Email for confirmation"
            required
            type="email"
            value={customerEmail}
          />
          <input
            className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest"
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Phone / WhatsApp"
            value={customerPhone}
          />
          <textarea
            className="min-h-20 w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm text-forest outline-none focus:border-forest"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Notes, preferred time or delivery address"
            value={notes}
          />
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-cream shadow-soft transition hover:bg-leaf disabled:opacity-50"
            disabled={status === "sending" || cartLines.length === 0}
            type="submit"
          >
            {status === "sent" ? <MailCheck size={18} /> : <Send size={18} />}
            {status === "sending" ? "Sending..." : "Send order request"}
          </button>
        </form>
        {message ? (
          <p className={`mt-3 text-xs leading-5 ${status === "error" ? "text-red-700" : "text-forest/75"}`}>{message}</p>
        ) : null}
        <a
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest/20 bg-white px-5 py-3 text-sm font-bold text-forest transition hover:border-forest"
          href={whatsAppUrl}
          target="_blank"
        >
          <MessageCircle size={18} />
          {businessConfig.whatsappCtaLabel}
        </a>
        <p className="mt-4 text-xs leading-5 text-forest/65">
          {dictionary.order.after}
        </p>
      </aside>
    </div>
  );
}
