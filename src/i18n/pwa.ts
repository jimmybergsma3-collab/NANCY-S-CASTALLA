import type { Locale } from "./config";

export type PwaCopy = {
  title: string;
  body: string;
  install: string;
  later: string;
  iosTitle: string;
  iosBody: string;
  manualTitle: string;
  manualBody: string;
};

const copy: Record<Locale, PwaCopy> = {
  en: {
    title: "Install Nancy's Castalla",
    body: "Add the shop to your phone for quick access to products, cart and orders.",
    install: "Install",
    later: "Not now",
    iosTitle: "Add Nancy's to your Home Screen",
    iosBody: "Tap Share in Safari and choose Add to Home Screen.",
    manualTitle: "Add Nancy's to your phone",
    manualBody: "Open your browser menu and choose Install app or Add to Home screen.",
  },
  nl: {
    title: "Installeer Nancy's Castalla",
    body: "Zet de winkel op je telefoon voor snelle toegang tot producten, winkelmand en bestellingen.",
    install: "Installeren",
    later: "Niet nu",
    iosTitle: "Zet Nancy's op je beginscherm",
    iosBody: "Tik in Safari op Delen en kies Zet op beginscherm.",
    manualTitle: "Zet Nancy's op je telefoon",
    manualBody: "Open het menu van je browser en kies App installeren of Toevoegen aan beginscherm.",
  },
  de: {
    title: "Nancy's Castalla installieren",
    body: "Fügen Sie den Shop zu Ihrem Telefon hinzu, um Produkte, Warenkorb und Bestellungen schnell zu öffnen.",
    install: "Installieren",
    later: "Nicht jetzt",
    iosTitle: "Nancy's zum Home-Bildschirm hinzufügen",
    iosBody: "Tippen Sie in Safari auf Teilen und wählen Sie Zum Home-Bildschirm.",
    manualTitle: "Nancy's zum Telefon hinzufügen",
    manualBody: "Öffnen Sie das Browsermenü und wählen Sie App installieren oder Zum Home-Bildschirm hinzufügen.",
  },
  es: {
    title: "Instalar Nancy's Castalla",
    body: "Añade la tienda a tu teléfono para acceder rápido a productos, carrito y pedidos.",
    install: "Instalar",
    later: "Ahora no",
    iosTitle: "Añade Nancy's a la pantalla de inicio",
    iosBody: "En Safari, toca Compartir y elige Añadir a pantalla de inicio.",
    manualTitle: "Añade Nancy's a tu teléfono",
    manualBody: "Abre el menú del navegador y elige Instalar aplicación o Añadir a pantalla de inicio.",
  },
  sv: {
    title: "Installera Nancy's Castalla",
    body: "Lägg till butiken på telefonen för snabb åtkomst till produkter, varukorg och beställningar.",
    install: "Installera",
    later: "Inte nu",
    iosTitle: "Lägg Nancy's på hemskärmen",
    iosBody: "Tryck på Dela i Safari och välj Lägg till på hemskärmen.",
    manualTitle: "Lägg Nancy's på telefonen",
    manualBody: "Öppna webbläsarens meny och välj Installera app eller Lägg till på hemskärmen.",
  },
};

export function getPwaCopy(locale: Locale) {
  return copy[locale];
}
