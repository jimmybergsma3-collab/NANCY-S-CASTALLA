"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAuthCopy } from "@/i18n/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type AccountOrder = { id: string; order_number?: number; created_at: string; status: string; payment_status: string; total: number };
type Profile = { name: string; email: string; phone: string; address: string; language: string };
const emptyProfile: Profile = { name: "", email: "", phone: "", address: "", language: "en" };

export function AccountDashboard({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = getAuthCopy(locale);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [message, setMessage] = useState("Loading account...");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const resetting = searchParams.get("reset") === "1";

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.replace(`/${locale}/login`); return; }
      const headers = { Authorization: `Bearer ${data.session.access_token}` };
      const [profileResponse, ordersResponse] = await Promise.all([fetch("/api/account/profile", { headers }), fetch("/api/account/orders", { headers })]);
      const [profileResult, ordersResult] = await Promise.all([profileResponse.json(), ordersResponse.json()]);
      if (!active) return;
      setProfile(profileResult.profile ?? { ...emptyProfile, email: data.session.user.email ?? "", language: locale });
      setOrders(ordersResult.orders ?? []);
      setMessage(profileResponse.ok && ordersResponse.ok ? "" : profileResult.message ?? ordersResult.message ?? "Account could not be loaded.");
    })();
    return () => { active = false; };
  }, [locale, router]);

  async function authHeaders(): Promise<Record<string, string>> { const { data } = await getSupabaseBrowserClient().auth.getSession(); return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}; }
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify(profile) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(result.message ?? "Profile could not be saved."); return; }
    setProfile(result.profile); setMessage("Profile saved.");
  }
  async function logout() { await getSupabaseBrowserClient().auth.signOut(); router.replace(`/${locale}/login`); router.refresh(); }
  async function updatePassword(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const { error } = await getSupabaseBrowserClient().auth.updateUser({ password }); setMessage(error ? error.message : "Password updated."); if (!error) setPassword(""); }

  return <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
    <aside className="h-fit rounded-lg border border-forest/10 bg-white p-5 shadow-soft">
      <form className="space-y-4" onSubmit={saveProfile}>
        <label className="block text-sm font-bold text-forest">Name<input className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} required value={profile.name}/></label>
        <label className="block text-sm font-bold text-forest">Email<input className="mt-1 w-full rounded-lg border bg-cream/40 px-3 py-2" disabled value={profile.email}/></label>
        <label className="block text-sm font-bold text-forest">Phone / WhatsApp<input className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} value={profile.phone}/></label>
        <label className="block text-sm font-bold text-forest">Address<textarea className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2" onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))} value={profile.address}/></label>
        <label className="block text-sm font-bold text-forest">Language<select className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setProfile((current) => ({ ...current, language: event.target.value }))} value={profile.language}><option value="en">English</option><option value="nl">Nederlands</option><option value="de">Deutsch</option><option value="es">Español</option><option value="sv">Scandinavian</option></select></label>
        <button className="rounded-full bg-forest px-5 py-2 font-bold text-cream disabled:opacity-50" disabled={saving} type="submit">{saving ? "Saving..." : "Save profile"}</button>
      </form>
      <button className="mt-5 rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest" onClick={logout} type="button">{copy.logout}</button>
      {resetting ? <form className="mt-6 border-t border-forest/10 pt-5" onSubmit={updatePassword}><label className="text-sm font-bold text-forest">{copy.password}<input className="mt-1 w-full rounded-lg border px-3 py-2" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password}/></label><button className="mt-3 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream" type="submit">{copy.reset}</button></form> : null}
    </aside>
    <section><h2 className="font-serif text-3xl font-bold text-forest">{copy.history}</h2>{message ? <p className="mt-4 rounded-md bg-cream p-3 text-sm text-forest/75">{message}</p> : null}<div className="mt-4 grid gap-3">{orders.map((order) => <article className="rounded-lg border border-forest/10 bg-white p-4 shadow-soft" key={order.id}><div className="flex flex-wrap items-center justify-between gap-3"><strong>{order.order_number ? `NC-${String(order.order_number).padStart(6, "0")}` : order.id}</strong><strong>€{Number(order.total).toFixed(2)}</strong></div><p className="mt-2 text-sm text-forest/65">{new Date(order.created_at).toLocaleDateString()} · {order.status.replaceAll("_", " ")} · {order.payment_status}</p></article>)}{!message && orders.length === 0 ? <p className="text-sm text-forest/65">-</p> : null}</div></section>
  </div>;
}
