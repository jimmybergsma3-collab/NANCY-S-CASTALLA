import { Suspense } from "react";
import { AccountDashboard } from "@/components/auth/AccountDashboard";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getAuthCopy } from "@/i18n/auth";
export default async function AccountPage({ params }: { params: Promise<unknown> }) { const { locale: raw } = await params as { locale?: string }; const locale = isLocale(raw) ? raw : defaultLocale; const copy = getAuthCopy(locale); return <section className="mx-auto max-w-6xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">{copy.account}</p><h1 className="mt-2 font-serif text-5xl font-bold text-forest">{copy.account}</h1><Suspense fallback={<p className="mt-6 text-forest/65">...</p>}><AccountDashboard locale={locale}/></Suspense></section>; }
