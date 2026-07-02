import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ params }: { params: Promise<unknown> }) {
  const { locale: rawLocale } = (await params) as { locale?: string };
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  if (await isAdminSession()) redirect(`/${locale}/admin`);

  return (
    <section className="mx-auto flex min-h-[65vh] max-w-5xl items-start justify-center px-4 py-12">
      <AdminLoginForm locale={locale} />
    </section>
  );
}
