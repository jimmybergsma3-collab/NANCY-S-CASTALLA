"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getAuthCopy } from "@/i18n/auth";
import { persistLocalePreference } from "@/i18n/locale-client";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { formatCustomerPhone } from "@/lib/phone";

type AccountOrder = {
  id: string;
  order_number?: number;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
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
  const resetting = searchParams.get("reset") === "1";

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
    setMessage(error ? error.message : copy.passwordUpdated);
    if (!error) setPassword("");
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
              <article className="rounded-lg border border-forest/10 bg-white p-4 shadow-soft" key={order.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>{order.order_number ? `NC-${String(order.order_number).padStart(6, "0")}` : order.id}</strong>
                  <strong>€{Number(order.total).toFixed(2)}</strong>
                </div>
                <p className="mt-2 text-sm text-forest/65">{new Date(order.created_at).toLocaleDateString(dateLocales[locale])} · {orderStatus} · {paymentStatus}</p>
              </article>
            );
          })}
          {!message && orders.length === 0 ? <p className="text-sm text-forest/65">{copy.noOrders}</p> : null}
        </div>
      </section>
    </div>
  );
}
