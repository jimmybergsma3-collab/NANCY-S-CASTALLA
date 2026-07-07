"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getAuthCopy } from "@/i18n/auth";
import { persistLocalePreference } from "@/i18n/locale-client";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { formatCustomerPhone } from "@/lib/phone";
import { invoiceLabel } from "@/lib/invoice-format";

type AccountOrder = {
  id: string;
  order_number?: number;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal_ex_vat: number;
  vat_total: number;
  fulfillment: string;
  delivery_method: string;
  notes: string;
  order_items: Array<{ id: number; product_id?: string; product_name: string; package_label: string; unit: string; quantity: number; vat_rate: number; line_total_incl_vat: number }>;
  invoices?: Array<{ id: string; invoice_number: number; status: string; issued_at: string; created_at?: string }>;
};

type Profile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  language: Locale;
};

const dateLocales: Record<Locale, string> = {
  en: "en-GB",
  nl: "nl-NL",
  de: "de-DE",
  es: "es-ES",
  sv: "sv-SE",
};

const orderCopy: Record<Locale, { details: string; products: string; package: string; quantity: string; vat: string; subtotal: string; total: string; fulfilment: string; notes: string; invoice: string; download: string; downloading: string; downloadFailed: string }> = {
  en: { details: "Order details", products: "Products", package: "Package", quantity: "Quantity", vat: "VAT", subtotal: "Subtotal excl. VAT", total: "Total incl. VAT", fulfilment: "Collection / delivery", notes: "Notes", invoice: "Invoice", download: "Download PDF", downloading: "Downloading...", downloadFailed: "The invoice could not be downloaded." },
  nl: { details: "Besteldetails", products: "Producten", package: "Verpakking", quantity: "Aantal", vat: "Btw", subtotal: "Subtotaal excl. btw", total: "Totaal incl. btw", fulfilment: "Afhalen / bezorgen", notes: "Opmerkingen", invoice: "Factuur", download: "PDF downloaden", downloading: "Downloaden...", downloadFailed: "De factuur kon niet worden gedownload." },
  de: { details: "Bestelldetails", products: "Produkte", package: "Verpackung", quantity: "Menge", vat: "MwSt.", subtotal: "Zwischensumme ohne MwSt.", total: "Gesamt inkl. MwSt.", fulfilment: "Abholung / Lieferung", notes: "Anmerkungen", invoice: "Rechnung", download: "PDF herunterladen", downloading: "Wird geladen...", downloadFailed: "Die Rechnung konnte nicht heruntergeladen werden." },
  es: { details: "Detalles del pedido", products: "Productos", package: "Formato", quantity: "Cantidad", vat: "IVA", subtotal: "Subtotal sin IVA", total: "Total con IVA", fulfilment: "Recogida / entrega", notes: "Notas", invoice: "Factura", download: "Descargar PDF", downloading: "Descargando...", downloadFailed: "No se pudo descargar la factura." },
  sv: { details: "Orderdetaljer", products: "Produkter", package: "Förpackning", quantity: "Antal", vat: "Moms", subtotal: "Delsumma exkl. moms", total: "Totalt inkl. moms", fulfilment: "Avhämtning / leverans", notes: "Anteckningar", invoice: "Faktura", download: "Ladda ner PDF", downloading: "Laddar ner...", downloadFailed: "Fakturan kunde inte laddas ner." },
};

function emptyProfile(locale: Locale): Profile {
  return { name: "", email: "", phone: "", address: "", language: locale };
}

