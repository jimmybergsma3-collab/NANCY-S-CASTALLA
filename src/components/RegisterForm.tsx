"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getAuthCopy } from "@/i18n/auth";
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    if (password !== confirmPassword) { setMessage(passwordCopy[locale].mismatch); setBusy(false); return; }
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
      <input autoComplete="name" className="w-full rounded-lg border px-3 py-2" name="name" onChange={(event) => setName(event.target.value)} placeholder={copy.name} required value={name} />
      <input autoComplete="email" className="mt-3 w-full rounded-lg border px-3 py-2" name="email" onChange={(event) => setEmail(event.target.value)} placeholder={copy.email} required type="email" value={email} />
      <PasswordField label={copy.password} name="password" onChange={setPassword} show={showPassword} toggle={() => setShowPassword((current) => !current)} toggleLabel={showPassword ? passwordCopy[locale].hide : passwordCopy[locale].show} value={password} />
      <PasswordField label={passwordCopy[locale].confirm} name="password-confirmation" onChange={setConfirmPassword} show={showConfirmation} toggle={() => setShowConfirmation((current) => !current)} toggleLabel={showConfirmation ? passwordCopy[locale].hide : passwordCopy[locale].show} value={confirmPassword} />
      <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream disabled:opacity-50" disabled={busy} type="submit">{busy ? copy.creatingAccount : copy.createAccount}</button>
      {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
      <p className="mt-5 text-sm text-forest/65">{copy.alreadyRegistered} <Link className="font-bold text-coffee" href={`/${locale}/login`}>{copy.signIn}</Link></p>
    </form>
  );
}

function PasswordField({ label, name, onChange, show, toggle, toggleLabel, value }: { label: string; name: string; onChange: (value: string) => void; show: boolean; toggle: () => void; toggleLabel: string; value: string }) {
  return <label className="mt-3 block text-sm font-bold text-forest">{label}<span className="relative mt-1 block"><input autoComplete="new-password" className="w-full rounded-lg border px-3 py-2 pr-12 font-normal" minLength={8} name={name} onChange={(event) => onChange(event.target.value)} required type={show ? "text" : "password"} value={value}/><button aria-label={toggleLabel} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-forest" onClick={toggle} title={toggleLabel} type="button">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>;
}
