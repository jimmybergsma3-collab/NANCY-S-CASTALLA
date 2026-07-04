import { LoginForm } from "@/components/auth/LoginForm";
import { defaultLocale, isLocale } from "@/i18n/config";
export default async function LoginPage({ params }: { params: Promise<unknown> }) { const { locale: raw } = await params as { locale?: string }; const locale = isLocale(raw) ? raw : defaultLocale; return <section className="mx-auto max-w-5xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Customer account</p><h1 className="mt-2 font-serif text-5xl font-bold text-forest">Sign in</h1><LoginForm locale={locale}/></section>; }
