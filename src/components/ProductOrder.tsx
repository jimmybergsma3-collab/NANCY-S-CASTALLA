"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MailCheck, MessageCircle, Minus, Plus, Search, Send, ShoppingBasket } from "lucide-react";
import type { Product, ProductCategory } from "@/types/product";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatEuro } from "@/lib/pricing";
import { businessConfig } from "@/config/business";
import { defaultLocale, getDictionary, type Locale } from "@/i18n/config";
import { getPublicProductDescription } from "@/lib/product-display";
import { getProductCategories, productMatchesCategory } from "@/lib/product-categories";
import { getCustomerDisplayUnit, getEffectivePackageOptions } from "@/lib/product-packaging";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = {
  products: Product[];
  initialCategory?: ProductCategory | "All";
  locale?: Locale;
  compactCardImages?: boolean;
};

export function ProductOrder({ products, initialCategory = "All", locale = defaultLocale, compactCardImages = false }: Props) {
  const dictionary = getDictionary(locale);
  const [category, setCategory] = useState<ProductCategory | "All">(initialCategory);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<"Collection" | "Local delivery">("Collection");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const idempotencyKey = useRef("");

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.flatMap(getProductCategories)))] as const, [products]);
  const visibleProducts = (category === "All" ? products : products.filter((product) => productMatchesCategory(product, category))).filter((product) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [product.id, product.name, product.description, getProductCategories(product).join(" "), product.origin, product.supplierCode]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const cartLines = products
    .map((product) => {
      const optionIndex = selectedOptions[product.id] ?? 0;
      const packageOption = getEffectivePackageOptions(product)[optionIndex];
      return {
        product,
        packageOption,
        quantity: quantities[product.id] ?? 0,
        unit: packageOption?.label ?? getCustomerDisplayUnit(product),
        salePriceInclVat: packageOption?.salePriceInclVat ?? product.salePriceInclVat,
      };
    })
    .filter((line) => line.quantity > 0);
  const total = cartLines.reduce((sum, line) => sum + line.salePriceInclVat * line.quantity, 0);
  const whatsAppUrl = buildWhatsAppUrl(buildWhatsAppMessage(cartLines, fulfillment));

  function updateQuantity(id: string, nextQuantity: number) {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, nextQuantity) }));
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
      const { data: authData } = await getSupabaseBrowserClient().auth.getSession();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authData.session ? { Authorization: `Bearer ${authData.session.access_token}` } : {}) },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          fulfillment,
          notes,
          idempotencyKey: idempotencyKey.current,
          lines: cartLines.map((line) => ({
            productId: line.product.id,
            name: line.product.name,
            quantity: line.quantity,
            unit: line.unit,
            packageLabel: line.packageOption?.label ?? "",
            packageQuantity: line.packageOption?.quantity ?? 1,
            salePriceInclVat: line.salePriceInclVat,
          })),
        }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string; orderId?: string; emailed?: boolean };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Order could not be sent.");
      }

      setStatus("sent");
      idempotencyKey.current = "";
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
        <label className="mb-4 flex items-center gap-3 rounded-full border border-forest/15 bg-white px-4 py-3 text-forest shadow-soft">
          <Search size={18} />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-forest/45"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name or product code"
            type="search"
            value={search}
          />
        </label>
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
          {visibleProducts.length === 0 ? (
            <div className="rounded-lg border border-forest/10 bg-white p-6 text-sm text-forest/70 shadow-soft md:col-span-2">
              No products found. Try another product name, category or product code.
            </div>
          ) : null}
          {visibleProducts.map((product) => {
            const quantity = quantities[product.id] ?? 0;
            const disabled = product.stockStatus === "coming-soon";
            const productHref = `/${locale}/products/${encodeURIComponent(product.id)}`;
            const packageOptions = getEffectivePackageOptions(product);
            const optionIndex = selectedOptions[product.id] ?? 0;
            const packageOption = packageOptions[optionIndex];
            const displayUnit = packageOption?.label ?? getCustomerDisplayUnit(product);
            const displayPrice = packageOption?.salePriceInclVat ?? product.salePriceInclVat;

            return (
              <article
                key={product.id}
                className="group rounded-lg border border-forest/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brass/50"
              >
                {product.imageUrl ? (
                  <Link className={`mb-4 block aspect-[4/3] overflow-hidden rounded-md bg-cream ${compactCardImages ? "mx-auto w-full max-w-[320px]" : ""}`} href={productHref}>
                    <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
                  </Link>
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-coffee">{getProductCategories(product).join(" · ")}</p>
                    <Link href={productHref}>
                      <h3 className="mt-2 font-serif text-2xl font-bold text-forest transition group-hover:text-coffee">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold capitalize text-forest">
                    {product.stockStatus.replace("-", " ")}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-forest/75">{getPublicProductDescription(product)}</p>
                <Link
                  className="mt-3 inline-flex text-sm font-bold text-coffee underline-offset-4 hover:underline"
                  href={productHref}
                >
                  View product details
                </Link>
                {packageOptions.length > 1 ? (
                  <label className="mt-4 block text-sm font-bold text-forest">
                    Package
                    <select
                      className="mt-1 w-full rounded-lg border border-forest/15 bg-linen px-3 py-2 text-sm font-normal text-forest"
                      onChange={(event) => setSelectedOptions((current) => ({ ...current, [product.id]: Number(event.target.value) }))}
                      value={optionIndex}
                    >
                      {packageOptions.map((option, index) => (
                        <option key={`${option.label}-${index}`} value={index}>
                          {option.label} - {formatEuro(option.salePriceInclVat)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xl font-bold text-forest">
                      {displayPrice > 0 ? formatEuro(displayPrice) : dictionary.common.soon}
                    </div>
                    <div className="text-xs text-forest/60">{displayUnit}</div>
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
                  {line.quantity} x {line.product.name} ({line.unit})
                </span>
                <strong>{formatEuro(line.quantity * line.salePriceInclVat)}</strong>
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
