import { env } from "./env";

export type CustomerAuthUser = { id: string; email?: string; user_metadata?: { name?: string } };

export async function getCustomerAuthUser(request: Request): Promise<CustomerAuthUser | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token || !env.supabaseUrl || !env.supabasePublishableKey) return null;
  const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: env.supabasePublishableKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json() as Promise<CustomerAuthUser>;
}
