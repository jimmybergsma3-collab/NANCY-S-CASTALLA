export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  orderEmail: process.env.ORDER_EMAIL ?? "orders@nancyscastalla.com",
  fromEmail: process.env.FROM_EMAIL ?? "Nancy's Castalla <orders@nancyscastalla.com>",
};

export function hasSupabaseAdmin() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function hasSupabasePublic() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasEmailProvider() {
  return Boolean(env.resendApiKey);
}
