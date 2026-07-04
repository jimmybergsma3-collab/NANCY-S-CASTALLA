import { Suspense } from "react";
import { AccountDashboard } from "@/components/auth/AccountDashboard";
import { defaultLocale, isLocale } from "@/i18n/config";
export default async function AccountPage({ params }: { params: Promise<unknown> }) { const { locale: raw } = await params as { locale?: string }; const locale = isLocale(raw) ? raw : defaultLocale; return <section className="mx-auto max-w-6xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Customer account</p><h1 className="mt-2 font-serif text-5xl font-bold text-forest">My account</h1><Suspense fallback={<p className="mt-6 text-forest/65">Loading account...</p>}><AccountDashboard locale={locale}/></Suspense></section>; }
