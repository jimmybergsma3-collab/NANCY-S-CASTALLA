import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
const routes = ["", "/products", "/bread", "/collection-delivery", "/about", "/contact", "/register", "/login", "/privacy", "/terms"];
export default function sitemap(): MetadataRoute.Sitemap { const now = new Date(); return locales.flatMap((locale) => routes.map((route) => ({ url: `https://www.nancys.es/${locale}${route}`, lastModified: now, changeFrequency: route === "/products" ? "daily" as const : "monthly" as const, priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.6 }))); }
