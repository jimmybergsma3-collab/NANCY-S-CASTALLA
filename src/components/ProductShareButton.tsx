"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

const labels: Record<Locale, { copied: string; copy: string; facebook: string; share: string; text: string; whatsapp: string }> = {
  en: { copied: "Link copied", copy: "Copy link", facebook: "Share on Facebook", share: "Share product", text: "Take a look at this product from Nancy's Castalla", whatsapp: "Share on WhatsApp" },
  nl: { copied: "Link gekopieerd", copy: "Kopieer link", facebook: "Deel op Facebook", share: "Deel product", text: "Bekijk dit product van Nancy's Castalla", whatsapp: "Deel via WhatsApp" },
  de: { copied: "Link kopiert", copy: "Link kopieren", facebook: "Auf Facebook teilen", share: "Produkt teilen", text: "Sieh dir dieses Produkt von Nancy's Castalla an", whatsapp: "Per WhatsApp teilen" },
  es: { copied: "Enlace copiado", copy: "Copiar enlace", facebook: "Compartir en Facebook", share: "Compartir producto", text: "Mira este producto de Nancy's Castalla", whatsapp: "Compartir por WhatsApp" },
  sv: { copied: "Länk kopierad", copy: "Kopiera länk", facebook: "Dela på Facebook", share: "Dela produkt", text: "Se den här produkten från Nancy's Castalla", whatsapp: "Dela via WhatsApp" },
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

export function ProductShareButton({
  compact = false,
  locale,
  productCode,
  productName,
  productUrl,
}: {
  compact?: boolean;
  locale: Locale;
  productCode: string;
  productName: string;
  productUrl?: string;
}) {
  const [copied, setCopied] = useState(false);
  const label = labels[locale];
  const [shareUrl, setShareUrl] = useState("");

  function getShareUrl() {
    if (shareUrl) return shareUrl;
    const url = productUrl ? new URL(productUrl, window.location.origin).href : window.location.href;
    setShareUrl(url);
    return url;
  }

  function shareText() {
    return `${label.text}: ${productName} (${productCode})`;
  }

  async function copyProductUrl() {
    await copyCurrentUrl(getShareUrl());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  async function shareProduct() {
    const url = getShareUrl();
    const shareData = {
      title: `${productName} | Nancy's Castalla`,
      text: shareText(),
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

    await copyProductUrl();
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=640");
  }

  function shareToFacebook() {
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`);
  }

  function shareToWhatsApp() {
    openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${shareText()} ${getShareUrl()}`)}`);
  }

  const iconButtonClass = "grid h-11 w-11 place-items-center rounded-full border border-forest/20 bg-white text-forest transition hover:border-forest hover:bg-linen";

  return (
    <div className={`${compact ? "mt-3" : "mt-4"} flex flex-wrap items-center gap-2`}>
      <button
        aria-label={label.share}
        className={`${compact ? iconButtonClass : "inline-flex min-h-11 items-center gap-2 rounded-full border border-forest/20 bg-white px-4 py-2 text-sm font-bold text-forest transition hover:border-forest hover:bg-linen"}`}
        onClick={shareProduct}
        title={label.share}
        type="button"
      >
        <Share2 size={18} />
        {compact ? null : label.share}
      </button>
      <button
        aria-label={label.facebook}
        className={`${iconButtonClass} text-sm font-black`}
        onClick={shareToFacebook}
        title={label.facebook}
        type="button"
      >
        f
      </button>
      <button
        aria-label={label.whatsapp}
        className={iconButtonClass}
        onClick={shareToWhatsApp}
        title={label.whatsapp}
        type="button"
      >
        <MessageCircle size={18} />
      </button>
      <button
        aria-label={copied ? label.copied : label.copy}
        className={iconButtonClass}
        onClick={copyProductUrl}
        title={copied ? label.copied : label.copy}
        type="button"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </button>
    </div>
  );
}
