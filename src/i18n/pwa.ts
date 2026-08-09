import type { Locale } from "./config";

export type PwaCopy = {
  title: string;
  body: string;
  install: string;
  later: string;
  iosTitle: string;
  iosBody: string;
};

const copy: Record<Locale, PwaCopy> = {
  en: {
    title: "Install Nancy's Castalla",
    body: "Add the shop to your phone for quick access to products, cart and orders.",
    install: "Install",
    later: "Not now",
    iosTitle: "Add Nancy's to your Home Screen",
    iosBody: "Tap Share in Safari and choose Add to Home Screen.",
  },
  nl: {
    title: "Installeer Nancy's Castalla",
    body: "Zet de winkel op je telefoon voor snelle toegang tot producten, winkelmand en bestellingen.",
    install: "Installeren",
    later: "Niet nu",
    iosTitle: "Zet Nancy's op je beginscherm",
    iosBody: "Tik in Safari op Delen en kies Zet op beginscherm.",
  },
  de: {
    title: "Nancy's Castalla installieren",
    body: "Fügen Sie den Shop zu Ihrem Telefon hinzu, um Produkte, Warenkorb und Bestellungen schnell zu öffnen.",
    install: "Installieren",
    later: "Nicht jetzt",
    iosTitle: "Nancy's zum Home-Bildschirm hinzufügen",
    iosBody: "Tippen Sie in Safari auf Teilen und wählen Sie Zum Home-Bildschirm.",
  },
  es: {
    title: "Instalar Nancy's Castalla",
    body: "Añade la tienda a tu teléfono para acceder rápido a productos, carrito y pedidos.",
    install: "Instalar",
    later: "Ahora no",
    iosTitle: "Añade Nancy's a la pantalla de inicio",
    iosBody: "En Safari, toca Compartir y elige Añadir a pantalla de inicio.",
  },
  sv: {
    title: "Installera Nancy's Castalla",
    body: "Lägg till butiken på telefonen för snabb åtkomst till produkter, varukorg och beställningar.",
    install: "Installera",
    later: "Inte nu",
    iosTitle: "Lägg Nancy's på hemskärmen",
    iosBody: "Tryck på Dela i Safari och välj Lägg till på hemskärmen.",
  },
};

export function getPwaCopy(locale: Locale) {
  return copy[locale];
}
