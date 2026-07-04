"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getAuthCopy } from "@/i18n/auth";

type AccountOrder = { id: string; order_number?: number; created_at: string; status: string; payment_status: string; total: number };

export function AccountDashboard({ locale }: { locale: Locale }) {
  const router = useRouter(); const searchParams = useSearchParams();
  const copy = getAuthCopy(locale);
  const [email, setEmail] = useState(""); const [orders, setOrders] = useState<AccountOrder[]>([]); const [message, setMessage] = useState("Loading account..."); const [password, setPassword] = useState("");
  const resetting = searchParams.get("reset") === "1";
  useEffect(() => { let active = true; (async () => { const supabase = getSupabaseBrowserClient(); const { data } = await supabase.auth.getSession(); if (!data.session) { router.replace(`/${locale}/login`); return; } if (!active) return; setEmail(data.session.user.email ?? ""); const response = await fetch("/api/account/orders", { headers: { Authorization: `Bearer ${data.session.access_token}` } }); const result = await response.json(); setOrders(result.orders ?? []); setMessage(response.ok ? "" : result.message ?? "Orders could not be loaded."); })(); return () => { active = false; }; }, [locale, router]);
  async function logout() { await getSupabaseBrowserClient().auth.signOut(); router.replace(`/${locale}/login`); router.refresh(); }
  async function updatePassword(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const { error } = await getSupabaseBrowserClient().auth.updateUser({ password }); setMessage(error ? error.message : "Password updated."); if (!error) setPassword(""); }
  return <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]"><aside className="h-fit rounded-lg border border-forest/10 bg-white p-5 shadow-soft"><p className="text-sm text-forest/60">{copy.account}</p><p className="mt-1 break-all font-bold text-forest">{email}</p><button className="mt-5 rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest" onClick={logout} type="button">{copy.logout}</button>{resetting ? <form className="mt-6 border-t border-forest/10 pt-5" onSubmit={updatePassword}><label className="text-sm font-bold text-forest">{copy.password}<input className="mt-1 w-full rounded-lg border px-3 py-2" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password}/></label><button className="mt-3 rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream" type="submit">{copy.reset}</button></form> : null}</aside><section><h2 className="font-serif text-3xl font-bold text-forest">{copy.history}</h2>{message ? <p className="mt-4 text-sm text-forest/65">{message}</p> : null}<div className="mt-4 grid gap-3">{orders.map((order) => <article className="rounded-lg border border-forest/10 bg-white p-4 shadow-soft" key={order.id}><div className="flex flex-wrap items-center justify-between gap-3"><strong>{order.order_number ? `NC-${String(order.order_number).padStart(6, "0")}` : order.id}</strong><strong>€{Number(order.total).toFixed(2)}</strong></div><p className="mt-2 text-sm text-forest/65">{new Date(order.created_at).toLocaleDateString()} · {order.status.replaceAll("_", " ")} · {order.payment_status}</p></article>)}{!message && orders.length === 0 ? <p className="text-sm text-forest/65">-</p> : null}</div></section></div>;
}
