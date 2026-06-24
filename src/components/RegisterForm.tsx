"use client";

import { useState } from "react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const result = (await response.json()) as { ok: boolean; message: string };
    setMessage(result.message);
  }

  return (
    <form className="mt-8 max-w-md rounded-lg border border-forest/10 bg-white p-6 shadow-soft" onSubmit={submit}>
      <input className="w-full rounded-lg border px-3 py-2" onChange={(event) => setName(event.target.value)} placeholder="Name" required value={name} />
      <input className="mt-3 w-full rounded-lg border px-3 py-2" onChange={(event) => setEmail(event.target.value)} placeholder="Email" required type="email" value={email} />
      <input className="mt-3 w-full rounded-lg border px-3 py-2" onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder="Password" required type="password" value={password} />
      <button className="mt-4 rounded-full bg-forest px-5 py-3 font-bold text-cream" type="submit">Create account</button>
      {message ? <p className="mt-3 text-sm text-forest/75">{message}</p> : null}
    </form>
  );
}
