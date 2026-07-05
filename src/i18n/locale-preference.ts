import { defaultLocale, isLocale, type Locale } from "./config";

export const localeCookieName = "nancys_locale";
export const localeStorageKey = "nancys_locale";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

const spanishCountryCodes = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GT", "HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

export function localeFromLanguageTag(value: string | null | undefined): Locale | undefined {
  if (!value) return undefined;
  const language = value.trim().toLowerCase().replace("_", "-").split("-")[0];

  if (language === "nl") return "nl";
  if (language === "en") return "en";
  if (language === "de") return "de";
  if (language === "es") return "es";
  if (["sv", "no", "nb", "nn", "da", "fi", "is"].includes(language)) return "sv";
  return undefined;
}

export function localeFromAcceptLanguage(value: string | null | undefined): Locale | undefined {
  if (!value) return undefined;
  const preferences = value
    .split(",")
    .map((part, index) => {
      const [tag, ...parameters] = part.trim().split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
      return { index, locale: localeFromLanguageTag(tag), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((preference): preference is { index: number; locale: Locale; quality: number } => Boolean(preference.locale))
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  return preferences[0]?.locale;
}

export function localeFromCountry(value: string | null | undefined): Locale | undefined {
  const country = value?.trim().toUpperCase();
  if (!country) return undefined;
  if (country === "NL") return "nl";
  if (["DE", "AT", "CH"].includes(country)) return "de";
  if (["SE", "NO", "DK", "FI", "IS"].includes(country)) return "sv";
  if (spanishCountryCodes.has(country)) return "es";
  if (["GB", "IE", "US", "CA", "AU", "NZ"].includes(country)) return "en";
  return undefined;
}

export function resolvePreferredLocale(options: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
  country?: string | null;
}): Locale {
  if (isLocale(options.cookieLocale)) return options.cookieLocale;
  return localeFromAcceptLanguage(options.acceptLanguage) ?? localeFromCountry(options.country) ?? defaultLocale;
}

export function replacePathLocale(pathname: string, locale: Locale) {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) segments[1] = locale;
  else segments.splice(1, 0, locale);
  return segments.join("/") || `/${locale}`;
}

export function isAdminPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const pathSegments = isLocale(segments[0]) ? segments.slice(1) : segments;
  return pathSegments[0] === "admin";
}
