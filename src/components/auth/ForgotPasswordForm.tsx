"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getAuthCopy } from "@/i18n/auth";

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const copy = getAuthCopy(locale);
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const redirectTo = `${window.location.origin}/${locale}/account?reset=1`; const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim(), { redirectTo }); setMessage(error ? copy.resetFailed : copy.resetEmailSent); setBusy(false); }
  return <form className="mt-8 max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={submit}><label className="block text-sm font-bold text-forest">{copy.email}<input autoComplete="email" className="mt-1 w-full rounded-lg border px-3 py-2" onChange={(event) => setEmail(event.target.value)} required type="email" value={email}/></label><button className="mt-5 w-full rounded-full bg-forest px-5 py-3 font-bold text-cream disabled:opacity-50" disabled={busy} type="submit">{copy.reset}</button>{message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}</form>;
}
