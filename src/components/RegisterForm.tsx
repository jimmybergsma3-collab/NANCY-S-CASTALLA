"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function RegisterForm({ locale }: { locale: Locale }) {
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
      options: { data: { name: name.trim() }, emailRedirectTo },
    });
    if (error) {
      setMessage(error.code === "over_email_send_rate_limit"
        ? "Please wait at least one minute before requesting another confirmation email."
        : error.message);
      setBusy(false);
      return;
    }
    setMessage("Account created. Check your email and confirm your address to activate your account.");
    setBusy(false);
  }

  return (
    <form className="mt-8 max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={submit}>
      <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => setName(event.target.value)} placeholder="Name" required value={name} />
      <input className="mt-3 w-full rounded-lg border px-3 py-2" onChange={(event) => setEmail(event.target.value)} placeholder="Email" required type="email" value={email} />
      <input className="mt-3 w-full rounded-lg border px-3 py-2" onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder="Password" required type="password" value={password} />
      <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream disabled:opacity-50" disabled={busy} type="submit">{busy ? "Creating account..." : "Create account"}</button>
      {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
      <p className="mt-5 text-sm text-forest/65">Already registered? <Link className="font-bold text-coffee" href={`/${locale}/login`}>Sign in</Link></p>
    </form>
  );
}
