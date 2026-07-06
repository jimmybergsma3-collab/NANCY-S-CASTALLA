"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getAuthCopy } from "@/i18n/auth";

export function RegisterForm({ locale }: { locale: Locale }) {
  const copy = getAuthCopy(locale);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const emailRedirectTo = `${window.location.origin}/${locale}/login?confirmed=1`;
    const { error } = await getSupabaseBrowserClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim(), language: locale }, emailRedirectTo },
    });
    if (error) {
      setMessage(error.code === "over_email_send_rate_limit"
        ? copy.registrationRateLimit
        : copy.registrationFailed);
      setBusy(false);
      return;
    }
    setMessage(copy.registrationComplete);
    setBusy(false);
  }

  return (
    <form className="mt-8 max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={submit}>
      <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => setName(event.target.value)} placeholder={copy.name} required value={name} />
      <input className="mt-3 w-full rounded-lg border px-3 py-2" onChange={(event) => setEmail(event.target.value)} placeholder={copy.email} required type="email" value={email} />
      <input className="mt-3 w-full rounded-lg border px-3 py-2" onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder={copy.password} required type="password" value={password} />
      <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream disabled:opacity-50" disabled={busy} type="submit">{busy ? copy.creatingAccount : copy.createAccount}</button>
      {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
      <p className="mt-5 text-sm text-forest/65">{copy.alreadyRegistered} <Link className="font-bold text-coffee" href={`/${locale}/login`}>{copy.signIn}</Link></p>
    </form>
  );
}
