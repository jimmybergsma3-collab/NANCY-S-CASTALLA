"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

const labels: Record<Locale, { copied: string; share: string; text: string }> = {
  en: { copied: "Link copied", share: "Share product", text: "Take a look at this product from Nancy's Castalla" },
  nl: { copied: "Link gekopieerd", share: "Deel product", text: "Bekijk dit product van Nancy's Castalla" },
  de: { copied: "Link kopiert", share: "Produkt teilen", text: "Sieh dir dieses Produkt von Nancy's Castalla an" },
  es: { copied: "Enlace copiado", share: "Compartir producto", text: "Mira este producto de Nancy's Castalla" },
  sv: { copied: "Lanken kopierad", share: "Dela produkt", text: "Se den har produkten fran Nancy's Castalla" },
};

async function copyCurrentUrl(url: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const input = document.createElement("textarea");
  input.value = url;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export function ProductShareButton({ locale, productCode, productName }: { locale: Locale; productCode: string; productName: string }) {
  const [copied, setCopied] = useState(false);
  const label = labels[locale];

  async function shareProduct() {
    const url = window.location.href;
    const shareData = {
      title: `${productName} | Nancy's Castalla`,
      text: `${label.text}: ${productName} (${productCode})`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyCurrentUrl(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-forest/20 bg-white px-4 py-2 text-sm font-bold text-forest transition hover:border-forest hover:bg-linen"
      onClick={shareProduct}
      title={label.share}
      type="button"
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      {copied ? label.copied : label.share}
    </button>
  );
}
