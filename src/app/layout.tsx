import type { Metadata, Viewport } from "next";
import "./globals.css";
import { businessConfig } from "@/config/business";
import { CartProvider } from "@/components/cart/CartProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nancys.es"),
  title: "Nancy's Castalla | International food, coffee and pre-orders",
  description:
    "International food Castalla, British food Castalla, Dutch snacks Castalla, expat food Castalla and bread order Castalla.",
  keywords: [...businessConfig.seoKeywords],
  openGraph: {
    title: "Nancy's Castalla",
    description: businessConfig.openingTexts.shortIntro,
    type: "website",
  },
  alternates: { canonical: "/en" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className="font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
