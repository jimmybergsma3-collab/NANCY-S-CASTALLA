"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getAuthCopy } from "@/i18n/auth";
import { getProfileLocale, persistLocalePreference } from "@/i18n/locale-client";

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const copy = getAuthCopy(locale);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { router.replace(`/${locale}/account`); router.refresh(); }
    });
  }, [locale, router]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const preferredLocale = data.session ? await getProfileLocale(data.session.access_token) ?? locale : locale;
      persistLocalePreference(preferredLocale);
      router.replace(`/${preferredLocale}/account`); router.refresh();
    } catch { setMessage(copy.loginFailed); setBusy(false); }
  }
  return <form className="mt-8 max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={submit}><label className="block text-sm font-bold text-forest">{copy.email}<input autoComplete="email" className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setEmail(event.target.value)} required type="email" value={email}/></label><label className="mt-4 block text-sm font-bold text-forest">{copy.password}<input autoComplete="current-password" className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setPassword(event.target.value)} required type="password" value={password}/></label><button className="mt-5 w-full rounded-full bg-forest px-5 py-3 font-bold text-cream disabled:opacity-50" disabled={busy} type="submit">{busy ? "..." : copy.signIn}</button>{message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}<div className="mt-5 flex justify-between gap-3 text-sm"><Link className="font-bold text-coffee" href={`/${locale}/register`}>{copy.register}</Link><Link className="font-bold text-coffee" href={`/${locale}/forgot-password`}>{copy.forgot}</Link></div></form>;
}
