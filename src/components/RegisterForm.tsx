"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getAuthCopy } from "@/i18n/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Eye, EyeOff } from "lucide-react";

const passwordCopy: Record<Locale, { confirm: string; mismatch: string; show: string; hide: string }> = {
  en: { confirm: "Confirm password", mismatch: "The passwords do not match.", show: "Show password", hide: "Hide password" },
  nl: { confirm: "Bevestig wachtwoord", mismatch: "De wachtwoorden zijn niet gelijk.", show: "Toon wachtwoord", hide: "Verberg wachtwoord" },
  de: { confirm: "Passwort bestätigen", mismatch: "Die Passwörter stimmen nicht überein.", show: "Passwort anzeigen", hide: "Passwort ausblenden" },
  es: { confirm: "Confirmar contraseña", mismatch: "Las contraseñas no coinciden.", show: "Mostrar contraseña", hide: "Ocultar contraseña" },
  sv: { confirm: "Bekräfta lösenord", mismatch: "Lösenorden matchar inte.", show: "Visa lösenord", hide: "Dölj lösenord" },
};

export function RegisterForm({ locale }: { locale: Locale }) {
  const copy = getAuthCopy(locale);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const resendSecondsLeft = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));

  useEffect(() => {
    if (!resendAvailableAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAvailableAt]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    if (password !== confirmPassword) { setMessage(passwordCopy[locale].mismatch); setBusy(false); return; }
    const submittedEmail = email.trim();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: submittedEmail, password, locale }),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; code?: string; message?: string } | null;
    if (!response.ok || !result?.ok) {
      setMessage(result?.code === "over_email_send_rate_limit" ? copy.registrationRateLimit : copy.registrationFailed);
      setBusy(false);
      return;
    }
    setRegisteredEmail(submittedEmail);
    setResendAvailableAt(Date.now() + 60_000);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmation(false);
    setMessage(copy.registrationComplete);
    setBusy(false);
  }

  async function resendConfirmation() {
    if (!registeredEmail) return;
    if (resendSecondsLeft > 0) {
      setMessage(copy.resendConfirmationWait);
      return;
    }
    setResendBusy(true);
    setMessage("");
    const redirectTo = `${window.location.origin}/${locale}/login?confirmed=1`;
    const { error } = await getSupabaseBrowserClient().auth.resend({
      type: "signup",
      email: registeredEmail,
      options: { emailRedirectTo: redirectTo },
    });
    setResendBusy(false);
    if (error) {
      setMessage(error.code === "over_email_send_rate_limit" ? copy.registrationRateLimit : copy.registrationFailed);
      setResendAvailableAt(Date.now() + 60_000);
      return;
    }
    setResendAvailableAt(Date.now() + 60_000);
    setMessage(copy.resendConfirmationSent);
  }

  return (
    <form className="mt-8 max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={submit}>
      <input autoComplete="name" className="w-full rounded-lg border px-3 py-2" name="name" onChange={(event) => setName(event.target.value)} placeholder={copy.name} required value={name} />
      <input autoComplete="email" className="mt-3 w-full rounded-lg border px-3 py-2" name="email" onChange={(event) => setEmail(event.target.value)} placeholder={copy.email} required type="email" value={email} />
      <PasswordField label={copy.password} name="password" onChange={setPassword} show={showPassword} toggle={() => setShowPassword((current) => !current)} toggleLabel={showPassword ? passwordCopy[locale].hide : passwordCopy[locale].show} value={password} />
      <PasswordField label={passwordCopy[locale].confirm} name="password-confirmation" onChange={setConfirmPassword} show={showConfirmation} toggle={() => setShowConfirmation((current) => !current)} toggleLabel={showConfirmation ? passwordCopy[locale].hide : passwordCopy[locale].show} value={confirmPassword} />
      <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream disabled:opacity-50" disabled={busy} type="submit">{busy ? copy.creatingAccount : copy.createAccount}</button>
      {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
      {registeredEmail ? (
        <button className="mt-3 rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest disabled:opacity-50" disabled={resendBusy || resendSecondsLeft > 0} onClick={resendConfirmation} type="button">
          {resendBusy ? copy.creatingAccount : resendSecondsLeft > 0 ? `${copy.resendConfirmation} (${resendSecondsLeft}s)` : copy.resendConfirmation}
        </button>
      ) : null}
      <p className="mt-5 text-sm text-forest/65">{copy.alreadyRegistered} <Link className="font-bold text-coffee" href={`/${locale}/login`}>{copy.signIn}</Link></p>
    </form>
  );
}

function PasswordField({ label, name, onChange, show, toggle, toggleLabel, value }: { label: string; name: string; onChange: (value: string) => void; show: boolean; toggle: () => void; toggleLabel: string; value: string }) {
  return <label className="mt-3 block text-sm font-bold text-forest">{label}<span className="relative mt-1 block"><input autoComplete="new-password" className="w-full rounded-lg border px-3 py-2 pr-12 font-normal" minLength={8} name={name} onChange={(event) => onChange(event.target.value)} required type={show ? "text" : "password"} value={value}/><button aria-label={toggleLabel} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-forest" onClick={toggle} title={toggleLabel} type="button">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>;
}
