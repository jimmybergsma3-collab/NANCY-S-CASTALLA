import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/*/admin", "/api/"] }, sitemap: "https://www.nancys.es/sitemap.xml", host: "https://www.nancys.es" }; }
