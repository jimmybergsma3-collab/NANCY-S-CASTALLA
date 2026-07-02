export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  infoEmail: process.env.INFO_EMAIL ?? "info@nancys.es",
  orderEmail: process.env.ORDER_EMAIL ?? "orders@nancys.es",
  accountEmail: process.env.ACCOUNT_EMAIL ?? "account@nancys.es",
  fromEmail: process.env.FROM_EMAIL ?? "Nancy's Castalla <orders@nancys.es>",
  productImagesBucket: process.env.PRODUCT_IMAGES_BUCKET ?? "product-images",
};

export function hasSupabaseAdmin() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function hasSupabasePublic() {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function hasEmailProvider() {
  return Boolean(env.resendApiKey);
}
