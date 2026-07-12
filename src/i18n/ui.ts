import type { Locale } from "./config";
import type { ProductCategory, ProductStatus } from "@/types/product";

type UiCopy = {
  header: { closeMenu: string; home: string; openMenu: string; orderSupport: string; switchLanguage: string };
  home: { breadPreorderNote: string };
  products: {
    addInstruction: string;
    additionalInformation: string;
    availablePackageSizes: string;
    backToProducts: string;
    browseCategory: string;
    categoryDescription: string;
    conservation: string;
    directions: string;
    ingredients: string;
    noProducts: string;
    openCategory: string;
    origin: string;
    package: string;
    photoSoon: string;
    pieces: string;
    productCode: string;
    products: string;
    searchPlaceholder: string;
    soldAs: string;
    status: string;
    unit: string;
    viewDetails: string;
    youMayAlsoLike: string;
  };
  order: {
    address: string;
    after: string;
    deliveryFeeFrom: string;
    deliveryMinimum: string;
    email: string;
    emailUnavailable: string;
    empty: string;
    estimatedTotal: string;
    name: string;
    notes: string;
    orderError: string;
    orderReceived: string;
    orderSent: string;
    phone: string;
    send: string;
    sending: string;
    title: string;
    withinRadius: string;
  };
  footer: {
    bankTransfer: string;
    cardLater: string;
    cashCollection: string;
    cashDelivery: string;
    payment: string;
    privacy: string;
    tagline: string;
    terms: string;
    visit: string;
  };
  infoPoints: string[];
  categories: Record<ProductCategory, string>;
  statuses: Record<ProductStatus, string>;
  whatsappMessage: {
    address: string;
    availability: string;
    collection: string;
    greeting: string;
    localDelivery: string;
    name: string;
    payment: string;
    preOrder: string;
    preferredOption: string;
    preferredTime: string;
    total: string;
  };
};

