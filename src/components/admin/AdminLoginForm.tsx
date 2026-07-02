"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function AdminLoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setMessage(result.message || "Login failed.");
      setSubmitting(false);
      return;
    }

    router.replace(`/${locale}/admin`);
    router.refresh();
  }

  return (
    <form className="mt-8 w-full max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={submit}>
      <div className="flex items-center gap-3 text-forest">
        <LockKeyhole size={22} />
        <h1 className="font-serif text-3xl font-bold">Backoffice login</h1>
      </div>
      <label className="mt-6 block text-sm font-bold text-forest">
        Email
        <input className="mt-1 w-full rounded-lg border border-forest/15 px-3 py-2" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label className="mt-4 block text-sm font-bold text-forest">
        Password
        <input className="mt-1 w-full rounded-lg border border-forest/15 px-3 py-2" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      <button className="mt-5 w-full rounded-full bg-forest px-5 py-3 font-bold text-cream disabled:opacity-50" disabled={submitting} type="submit">
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
    </form>
  );
}
