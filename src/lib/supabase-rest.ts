import { env, hasSupabaseAdmin } from "./env";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
  range?: {
    from: number;
    to: number;
  };
};

export class SupabaseRestError extends Error {
  constructor(message: string, public status: number, public path: string) {
    super(message);
    this.name = "SupabaseRestError";
  }
}

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
      ...(options.range ? { Range: `${options.range.from}-${options.range.to}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new SupabaseRestError(message || `Supabase request failed with ${response.status}`, response.status, path);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function supabaseAuthSignup(input: { email: string; password: string; name: string; locale: string; redirectTo: string }) {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const response = await fetch(`${env.supabaseUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(input.redirectTo)}`, {
    method: "POST",
    headers: {
      apikey: env.supabasePublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: { name: input.name, language: input.locale },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    let parsed: { error_code?: string; code?: string; msg?: string; message?: string } | undefined;
    try {
      parsed = JSON.parse(message) as typeof parsed;
    } catch {
      parsed = undefined;
    }
    const error = new Error(parsed?.msg || parsed?.message || message || `Supabase signup failed with ${response.status}`);
    error.name = parsed?.error_code || parsed?.code || `SUPABASE_SIGNUP_${response.status}`;
    throw error;
  }

  return response.json();
}
