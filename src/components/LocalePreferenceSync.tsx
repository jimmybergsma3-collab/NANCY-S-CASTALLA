"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import type { Locale } from "@/i18n/config";
import { getProfileLocale, persistLocalePreference } from "@/i18n/locale-client";
import { isAdminPath, replacePathLocale } from "@/i18n/locale-preference";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LocalePreferenceSync({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    persistLocalePreference(locale);
    if (isAdminPath(pathname)) return () => { active = false; };

    async function syncSession(session: Session | null) {
      if (!session || !active) return;
      const preferredLocale = await getProfileLocale(session.access_token);
      if (!active || !preferredLocale || preferredLocale === locale) return;
      persistLocalePreference(preferredLocale);
      const search = window.location.search;
      router.replace(`${replacePathLocale(pathname, preferredLocale)}${search}`);
    }

    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      return () => { active = false; };
    }
    void supabase.auth.getSession().then(({ data }) => syncSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => void syncSession(session));

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [locale, pathname, router]);

  return null;
}
