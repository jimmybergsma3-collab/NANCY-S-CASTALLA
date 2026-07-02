import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { isAdminSession } from "@/lib/admin-auth";

export async function requireAdmin(params: Promise<unknown>): Promise<Locale> {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  if (!(await isAdminSession())) redirect(`/${locale}/admin/login`);
  return locale;
}