const copies: Record<Locale, UiCopy> = {
  en: {
    header: { closeMenu: "Close menu", home: "Nancy's Castalla home", openMenu: "Open menu", orderSupport: "Order support", switchLanguage: "Switch language to" },
    home: { breadPreorderNote: "Bread is available by pre-order when minimum demand is reached." },
    products: {
      addInstruction: "Add this item below and send the request. Nancy's Castalla confirms availability, collection or delivery, and payment instructions.",
      additionalInformation: "Additional information", availablePackageSizes: "Available package sizes", backToProducts: "Back to products",
      browseCategory: "Browse this category, search by product name or product code, and send your request for collection or local delivery.",
      categoryDescription: "Open this category and search by name or product code.", conservation: "Conservation", directions: "Directions for use",
      ingredients: "Ingredients", noProducts: "No products found. Try another product name, category or product code.", openCategory: "Open category",
      origin: "Origin", package: "Package", photoSoon: "Photo coming soon", pieces: "pieces", productCode: "Product code", products: "products",
      searchPlaceholder: "Search by name, category, description or product code", soldAs: "Sold as", status: "Status", unit: "Unit", viewDetails: "View product details",
      youMayAlsoLike: "You may also like",
    },
    order: {
      address: "Address", after: "After receiving the order, Nancy's Castalla confirms availability and sends Bizum or bank transfer instructions.",
      deliveryFeeFrom: "Delivery fee from", deliveryMinimum: "Local delivery minimum is", email: "Email for confirmation",
      emailUnavailable: "The email provider is not configured yet.", empty: "Choose products and quantities to prepare your order request.", estimatedTotal: "Estimated total",
      name: "Name", notes: "Notes or preferred time", orderError: "Order could not be sent.", orderReceived: "received", orderSent: "sent. Please check your email.",
      phone: "Phone / WhatsApp", send: "Send order request", sending: "Sending...", title: "Your order request", withinRadius: "within around {km} km when possible.",
    },
    footer: { bankTransfer: "Bank transfer", cardLater: "Card payment later", cashCollection: "Cash on collection", cashDelivery: "Cash on delivery", payment: "Payment V1", privacy: "Privacy", tagline: "International foods, coffee, empanadas and drinks", terms: "Terms", visit: "Visit" },
    infoPoints: ["Small stock", "Pre-orders", "WhatsApp ordering", "Collection in Castalla", "Local delivery when possible"],
    categories: {
      "Dutch products": "Dutch products", "British & Irish products": "British & Irish products", "German products": "German products",
      "Scandinavian products": "Scandinavian products", "Asian & Indonesian products": "Asian & Indonesian products", "South American products": "South American products",
      "Vegan & vegetarian": "Vegan & vegetarian", "Frozen snacks": "Frozen snacks", "Bread & bakery": "Bread & bakery",
      "Breakfast products": "Breakfast products", "Coffee & drinks": "Coffee & drinks", "Sauces & condiments": "Sauces & condiments",
      "Non-food & packaging": "Non-food & packaging",
    },
    statuses: { available: "Available", preorder: "Pre-order", "coming-soon": "Coming soon" },
    whatsappMessage: { address: "Delivery address, if needed:", availability: "I would like to ask about current availability.", collection: "Collection", greeting: "Hello", localDelivery: "Local delivery", name: "Name:", payment: "Payment preference: Bizum / bank transfer", preOrder: "I would like to place a pre-order:", preferredOption: "Preferred option", preferredTime: "Preferred collection or delivery time:", total: "Estimated product total" },
  },
  nl: {
    header: { closeMenu: "Menu sluiten", home: "Nancy's Castalla home", openMenu: "Menu openen", orderSupport: "Bestelhulp", switchLanguage: "Taal wijzigen naar" },
    home: { breadPreorderNote: "Brood is beschikbaar via pre-order wanneer de minimale vraag is bereikt." },
    products: {
      addInstruction: "Voeg dit product hieronder toe en verstuur je aanvraag. Nancy's Castalla bevestigt beschikbaarheid, afhalen of bezorgen en de betaalinstructies.",
      additionalInformation: "Aanvullende informatie", availablePackageSizes: "Beschikbare verpakkingen", backToProducts: "Terug naar producten",
      browseCategory: "Bekijk deze categorie, zoek op productnaam of productcode en verstuur je aanvraag voor afhalen of lokale bezorging.",
      categoryDescription: "Open deze categorie en zoek op naam of productcode.", conservation: "Bewaren", directions: "Gebruiksaanwijzing",
      ingredients: "Ingrediënten", noProducts: "Geen producten gevonden. Probeer een andere naam, categorie of productcode.", openCategory: "Categorie openen",
      origin: "Herkomst", package: "Verpakking", photoSoon: "Foto volgt binnenkort", pieces: "stuks", productCode: "Productcode", products: "producten",
      searchPlaceholder: "Zoek op naam, categorie, omschrijving of productcode", soldAs: "Verkocht als", status: "Status", unit: "Eenheid", viewDetails: "Bekijk productdetails",
      youMayAlsoLike: "Misschien vind je dit ook interessant",
    },
    order: {
      address: "Adres", after: "Na ontvangst bevestigt Nancy's Castalla de beschikbaarheid en volgen instructies voor Bizum of bankoverschrijving.",
      deliveryFeeFrom: "Bezorgkosten vanaf", deliveryMinimum: "Minimum voor lokale bezorging is", email: "E-mail voor bevestiging",
      emailUnavailable: "De e-maildienst is nog niet geconfigureerd.", empty: "Kies producten en aantallen om je bestelaanvraag voor te bereiden.", estimatedTotal: "Geschat totaal",
      name: "Naam", notes: "Opmerkingen of gewenst tijdstip", orderError: "De bestelling kon niet worden verzonden.", orderReceived: "ontvangen", orderSent: "verzonden. Controleer je e-mail.",
      phone: "Telefoon / WhatsApp", send: "Bestelaanvraag versturen", sending: "Versturen...", title: "Je bestelaanvraag", withinRadius: "binnen ongeveer {km} km wanneer mogelijk.",
    },
    footer: { bankTransfer: "Bankoverschrijving", cardLater: "Kaartbetaling later", cashCollection: "Contant bij afhalen", cashDelivery: "Contant bij bezorgen", payment: "Betaling V1", privacy: "Privacy", tagline: "Internationale producten, koffie, empanadas en dranken", terms: "Voorwaarden", visit: "Bezoek" },
    infoPoints: ["Kleine voorraad", "Pre-orders", "Bestellen via WhatsApp", "Afhalen in Castalla", "Lokale bezorging wanneer mogelijk"],
    categories: {
      "Dutch products": "Nederlandse producten", "British & Irish products": "Britse & Ierse producten", "German products": "Duitse producten",
      "Scandinavian products": "Scandinavische producten", "Asian & Indonesian products": "Aziatische & Indonesische producten", "South American products": "Zuid-Amerikaanse producten",
      "Vegan & vegetarian": "Vegan & vegetarisch", "Frozen snacks": "Diepvries snacks", "Bread & bakery": "Brood & bakkerij",
      "Breakfast products": "Ontbijtproducten", "Coffee & drinks": "Koffie & dranken", "Sauces & condiments": "Sauzen & smaakmakers",
      "Non-food & packaging": "Non-food & verpakkingen",
    },
    statuses: { available: "Beschikbaar", preorder: "Voorbestelling", "coming-soon": "Binnenkort" },
    whatsappMessage: { address: "Bezorgadres, indien nodig:", availability: "Ik wil graag informeren naar de actuele beschikbaarheid.", collection: "Afhalen", greeting: "Hallo", localDelivery: "Lokale bezorging", name: "Naam:", payment: "Betaalvoorkeur: Bizum / bankoverschrijving", preOrder: "Ik wil graag een pre-order plaatsen:", preferredOption: "Gewenste optie", preferredTime: "Gewenst afhaal- of bezorgmoment:", total: "Geschat producttotaal" },
  },
  de: {
    header: { closeMenu: "Menü schließen", home: "Nancy's Castalla Startseite", openMenu: "Menü öffnen", orderSupport: "Bestellhilfe", switchLanguage: "Sprache wechseln zu" },
    home: { breadPreorderNote: "Brot ist auf Vorbestellung erhältlich, sobald die Mindestnachfrage erreicht ist." },
    products: {
      addInstruction: "Fügen Sie diesen Artikel unten hinzu und senden Sie die Anfrage. Nancy's Castalla bestätigt Verfügbarkeit, Abholung oder Lieferung und Zahlungsinformationen.",
      additionalInformation: "Zusätzliche Informationen", availablePackageSizes: "Verfügbare Packungsgrößen", backToProducts: "Zurück zu den Produkten",
      browseCategory: "Durchsuchen Sie diese Kategorie nach Produktname oder Produktcode und senden Sie Ihre Anfrage zur Abholung oder lokalen Lieferung.",
      categoryDescription: "Kategorie öffnen und nach Name oder Produktcode suchen.", conservation: "Aufbewahrung", directions: "Zubereitung und Verwendung",
      ingredients: "Zutaten", noProducts: "Keine Produkte gefunden. Versuchen Sie einen anderen Namen, eine Kategorie oder einen Produktcode.", openCategory: "Kategorie öffnen",
      origin: "Herkunft", package: "Packung", photoSoon: "Foto folgt in Kürze", pieces: "Stück", productCode: "Produktcode", products: "Produkte",
      searchPlaceholder: "Nach Name, Kategorie, Beschreibung oder Produktcode suchen", soldAs: "Verkauft als", status: "Status", unit: "Einheit", viewDetails: "Produktdetails ansehen",
      youMayAlsoLike: "Das könnte Ihnen auch gefallen",
    },
    order: {
      address: "Adresse", after: "Nach Eingang bestätigt Nancy's Castalla die Verfügbarkeit und sendet Anweisungen für Bizum oder Überweisung.",
      deliveryFeeFrom: "Liefergebühr ab", deliveryMinimum: "Mindestbestellung für lokale Lieferung ist", email: "E-Mail für Bestätigung",
      emailUnavailable: "Der E-Mail-Dienst ist noch nicht konfiguriert.", empty: "Wählen Sie Produkte und Mengen für Ihre Bestellanfrage.", estimatedTotal: "Geschätzte Summe",
      name: "Name", notes: "Anmerkungen oder gewünschte Zeit", orderError: "Die Bestellung konnte nicht gesendet werden.", orderReceived: "eingegangen", orderSent: "gesendet. Bitte prüfen Sie Ihre E-Mail.",
      phone: "Telefon / WhatsApp", send: "Bestellanfrage senden", sending: "Wird gesendet...", title: "Ihre Bestellanfrage", withinRadius: "innerhalb von etwa {km} km, wenn möglich.",
    },
    footer: { bankTransfer: "Überweisung", cardLater: "Kartenzahlung später", cashCollection: "Bar bei Abholung", cashDelivery: "Bar bei Lieferung", payment: "Zahlung V1", privacy: "Datenschutz", tagline: "Internationale Lebensmittel, Kaffee, Empanadas und Getränke", terms: "Bedingungen", visit: "Besuch" },
    infoPoints: ["Kleiner Bestand", "Vorbestellungen", "Bestellung per WhatsApp", "Abholung in Castalla", "Lokale Lieferung wenn möglich"],
    categories: {
      "Dutch products": "Niederländische Produkte", "British & Irish products": "Britische & irische Produkte", "German products": "Deutsche Produkte",
      "Scandinavian products": "Skandinavische Produkte", "Asian & Indonesian products": "Asiatische & indonesische Produkte", "South American products": "Südamerikanische Produkte",
      "Vegan & vegetarian": "Vegan & vegetarisch", "Frozen snacks": "Tiefkühl-Snacks", "Bread & bakery": "Brot & Bäckerei",
      "Breakfast products": "Frühstücksprodukte", "Coffee & drinks": "Kaffee & Getränke", "Sauces & condiments": "Saucen & Würzmittel",
      "Non-food & packaging": "Non-Food & Verpackungen",
    },
    statuses: { available: "Verfügbar", preorder: "Vorbestellung", "coming-soon": "Demnächst" },
    whatsappMessage: { address: "Lieferadresse, falls erforderlich:", availability: "Ich möchte nach der aktuellen Verfügbarkeit fragen.", collection: "Abholung", greeting: "Hallo", localDelivery: "Lokale Lieferung", name: "Name:", payment: "Zahlungswunsch: Bizum / Überweisung", preOrder: "Ich möchte eine Vorbestellung aufgeben:", preferredOption: "Gewünschte Option", preferredTime: "Gewünschte Abhol- oder Lieferzeit:", total: "Geschätzte Produktsumme" },
  },
  es: {
    header: { closeMenu: "Cerrar menú", home: "Inicio de Nancy's Castalla", openMenu: "Abrir menú", orderSupport: "Ayuda con pedidos", switchLanguage: "Cambiar idioma a" },
    home: { breadPreorderNote: "El pan está disponible por prepedido cuando se alcanza la demanda mínima." },
    products: {
      addInstruction: "Añade este producto abajo y envía la solicitud. Nancy's Castalla confirma disponibilidad, recogida o entrega e instrucciones de pago.",
      additionalInformation: "Información adicional", availablePackageSizes: "Formatos disponibles", backToProducts: "Volver a productos",
      browseCategory: "Explora esta categoría, busca por nombre o código de producto y envía tu solicitud para recogida o entrega local.",
      categoryDescription: "Abre esta categoría y busca por nombre o código de producto.", conservation: "Conservación", directions: "Modo de uso",
      ingredients: "Ingredientes", noProducts: "No se encontraron productos. Prueba otro nombre, categoría o código.", openCategory: "Abrir categoría",
      origin: "Origen", package: "Formato", photoSoon: "Foto próximamente", pieces: "unidades", productCode: "Código de producto", products: "productos",
      searchPlaceholder: "Buscar por nombre, categoría, descripción o código", soldAs: "Se vende como", status: "Estado", unit: "Unidad", viewDetails: "Ver detalles del producto",
      youMayAlsoLike: "También te puede gustar",
    },
    order: {
      address: "Dirección", after: "Tras recibir el pedido, Nancy's Castalla confirma disponibilidad y envía instrucciones para Bizum o transferencia bancaria.",
      deliveryFeeFrom: "Gastos de entrega desde", deliveryMinimum: "El mínimo para entrega local es", email: "Correo para confirmación",
      emailUnavailable: "El servicio de correo aún no está configurado.", empty: "Elige productos y cantidades para preparar tu solicitud de pedido.", estimatedTotal: "Total estimado",
      name: "Nombre", notes: "Notas u horario preferido", orderError: "No se pudo enviar el pedido.", orderReceived: "recibido", orderSent: "enviado. Revisa tu correo.",
      phone: "Teléfono / WhatsApp", send: "Enviar solicitud de pedido", sending: "Enviando...", title: "Tu solicitud de pedido", withinRadius: "en un radio aproximado de {km} km cuando sea posible.",
    },
    footer: { bankTransfer: "Transferencia bancaria", cardLater: "Pago con tarjeta más adelante", cashCollection: "Efectivo al recoger", cashDelivery: "Efectivo al entregar", payment: "Pago V1", privacy: "Privacidad", tagline: "Productos internacionales, café, empanadas y bebidas", terms: "Condiciones", visit: "Visítanos" },
    infoPoints: ["Stock pequeño", "Prepedidos", "Pedidos por WhatsApp", "Recogida en Castalla", "Entrega local cuando sea posible"],
    categories: {
      "Dutch products": "Productos neerlandeses", "British & Irish products": "Productos británicos e irlandeses", "German products": "Productos alemanes",
      "Scandinavian products": "Productos escandinavos", "Asian & Indonesian products": "Productos asiáticos e indonesios", "South American products": "Productos sudamericanos",
      "Vegan & vegetarian": "Vegano y vegetariano", "Frozen snacks": "Aperitivos congelados", "Bread & bakery": "Pan y bollería",
      "Breakfast products": "Productos de desayuno", "Coffee & drinks": "Café y bebidas", "Sauces & condiments": "Salsas y condimentos",
      "Non-food & packaging": "No alimentario y envases",
    },
    statuses: { available: "Disponible", preorder: "Prepedido", "coming-soon": "Próximamente" },
    whatsappMessage: { address: "Dirección de entrega, si es necesaria:", availability: "Quisiera consultar la disponibilidad actual.", collection: "Recogida", greeting: "Hola", localDelivery: "Entrega local", name: "Nombre:", payment: "Preferencia de pago: Bizum / transferencia bancaria", preOrder: "Quisiera realizar un prepedido:", preferredOption: "Opción preferida", preferredTime: "Horario preferido de recogida o entrega:", total: "Total estimado de productos" },
  },
  sv: {
    header: { closeMenu: "Stäng menyn", home: "Nancy's Castalla startsida", openMenu: "Öppna menyn", orderSupport: "Beställningshjälp", switchLanguage: "Byt språk till" },
    home: { breadPreorderNote: "Bröd kan förbeställas när minsta efterfrågan har uppnåtts." },
    products: {
      addInstruction: "Lägg till produkten nedan och skicka förfrågan. Nancy's Castalla bekräftar tillgänglighet, hämtning eller leverans och betalningsinformation.",
      additionalInformation: "Ytterligare information", availablePackageSizes: "Tillgängliga förpackningar", backToProducts: "Tillbaka till produkter",
      browseCategory: "Utforska kategorin, sök efter produktnamn eller produktkod och skicka din förfrågan för hämtning eller lokal leverans.",
      categoryDescription: "Öppna kategorin och sök efter namn eller produktkod.", conservation: "Förvaring", directions: "Användning",
      ingredients: "Ingredienser", noProducts: "Inga produkter hittades. Prova ett annat namn, en kategori eller produktkod.", openCategory: "Öppna kategori",
      origin: "Ursprung", package: "Förpackning", photoSoon: "Foto kommer snart", pieces: "stycken", productCode: "Produktkod", products: "produkter",
      searchPlaceholder: "Sök på namn, kategori, beskrivning eller produktkod", soldAs: "Säljs som", status: "Status", unit: "Enhet", viewDetails: "Visa produktdetaljer",
      youMayAlsoLike: "Du kanske också gillar",
    },
    order: {
      address: "Adress", after: "När beställningen har tagits emot bekräftar Nancy's Castalla tillgänglighet och skickar instruktioner för Bizum eller banköverföring.",
      deliveryFeeFrom: "Leveransavgift från", deliveryMinimum: "Minsta order för lokal leverans är", email: "E-post för bekräftelse",
      emailUnavailable: "E-posttjänsten är ännu inte konfigurerad.", empty: "Välj produkter och antal för att förbereda din beställningsförfrågan.", estimatedTotal: "Beräknad totalsumma",
      name: "Namn", notes: "Anteckningar eller önskad tid", orderError: "Beställningen kunde inte skickas.", orderReceived: "mottagen", orderSent: "skickad. Kontrollera din e-post.",
      phone: "Telefon / WhatsApp", send: "Skicka beställningsförfrågan", sending: "Skickar...", title: "Din beställningsförfrågan", withinRadius: "inom cirka {km} km när det är möjligt.",
    },
    footer: { bankTransfer: "Banköverföring", cardLater: "Kortbetalning senare", cashCollection: "Kontant vid hämtning", cashDelivery: "Kontant vid leverans", payment: "Betalning V1", privacy: "Integritet", tagline: "Internationella livsmedel, kaffe, empanadas och drycker", terms: "Villkor", visit: "Besök" },
    infoPoints: ["Litet lager", "Förbeställningar", "Beställning via WhatsApp", "Hämtning i Castalla", "Lokal leverans när det är möjligt"],
    categories: {
      "Dutch products": "Nederländska produkter", "British & Irish products": "Brittiska och irländska produkter", "German products": "Tyska produkter",
      "Scandinavian products": "Skandinaviska produkter", "Asian & Indonesian products": "Asiatiska och indonesiska produkter", "South American products": "Sydamerikanska produkter",
      "Vegan & vegetarian": "Veganskt och vegetariskt", "Frozen snacks": "Frysta snacks", "Bread & bakery": "Bröd och bageri",
      "Breakfast products": "Frukostprodukter", "Coffee & drinks": "Kaffe och drycker", "Sauces & condiments": "Såser och tillbehör",
      "Non-food & packaging": "Icke-livsmedel och förpackningar",
    },
    statuses: { available: "Tillgänglig", preorder: "Förbeställning", "coming-soon": "Kommer snart" },
    whatsappMessage: { address: "Leveransadress vid behov:", availability: "Jag vill fråga om aktuell tillgänglighet.", collection: "Hämtning", greeting: "Hej", localDelivery: "Lokal leverans", name: "Namn:", payment: "Betalningsönskemål: Bizum / banköverföring", preOrder: "Jag vill göra en förbeställning:", preferredOption: "Önskat alternativ", preferredTime: "Önskad tid för hämtning eller leverans:", total: "Beräknad produktsumma" },
  },
};

export function getUiCopy(locale: Locale) {
  return copies[locale];
}
