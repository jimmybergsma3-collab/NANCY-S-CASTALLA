"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getPwaCopy } from "@/i18n/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedKey = "nancys_install_prompt_dismissed";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

export function PwaInstallPrompt({ locale }: { locale: Locale }) {
  const copy = getPwaCopy(locale);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || window.localStorage.getItem(dismissedKey) === "1") return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    const iosHintTimer = window.setTimeout(() => setShowIosHint(isIosSafari()), 0);

    return () => {
      window.clearTimeout(iosHintTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(dismissedKey, "1");
    setInstallEvent(null);
    setShowIosHint(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => undefined);
    dismiss();
  }

  if (!installEvent && !showIosHint) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-lg border border-forest/15 bg-white p-4 text-forest shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-cream">
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-bold">{installEvent ? copy.title : copy.iosTitle}</p>
          <p className="mt-1 text-sm leading-5 text-forest/70">{installEvent ? copy.body : copy.iosBody}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {installEvent ? (
              <button className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream" onClick={() => void install()} type="button">
                {copy.install}
              </button>
            ) : null}
            <button className="rounded-full border border-forest/15 px-4 py-2 text-sm font-bold text-forest" onClick={dismiss} type="button">
              {copy.later}
            </button>
          </div>
        </div>
        <button aria-label={copy.later} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-forest/60 hover:bg-linen" onClick={dismiss} type="button">
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