export function AccountDashboard({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = getAuthCopy(locale);
  const [profile, setProfile] = useState<Profile>(() => emptyProfile(locale));
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [message, setMessage] = useState<string>(copy.accountLoading);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [openOrderId, setOpenOrderId] = useState("");
  const [downloading, setDownloading] = useState("");
  const resetting = searchParams.get("reset") === "1";
  const ordersCopy = useMemo(() => orderCopy[locale], [locale]);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace(`/${locale}/login`);
        return;
      }
      const headers = { Authorization: `Bearer ${data.session.access_token}` };
      const [profileResponse, ordersResponse] = await Promise.all([
        fetch("/api/account/profile", { headers }),
        fetch("/api/account/orders", { headers }),
      ]);
      const [profileResult, ordersResult] = await Promise.all([profileResponse.json(), ordersResponse.json()]);
      if (!active) return;
      const resultProfile = profileResult.profile as Partial<Profile> | undefined;
      setProfile({
        name: resultProfile?.name ?? "",
        email: resultProfile?.email ?? data.session.user.email ?? "",
        phone: formatCustomerPhone(resultProfile?.phone ?? ""),
        address: resultProfile?.address ?? "",
        language: isLocale(resultProfile?.language) ? resultProfile.language : locale,
      });
      setOrders(ordersResult.orders ?? []);
      setMessage(profileResponse.ok && ordersResponse.ok ? "" : profileResult.message ?? ordersResult.message ?? copy.accountLoadError);
    })();
    return () => { active = false; };
  }, [copy.accountLoadError, locale, router]);

  async function authHeaders(): Promise<Record<string, string>> {
    const { data } = await getSupabaseBrowserClient().auth.getSession();
    return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(profile),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(result.message ?? copy.accountLoadError);
      return;
    }
    const savedProfile = result.profile as Profile;
    const savedLocale = isLocale(savedProfile.language) ? savedProfile.language : locale;
    setProfile({ ...savedProfile, language: savedLocale, phone: formatCustomerPhone(savedProfile.phone ?? "") });
    persistLocalePreference(savedLocale);
    setMessage(copy.accountSaved);
    if (savedLocale !== locale) router.replace(`/${savedLocale}/account`);
  }

  async function logout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace(`/${locale}/login`);
    router.refresh();
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
    setMessage(error ? copy.passwordFailed : copy.passwordUpdated);
    if (!error) setPassword("");
  }

  async function downloadInvoice(invoice: { id: string; invoice_number: number }) {
    setDownloading(invoice.id); setMessage("");
    const response = await fetch(`/api/account/invoices/${invoice.id}/pdf`, { headers: await authHeaders() });
    setDownloading("");
    if (!response.ok) { setMessage(ordersCopy.downloadFailed); return; }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a"); link.href = url; link.download = `${invoiceLabel(invoice)}.pdf`; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="h-fit rounded-lg border border-forest/10 bg-white p-5 shadow-soft">
        <form className="space-y-4" onSubmit={saveProfile}>
          <label className="block text-sm font-bold text-forest">
            {copy.name}
            <input className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} required value={profile.name} />
          </label>
          <label className="block text-sm font-bold text-forest">
            {copy.email}
            <input className="mt-1 w-full rounded-lg border bg-cream/40 px-3 py-2" disabled value={profile.email} />
          </label>
          <label className="block text-sm font-bold text-forest">
            {copy.phone}
            <input className="mt-1 w-full rounded-lg border px-3 py-2" inputMode="tel" onBlur={() => setProfile((current) => ({ ...current, phone: formatCustomerPhone(current.phone) }))} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} type="tel" value={profile.phone} />
          </label>
          <label className="block text-sm font-bold text-forest">
            {copy.address}
            <textarea className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))} value={profile.address} />
          </label>
          <label className="block text-sm font-bold text-forest">
            {copy.language}
            <select className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setProfile((current) => ({ ...current, language: event.target.value as Locale }))} value={profile.language}>
              {locales.map((item) => <option key={item} value={item}>{copy.languages[item]}</option>)}
            </select>
          </label>
          <button className="rounded-full bg-forest px-5 py-2 font-bold text-cream disabled:opacity-50" disabled={saving} type="submit">
            {saving ? copy.saving : copy.saveProfile}
          </button>
        </form>
        <button className="mt-5 rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest" onClick={logout} type="button">
          {copy.logout}
        </button>
        {resetting ? (
          <form className="mt-6 border-t border-forest/10 pt-5" onSubmit={updatePassword}>
            <label className="text-sm font-bold text-forest">
              {copy.password}
              <input className="mt-1 w-full rounded-lg border px-3 py-2" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>
            <button className="mt-3 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream" type="submit">{copy.reset}</button>
          </form>
        ) : null}
      </aside>
      <section>
        <h2 className="font-serif text-3xl font-bold text-forest">{copy.history}</h2>
        {message ? <p className="mt-4 rounded-md bg-cream p-3 text-sm text-forest/75">{message}</p> : null}
        <div className="mt-4 grid gap-3">
          {orders.map((order) => {
            const orderStatus = copy.orderStatuses[order.status as keyof typeof copy.orderStatuses] ?? order.status.replaceAll("_", " ");
            const paymentStatus = copy.paymentStatuses[order.payment_status as keyof typeof copy.paymentStatuses] ?? order.payment_status;
            return (
              <article className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-soft" key={order.id}>
                <button className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={() => setOpenOrderId((current) => current === order.id ? "" : order.id)} type="button">
                  <span><span className="block font-bold">{order.order_number ? `NC-${String(order.order_number).padStart(6, "0")}` : order.id}</span><span className="mt-2 block text-sm text-forest/65">{new Date(order.created_at).toLocaleDateString(dateLocales[locale])} · {orderStatus} · {paymentStatus}</span></span>
                  <span className="flex items-center gap-3"><strong>€{Number(order.total).toFixed(2)}</strong><ChevronDown className={`transition ${openOrderId === order.id ? "rotate-180" : ""}`} size={19}/></span>
                </button>
                {openOrderId === order.id ? <div className="border-t border-forest/10 bg-linen/50 p-4">
                  <h3 className="font-serif text-xl font-bold text-forest">{ordersCopy.details}</h3>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="font-bold text-forest/60">{ordersCopy.fulfilment}</dt><dd>{order.delivery_method || order.fulfillment || "-"}</dd></div><div><dt className="font-bold text-forest/60">{ordersCopy.notes}</dt><dd>{order.notes || "-"}</dd></div></dl>
                  <h4 className="mt-5 font-bold text-forest">{ordersCopy.products}</h4>
                  <div className="mt-2 grid gap-2">{(order.order_items ?? []).map((item) => <div className="rounded-md border border-forest/10 bg-white p-3 text-sm" key={item.id}><div className="flex justify-between gap-3"><strong>{item.product_name}</strong><strong>€{Number(item.line_total_incl_vat).toFixed(2)}</strong></div><p className="mt-1 text-xs text-forest/60">{item.product_id || "-"} · {ordersCopy.package}: {item.package_label || item.unit} · {ordersCopy.quantity}: {item.quantity} · {ordersCopy.vat}: {Number(item.vat_rate)}%</p></div>)}</div>
                  <div className="ml-auto mt-4 max-w-sm space-y-2 border-t border-forest/10 pt-3 text-sm"><div className="flex justify-between"><span>{ordersCopy.subtotal}</span><strong>€{Number(order.subtotal_ex_vat).toFixed(2)}</strong></div><div className="flex justify-between"><span>{ordersCopy.vat}</span><strong>€{Number(order.vat_total).toFixed(2)}</strong></div><div className="flex justify-between text-base"><span className="font-bold">{ordersCopy.total}</span><strong>€{Number(order.total).toFixed(2)}</strong></div></div>
                  {order.invoices?.map((invoice) => <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-cream p-3" key={invoice.id}><strong>{ordersCopy.invoice} {invoiceLabel(invoice)}</strong><button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-bold text-cream disabled:opacity-50" disabled={downloading === invoice.id} onClick={() => void downloadInvoice(invoice)} type="button"><Download size={16}/>{downloading === invoice.id ? ordersCopy.downloading : ordersCopy.download}</button></div>)}
                </div> : null}
              </article>
            );
          })}
          {!message && orders.length === 0 ? <p className="text-sm text-forest/65">{copy.noOrders}</p> : null}
        </div>
      </section>
    </div>
  );
}
