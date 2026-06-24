import { env, hasSupabaseAdmin } from "./env";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
};

export async function supabaseAdminFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!hasSupabaseAdmin()) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  const response = await fetch(`${env.supabaseUrl}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: options.prefer ?? "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function supabaseAuthSignup(input: { email: string; password: string; name: string }) {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const response = await fetch(`${env.supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: env.supabasePublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: { name: input.name },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase signup failed with ${response.status}`);
  }

  return response.json();
}
