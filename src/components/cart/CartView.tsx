"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Minus, Plus, Send, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getCartCopy } from "@/i18n/cart";
import { getUiCopy } from "@/i18n/ui";
import { formatEuro } from "@/lib/pricing";
import { formatCustomerPhone } from "@/lib/phone";
import { paymentMethodLabel, paymentMethods, type PaymentMethod } from "@/lib/payment";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { ValidatedCartLine, CartValidationCode } from "@/services/orders/order-service";
import { useCart } from "./CartProvider";

type ValidationResult = { ok: boolean; lines: ValidatedCartLine[]; subtotalExVat: number; vatTotal: number; total: number };

export function CartView({ locale }: { locale: Locale }) {
  const copy = getCartCopy(locale);
  const ui = getUiCopy(locale);
  const { items, ready, updateQuantity, removeItem, clear } = useCart();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const [fulfillment, setFulfillment] = useState<"Collection" | "Local delivery">("Collection");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pending");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const idempotencyKey = useRef("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await getSupabaseBrowserClient().auth.getSession();
      if (!data.session || !active) return;
      const response = await fetch("/api/account/profile", { headers: { Authorization: `Bearer ${data.session.access_token}` } });
      if (!response.ok || !active) return;
      const result = await response.json() as { profile?: { name?: string; email?: string; phone?: string; address?: string } };
      if (!result.profile) return;
      setCustomerName(result.profile.name || "");
      setCustomerEmail(result.profile.email || data.session.user.email || "");
      setCustomerPhone(formatCustomerPhone(result.profile.phone || ""));
      setCustomerAddress(result.profile.address || "");
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) { queueMicrotask(() => setValidation({ ok: true, lines: [], subtotalExVat: 0, vatTotal: 0, total: 0 })); return; }
    const controller = new AbortController();
    queueMicrotask(() => { setChecking(true); setValidationFailed(false); });
    void fetch("/api/cart/validate", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
      body: JSON.stringify({ lines: items.map((item) => ({ ...item, unit: item.packageLabel, salePriceInclVat: 0 })) }),
    }).then(async (response) => {
      if (!response.ok) throw new Error("validation_failed");
      setValidation(await response.json() as ValidationResult);
    }).catch((error) => { if (error instanceof Error && error.name !== "AbortError") setValidationFailed(true); }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [items, ready]);

  function availabilityMessage(code: CartValidationCode) {
    if (code === "coming_soon") return copy.comingSoon;
    if (code === "insufficient_stock") return copy.insufficientStock;
    if (code === "package_unavailable") return copy.packageUnavailable;
    if (code === "product_unavailable") return copy.unavailable;
    return copy.validationError;
  }

  function orderErrorMessage(code?: string, backendMessage?: string) {
    if (code === "missing_fields") return copy.missingFields ?? "Please enter your name, email and at least one product.";
    if (code === "service_unavailable") return copy.serviceUnavailable ?? "Ordering is temporarily unavailable. Please contact us by WhatsApp.";
    if (code === "invalid_order") return copy.invalidOrder ?? "Please check your cart and details before sending again.";
    if (code && ["coming_soon", "insufficient_stock", "package_unavailable", "product_unavailable"].includes(code)) return availabilityMessage(code as CartValidationCode);
    if (backendMessage) return backendMessage;
    return copy.orderError;
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validation || validation.lines.some((line) => !line.available) || validation.lines.length === 0) return;
    if (fulfillment === "Local delivery" && !customerAddress.trim()) {
      setStatus("error");
      setMessage(copy.deliveryAddressRequired ?? "Please enter a delivery address for local delivery.");
      return;
    }
    setStatus("sending"); setMessage("");
    try {
      if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
      const { data } = await getSupabaseBrowserClient().auth.getSession();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}) },
        body: JSON.stringify({ customerName, customerEmail, customerPhone, fulfillment, paymentMethod, locale, notes: [customerAddress ? `${ui.order.address}: ${customerAddress}` : "", notes].filter(Boolean).join("\n\n"), idempotencyKey: idempotencyKey.current, lines: items.map((item) => ({ ...item, unit: item.packageLabel, salePriceInclVat: 0 })) }),
      });
      const result = await response.json() as { ok: boolean; errorCode?: CartValidationCode | "missing_fields" | "service_unavailable" | "invalid_order" | "order_failed"; message?: string; orderId?: string; emailed?: boolean; diagnosticId?: string };
      if (!response.ok || !result.ok) throw new Error(orderErrorMessage(result.errorCode, result.message));
      setStatus("sent");
      setMessage(`${copy.orderSent}${result.orderId ? ` ${result.orderId}.` : ""}${result.emailed ? "" : ` ${copy.emailUnavailable}`}`);
      clear();
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : copy.orderError); }
  }

  const invalidLines = validation?.lines.filter((line) => !line.available) ?? [];
  const canCheckout = Boolean(validation?.lines.length) && invalidLines.length === 0 && !checking && !validationFailed;

  if (!ready) return <p className="text-sm text-forest/65">{copy.validating}</p>;
  if (items.length === 0 && status !== "sent") return <div className="rounded-lg border border-forest/10 bg-white p-8 text-center shadow-soft"><p className="text-forest/70">{copy.empty}</p><Link className="mt-5 inline-flex rounded-full bg-forest px-5 py-3 font-bold text-cream" href={`/${locale}/products`}>{copy.continueShopping}</Link></div>;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
      <section className="min-w-0 space-y-4">
        {checking ? <p className="text-sm text-forest/65">{copy.validating}</p> : null}
        {validationFailed ? <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{copy.validationError}</p> : null}
        {(validation?.lines ?? []).map((line) => (
          <article className={`grid gap-4 rounded-lg border bg-white p-4 shadow-soft sm:grid-cols-[120px_minmax(0,1fr)] ${line.available ? "border-forest/10" : "border-red-300"}`} key={`${line.productId}:${line.packageLabel}`}>
            {line.imageUrl ? <img alt={line.name} className="aspect-[4/3] w-full rounded-md object-cover" src={line.imageUrl} /> : <div className="aspect-[4/3] rounded-md bg-cream" />}
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-serif text-xl font-bold text-forest">{line.name}</h2><p className="mt-1 text-xs text-forest/60">{line.packageLabel}</p></div><strong className="whitespace-nowrap text-forest">{formatEuro(line.lineTotalInclVat)}</strong></div>
              {line.stockStatus === "preorder" ? <p className="mt-2 text-xs text-forest/65">{copy.preorderNote}</p> : null}
              {!line.available ? <p className="mt-2 flex items-center gap-2 text-sm font-bold text-red-700"><AlertTriangle size={16} />{availabilityMessage(line.code)}</p> : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex h-10 items-center overflow-hidden rounded-full border border-forest/15 bg-linen"><button aria-label={`${copy.quantity} -`} className="grid h-10 w-10 place-items-center" type="button" onClick={() => line.quantity === 1 ? removeItem(line.productId, line.packageLabel) : updateQuantity(line.productId, line.packageLabel, line.quantity - 1)}><Minus size={16} /></button><span className="grid h-10 min-w-10 place-items-center text-sm font-bold">{line.quantity}</span><button aria-label={`${copy.quantity} +`} className="grid h-10 w-10 place-items-center bg-forest text-cream" type="button" onClick={() => updateQuantity(line.productId, line.packageLabel, line.quantity + 1)}><Plus size={16} /></button></div>
                <button className="inline-flex items-center gap-2 text-sm font-bold text-coffee" type="button" onClick={() => removeItem(line.productId, line.packageLabel)}><Trash2 size={16} />{copy.remove}</button>
              </div>
            </div>
          </article>
        ))}
        {invalidLines.length ? <button className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700" type="button" onClick={() => invalidLines.forEach((line) => removeItem(line.productId, line.packageLabel))}><Trash2 size={16} />{copy.removeUnavailable}</button> : null}
      </section>
      <aside className="h-fit rounded-lg border border-forest/10 bg-cream p-5 shadow-soft lg:sticky lg:top-32">
        <h2 className="font-serif text-2xl font-bold text-forest">{copy.checkout}</h2><p className="mt-2 text-sm leading-6 text-forest/70">{copy.checkoutIntro}</p>
        <div className="mt-4 space-y-2 border-y border-forest/15 py-4 text-sm text-forest"><div className="flex justify-between"><span>{copy.subtotal}</span><strong>{formatEuro(validation?.subtotalExVat ?? 0)}</strong></div><div className="flex justify-between"><span>{copy.vat}</span><strong>{formatEuro(validation?.vatTotal ?? 0)}</strong></div><div className="flex justify-between text-lg"><span className="font-bold">{copy.total}</span><strong>{formatEuro(validation?.total ?? 0)}</strong></div></div>
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-white p-1">{(["Collection", "Local delivery"] as const).map((option) => <button className={`rounded-full px-3 py-2 text-sm font-bold ${fulfillment === option ? "bg-forest text-cream" : "text-forest"}`} key={option} type="button" onClick={() => setFulfillment(option)}>{option === "Collection" ? copy.collection : copy.delivery}</button>)}</div>
        <form className="mt-5 space-y-3" onSubmit={submitOrder}><input className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm" onChange={(event) => setCustomerName(event.target.value)} placeholder={copy.name} required value={customerName} /><input className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm" onChange={(event) => setCustomerEmail(event.target.value)} placeholder={copy.email} required type="email" value={customerEmail} /><input autoComplete="tel" className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm" inputMode="tel" onBlur={() => setCustomerPhone(formatCustomerPhone(customerPhone))} onChange={(event) => setCustomerPhone(event.target.value)} placeholder={copy.phone} type="tel" value={customerPhone} /><textarea className="min-h-20 w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm" onChange={(event) => setCustomerAddress(event.target.value)} placeholder={copy.address} value={customerAddress} /><select aria-label={copy.paymentMethod} className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm" onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} value={paymentMethod}><option value="pending">{copy.paymentMethod}</option>{paymentMethods.filter((method) => method !== "pending").map((method) => <option key={method} value={method}>{paymentMethodLabel(method, locale)}</option>)}</select><textarea className="min-h-20 w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm" onChange={(event) => setNotes(event.target.value)} placeholder={copy.notes} value={notes} /><button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-cream disabled:opacity-40" disabled={!canCheckout || status === "sending"} type="submit"><Send size={17} />{status === "sending" ? copy.sending : copy.send}</button></form>
        {message ? <p className={`mt-4 flex items-start gap-2 text-sm ${status === "error" ? "text-red-700" : "text-forest"}`}>{status === "sent" ? <CheckCircle2 className="shrink-0" size={18} /> : null}{message}</p> : null}
      </aside>
    </div>
  );
}
