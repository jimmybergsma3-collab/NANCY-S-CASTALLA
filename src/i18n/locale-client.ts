"use client";

import { isLocale, type Locale } from "./config";
import { localeCookieMaxAge, localeCookieName, localeStorageKey } from "./locale-preference";

export function persistLocalePreference(locale: Locale) {
  window.localStorage.setItem(localeStorageKey, locale);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${localeCookieName}=${locale}; Path=/; Max-Age=${localeCookieMaxAge}; SameSite=Lax${secure}`;
  document.documentElement.lang = locale;
}

export async function getProfileLocale(accessToken: string): Promise<Locale | undefined> {
  try {
    const response = await fetch("/api/account/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return undefined;
    const result = await response.json() as { profile?: { language?: string } };
    return isLocale(result.profile?.language) ? result.profile.language : undefined;
  } catch {
    return undefined;
  }
}

export async function updateProfileLocale(accessToken: string, locale: Locale) {
  try {
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ language: locale }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
