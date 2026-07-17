export const locales = ["en", "nl", "de", "es", "sv"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  es: "Español",
  sv: "Svenska / Scandinavian",
};

export function isLocale(value: unknown): value is Locale {
  if (typeof value !== "string") {
    return false;
  }

  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export const dictionaries = {
  en: {
    nav: {
      home: "Home",
      products: "Products",
      bread: "Bread",
      delivery: "Collection & delivery",
      about: "About",
      contact: "Contact",
      register: "Register",
      admin: "Admin",
    },
    common: {
      phase: "Starting soon / pre-order phase",
      whatsapp: "WhatsApp",
      orderViaWhatsApp: "Order via WhatsApp",
      collection: "Collection",
      localDelivery: "Local delivery",
      all: "All",
      soon: "Soon",
    },
    home: {
      headline: "International food, coffee and pre-orders for expats around Castalla.",
      intro:
        "A warm small-stock market concept with Dutch, British, Irish, European and South American favourites, plus bread by pre-order and local delivery when possible.",
      shop: "Shop starter products",
      bread: "Bread pre-orders",
      cardTitle: "International foods, coffee, bread and drinks",
      cardText: "Premium, warm and practical for British, Dutch, Irish, European and South American expats around Castalla.",
      featured: "Featured products",
      starterRange: "Starter range",
      viewAll: "View all products",
      smallStock: "Small stock first",
      smallStockText: "The first phase keeps stock lean and focuses on reliable expat favourites.",
      breadDemand: "Bread by demand",
      deliveryTitle: "Collection and delivery",
      deliveryText: "Collection in Castalla, with local delivery when possible and minimum order rules in the config.",
    },
    products: {
      eyebrow: "Starter product selection",
      title: "Products",
      intro:
        "A focused first range for a small expat shop: Dutch snacks, British and Irish favourites, South American pantry items, bakery pre-orders, breakfast products, coffee, drinks and condiments.",
    },
    bread: {
      eyebrow: "Bread on pre-order",
      title: "Bread & bakery",
      intro:
        "Bread is available by pre-order when minimum demand is reached. Add products to the cart, send your order request, and Nancy's Castalla confirms availability, collection or delivery and payment instructions.",
      how: "How it works:",
      howText: "choose bread, send the order request, and wait for confirmation before payment.",
    },
    delivery: {
      eyebrow: "Collection & delivery",
      title: "Simple, flexible fulfilment",
      collectionTitle: "Collection in Castalla",
      collectionText: "Order requests are checked first and can be collected at",
      localTitle: "Local delivery",
      localText: "Delivery is possible when routes and timing allow.",
      paymentTitle: "Payment after confirmation",
      paymentText:
        "Customers can send an order request through the cart. Nancy's Castalla checks availability server-side and then sends Bizum or bank transfer details. Automatic card payment is not active.",
    },
    about: {
      eyebrow: "About Nancy's Castalla",
      title: "A warm market for expat favourites",
      p1:
        "Nancy's Castalla is starting as a professional but simple international food concept for expats around Castalla: practical groceries, familiar snacks, coffee, bread by pre-order and flexible collection or delivery.",
      p2:
        "The first focus combines British, Dutch, Irish and wider European favourites with a growing South American selection. The South American range starts limited and expands once demand is clear.",
      p3:
        "The website now supports customer accounts, a cart and server-checked order requests. Payment is arranged only after Nancy's Castalla confirms availability, using Bizum or bank transfer. WhatsApp remains available for questions and support.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Order support by WhatsApp",
      address: "Address",
      send: "Send WhatsApp",
      note: "Collection times, local delivery and payment instructions are confirmed per order during the starting soon / pre-order phase.",
    },
    order: {
      title: "Your order request",
      empty: "Choose products and quantities to prepare your order request.",
      estimatedTotal: "Estimated total",
      deliveryNote: "Local delivery minimum is",
      after:
        "After receiving the order request, Nancy's Castalla confirms availability and sends Bizum or bank transfer instructions.",
    },
  },
  nl: {
    nav: {
      home: "Home",
      products: "Producten",
      bread: "Brood",
      delivery: "Afhalen & bezorgen",
      about: "Over ons",
      contact: "Contact",
      register: "Registreren",
      admin: "Admin",
    },
    common: {
      phase: "Binnenkort open / pre-orderfase",
      whatsapp: "WhatsApp",
      orderViaWhatsApp: "Bestel via WhatsApp",
      collection: "Afhalen",
      localDelivery: "Lokale bezorging",
      all: "Alles",
      soon: "Binnenkort",
    },
    home: {
      headline: "Internationale producten, koffie en pre-orders voor expats rond Castalla.",
      intro:
        "Een warm marktconcept met kleine voorraad, Nederlandse, Britse, Ierse, Europese en Zuid-Amerikaanse favorieten, brood op bestelling en lokale bezorging wanneer mogelijk.",
      shop: "Bekijk starterproducten",
      bread: "Brood bestellen",
      cardTitle: "Internationale producten, koffie, brood en dranken",
      cardText: "Premium, warm en praktisch voor Britse, Nederlandse, Ierse, Europese en Zuid-Amerikaanse expats rond Castalla.",
      featured: "Uitgelichte producten",
      starterRange: "Starterselectie",
      viewAll: "Alle producten",
      smallStock: "Eerst kleine voorraad",
      smallStockText: "De eerste fase houdt voorraad beperkt en focust op betrouwbare expatfavorieten.",
      breadDemand: "Brood bij genoeg vraag",
      deliveryTitle: "Afhalen en bezorgen",
      deliveryText: "Afhalen in Castalla, met lokale bezorging wanneer mogelijk en regels in de config.",
    },
    products: {
      eyebrow: "Starterselectie",
      title: "Producten",
      intro:
        "Een gerichte eerste selectie voor een kleine expatwinkel: Nederlandse snacks, Britse en Ierse favorieten, Zuid-Amerikaanse voorraadproducten, brood op bestelling, ontbijtproducten, koffie, dranken en sauzen.",
    },
    bread: {
      eyebrow: "Brood op bestelling",
      title: "Brood & bakkerij",
      intro:
        "Brood is beschikbaar als pre-order wanneer de minimale vraag wordt gehaald. Voeg producten toe aan de winkelmand, verstuur je bestelaanvraag en Nancy's Castalla bevestigt beschikbaarheid, afhalen of bezorgen en betaalinstructies.",
      how: "Zo werkt het:",
      howText: "kies brood, verstuur je bestelaanvraag en wacht op bevestiging voor betaling.",
    },
    delivery: {
      eyebrow: "Afhalen & bezorgen",
      title: "Simpel en flexibel",
      collectionTitle: "Afhalen in Castalla",
      collectionText: "Bestelaanvragen worden eerst gecontroleerd en kunnen worden afgehaald op",
      localTitle: "Lokale bezorging",
      localText: "Bezorging is mogelijk wanneer route en timing passen.",
      paymentTitle: "Betalen na bevestiging",
      paymentText:
        "Klanten kunnen via de winkelmand een bestelaanvraag versturen. Nancy's Castalla controleert de beschikbaarheid server-side en stuurt daarna Bizum- of bankgegevens. Automatische kaartbetaling is niet actief.",
    },
    about: {
      eyebrow: "Over Nancy's Castalla",
      title: "Een warme markt voor expatfavorieten",
      p1:
        "Nancy's Castalla start als professioneel maar eenvoudig internationaal foodconcept voor expats rond Castalla: praktische boodschappen, bekende snacks, koffie, brood op bestelling en flexibel afhalen of bezorgen.",
      p2:
        "De eerste focus combineert Britse, Nederlandse, Ierse en bredere Europese favorieten met een groeiende Zuid-Amerikaanse selectie. Het Zuid-Amerikaanse assortiment start beperkt en groeit mee met de vraag.",
      p3:
        "De website ondersteunt nu klantaccounts, een winkelmand en server-gecontroleerde bestelaanvragen. Betalen gebeurt pas nadat Nancy's Castalla de beschikbaarheid bevestigt, via Bizum of bankoverschrijving. WhatsApp blijft beschikbaar voor vragen en ondersteuning.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Bestelhulp via WhatsApp",
      address: "Adres",
      send: "Stuur WhatsApp",
      note: "Afhaalmomenten, lokale bezorging en betaalinstructies worden per bestelling bevestigd tijdens de pre-orderfase.",
    },
    order: {
      title: "Je bestelaanvraag",
      empty: "Kies producten en aantallen om je bestelaanvraag voor te bereiden.",
      estimatedTotal: "Geschat totaal",
      deliveryNote: "Minimum voor lokale bezorging is",
      after:
        "Na ontvangst bevestigt Nancy's Castalla beschikbaarheid en stuurt instructies voor Bizum of bankoverschrijving.",
    },
  },
  de: {
    nav: {
      home: "Start",
      products: "Produkte",
      bread: "Brot",
      delivery: "Abholung & Lieferung",
      about: "Über uns",
      contact: "Kontakt",
      register: "Registrieren",
      admin: "Admin",
    },
    common: {
      phase: "Startet bald / Vorbestellphase",
      whatsapp: "WhatsApp",
      orderViaWhatsApp: "Per WhatsApp bestellen",
      collection: "Abholung",
      localDelivery: "Lokale Lieferung",
      all: "Alle",
      soon: "Bald",
    },
    home: {
      headline: "Internationale Lebensmittel, Kaffee und Vorbestellungen für Expats rund um Castalla.",
      intro:
        "Ein warmes Marktkonzept mit kleinem Lager, niederländischen, britischen, irischen, europäischen und südamerikanischen Favoriten, Brot auf Vorbestellung und lokaler Lieferung, wenn möglich.",
      shop: "Starterprodukte ansehen",
      bread: "Brot vorbestellen",
      cardTitle: "Internationale Lebensmittel, Kaffee, Brot und Getränke",
      cardText: "Premium, warm und praktisch für britische, niederländische, irische, europäische und südamerikanische Expats rund um Castalla.",
      featured: "Empfohlene Produkte",
      starterRange: "Startsortiment",
      viewAll: "Alle Produkte",
      smallStock: "Zuerst kleines Lager",
      smallStockText: "Die erste Phase hält den Lagerbestand schlank und konzentriert sich auf beliebte Expat-Produkte.",
      breadDemand: "Brot nach Nachfrage",
      deliveryTitle: "Abholung und Lieferung",
      deliveryText: "Abholung in Castalla, lokale Lieferung wenn möglich und Mindestbestellung in der Konfiguration.",
    },
    products: {
      eyebrow: "Startsortiment",
      title: "Produkte",
      intro:
        "Eine gezielte erste Auswahl für einen kleinen Expat-Shop: niederländische Snacks, britische und irische Favoriten, südamerikanische Vorratsprodukte, Brot-Vorbestellungen, Frühstück, Kaffee, Getränke und Saucen.",
    },
    bread: {
      eyebrow: "Brot auf Vorbestellung",
      title: "Brot & Bäckerei",
      intro:
        "Brot ist per Vorbestellung verfügbar, wenn die Mindestnachfrage erreicht wird. Legen Sie Produkte in den Warenkorb, senden Sie die Bestellanfrage und Nancy's Castalla bestätigt Verfügbarkeit, Abholung oder Lieferung und Zahlungsinformationen.",
      how: "So funktioniert es:",
      howText: "Brot wählen, Bestellanfrage senden und vor der Zahlung auf Bestätigung warten.",
    },
    delivery: {
      eyebrow: "Abholung & Lieferung",
      title: "Einfach und flexibel",
      collectionTitle: "Abholung in Castalla",
      collectionText: "Bestellanfragen werden zuerst geprüft und können abgeholt werden bei",
      localTitle: "Lokale Lieferung",
      localText: "Lieferung ist möglich, wenn Route und Zeit passen.",
      paymentTitle: "Zahlung nach Bestätigung",
      paymentText:
        "Kunden können über den Warenkorb eine Bestellanfrage senden. Nancy's Castalla prüft die Verfügbarkeit serverseitig und sendet danach Bizum- oder Bankdaten. Automatische Kartenzahlung ist nicht aktiv.",
    },
    about: {
      eyebrow: "Über Nancy's Castalla",
      title: "Ein warmer Markt für Expat-Favoriten",
      p1:
        "Nancy's Castalla startet als professionelles, aber einfaches internationales Food-Konzept für Expats rund um Castalla: praktische Lebensmittel, bekannte Snacks, Kaffee, Brot auf Vorbestellung und flexible Abholung oder Lieferung.",
      p2:
        "Der erste Fokus kombiniert britische, niederländische, irische und weitere europäische Favoriten mit einer wachsenden südamerikanischen Auswahl. Das südamerikanische Sortiment startet begrenzt und wächst mit der Nachfrage.",
      p3:
        "Die Website unterstützt jetzt Kundenkonten, einen Warenkorb und serverseitig geprüfte Bestellanfragen. Bezahlt wird erst, nachdem Nancy's Castalla die Verfügbarkeit bestätigt hat, per Bizum oder Überweisung. WhatsApp bleibt für Fragen und Support verfügbar.",
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Bestellhilfe per WhatsApp",
      address: "Adresse",
      send: "WhatsApp senden",
      note: "Abholzeiten, lokale Lieferung und Zahlungsinformationen werden pro Bestellung während der Vorbestellphase bestätigt.",
    },
    order: {
      title: "Ihre Bestellanfrage",
      empty: "Wählen Sie Produkte und Mengen für Ihre Bestellanfrage.",
      estimatedTotal: "Geschätzte Summe",
      deliveryNote: "Mindestbestellung für lokale Lieferung ist",
      after:
        "Nach Eingang der Bestellanfrage bestätigt Nancy's Castalla die Verfügbarkeit und sendet Zahlungsanweisungen für Bizum oder Überweisung.",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      products: "Productos",
      bread: "Pan",
      delivery: "Recogida y entrega",
      about: "Sobre Nancy's",
      contact: "Contacto",
      register: "Registro",
      admin: "Admin",
    },
    common: {
      phase: "Próximamente / fase de prepedido",
      whatsapp: "WhatsApp",
      orderViaWhatsApp: "Pedir por WhatsApp",
      collection: "Recogida",
      localDelivery: "Entrega local",
      all: "Todo",
      soon: "Próximamente",
    },
    home: {
      headline: "Productos internacionales, café y prepedidos para expatriados cerca de Castalla.",
      intro:
        "Un concepto cálido de mercado con stock pequeño, favoritos neerlandeses, británicos, irlandeses, europeos y sudamericanos, pan por encargo y entrega local cuando sea posible.",
      shop: "Ver productos iniciales",
      bread: "Prepedir pan",
      cardTitle: "Productos internacionales, café, pan y bebidas",
      cardText: "Premium, cálido y práctico para expatriados británicos, neerlandeses, irlandeses, europeos y sudamericanos cerca de Castalla.",
      featured: "Productos destacados",
      starterRange: "Selección inicial",
      viewAll: "Ver todos",
      smallStock: "Primero stock pequeño",
      smallStockText: "La primera fase mantiene poco stock y se centra en favoritos fiables para expatriados.",
      breadDemand: "Pan según demanda",
      deliveryTitle: "Recogida y entrega",
      deliveryText: "Recogida en Castalla, con entrega local cuando sea posible y mínimos configurables.",
    },
    products: {
      eyebrow: "Selección inicial",
      title: "Productos",
      intro:
        "Una primera gama enfocada para una pequeña tienda expat: snacks neerlandeses, favoritos británicos e irlandeses, productos sudamericanos de despensa, pan por encargo, desayuno, café, bebidas y salsas.",
    },
    bread: {
      eyebrow: "Pan por encargo",
      title: "Pan y bollería",
      intro:
        "El pan está disponible por prepedido cuando se alcanza una demanda mínima. Añade productos al carrito, envía tu solicitud y Nancy's Castalla confirma disponibilidad, recogida o entrega e instrucciones de pago.",
      how: "Cómo funciona:",
      howText: "elige pan, envía la solicitud de pedido y espera confirmación antes de pagar.",
    },
    delivery: {
      eyebrow: "Recogida y entrega",
      title: "Simple y flexible",
      collectionTitle: "Recogida en Castalla",
      collectionText: "Las solicitudes de pedido se revisan primero y se pueden recoger en",
      localTitle: "Entrega local",
      localText: "La entrega es posible cuando la ruta y el horario lo permiten.",
      paymentTitle: "Pago tras confirmación",
      paymentText:
        "Los clientes pueden enviar una solicitud de pedido desde el carrito. Nancy's Castalla comprueba la disponibilidad en el servidor y después envía los datos de Bizum o transferencia bancaria. El pago automático con tarjeta no está activo.",
    },
    about: {
      eyebrow: "Sobre Nancy's Castalla",
      title: "Un mercado cálido para favoritos expat",
      p1:
        "Nancy's Castalla empieza como un concepto internacional profesional pero sencillo para expatriados cerca de Castalla: productos prácticos, snacks familiares, café, pan por encargo y recogida o entrega flexible.",
      p2:
        "El primer enfoque combina favoritos británicos, neerlandeses, irlandeses y europeos con una selección sudamericana en crecimiento. La gama sudamericana empieza limitada y crecerá según la demanda.",
      p3:
        "La web ya permite cuentas de cliente, carrito y solicitudes de pedido comprobadas en el servidor. El pago se organiza solo después de que Nancy's Castalla confirme disponibilidad, mediante Bizum o transferencia bancaria. WhatsApp sigue disponible para preguntas y ayuda.",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Ayuda con pedidos por WhatsApp",
      address: "Dirección",
      send: "Enviar WhatsApp",
      note: "Los horarios de recogida, la entrega local y las instrucciones de pago se confirman por pedido durante la fase de prepedido.",
    },
    order: {
      title: "Tu solicitud de pedido",
      empty: "Elige productos y cantidades para preparar tu solicitud de pedido.",
      estimatedTotal: "Total estimado",
      deliveryNote: "El mínimo para entrega local es",
      after:
        "Tras recibir la solicitud, Nancy's Castalla confirma disponibilidad y envía instrucciones para Bizum o transferencia bancaria.",
    },
  },
  sv: {
    nav: {
      home: "Hem",
      products: "Produkter",
      bread: "Bröd",
      delivery: "Hämtning & leverans",
      about: "Om oss",
      contact: "Kontakt",
      register: "Registrera",
      admin: "Admin",
    },
    common: {
      phase: "Öppnar snart / förbeställningsfas",
      whatsapp: "WhatsApp",
      orderViaWhatsApp: "Beställ via WhatsApp",
      collection: "Hämtning",
      localDelivery: "Lokal leverans",
      all: "Alla",
      soon: "Snart",
    },
    home: {
      headline: "Internationella livsmedel, kaffe och förbeställningar för utlandsboende runt Castalla.",
      intro:
        "Ett varmt marknadskoncept med litet lager, nederländska, brittiska, irländska, europeiska och sydamerikanska favoriter, bröd på förbeställning och lokal leverans när det är möjligt.",
      shop: "Se startprodukterna",
      bread: "Förbeställ bröd",
      cardTitle: "Internationella livsmedel, kaffe, bröd och drycker",
      cardText: "Premium, varmt och praktiskt för brittiska, nederländska, irländska, europeiska och sydamerikanska utlandsboende runt Castalla.",
      featured: "Utvalda produkter",
      starterRange: "Startsortiment",
      viewAll: "Visa alla produkter",
      smallStock: "Litet lager först",
      smallStockText: "Den första fasen håller lagret litet och fokuserar på pålitliga internationella favoriter.",
      breadDemand: "Bröd efter efterfrågan",
      deliveryTitle: "Hämtning och leverans",
      deliveryText: "Hämtning i Castalla, med lokal leverans när det är möjligt och minimiorder enligt inställningarna.",
    },
    products: {
      eyebrow: "Startsortiment",
      title: "Produkter",
      intro:
        "Ett fokuserat första sortiment för en liten internationell butik: nederländska snacks, brittiska och irländska favoriter, sydamerikanska skafferivaror, bageriförbeställningar, frukostprodukter, kaffe, drycker och tillbehör.",
    },
    bread: {
      eyebrow: "Bröd på förbeställning",
      title: "Bröd & bageri",
      intro:
        "Bröd kan förbeställas när minsta efterfrågan har uppnåtts. Lägg produkter i varukorgen, skicka din beställningsförfrågan och Nancy's Castalla bekräftar tillgänglighet, hämtning eller leverans och betalningsinformation.",
      how: "Så fungerar det:",
      howText: "välj bröd, skicka din beställningsförfrågan och vänta på bekräftelse innan betalning.",
    },
    delivery: {
      eyebrow: "Hämtning & leverans",
      title: "Enkelt och flexibelt",
      collectionTitle: "Hämtning i Castalla",
      collectionText: "Beställningsförfrågningar kontrolleras först och kan hämtas på",
      localTitle: "Lokal leverans",
      localText: "Leverans är möjlig när rutt och tid passar.",
      paymentTitle: "Betalning efter bekräftelse",
      paymentText:
        "Kunder kan skicka en beställningsförfrågan via varukorgen. Nancy's Castalla kontrollerar tillgänglighet på servern och skickar sedan uppgifter för Bizum eller banköverföring. Automatisk kortbetalning är inte aktiv.",
    },
    about: {
      eyebrow: "Om Nancy's Castalla",
      title: "En varm marknad för internationella favoriter",
      p1:
        "Nancy's Castalla startar som ett professionellt men enkelt internationellt matkoncept för utlandsboende runt Castalla: praktiska matvaror, välkända snacks, kaffe, bröd på förbeställning och flexibel hämtning eller leverans.",
      p2:
        "Den första satsningen kombinerar brittiska, nederländska, irländska och bredare europeiska favoriter med ett växande sydamerikanskt sortiment. Det sydamerikanska sortimentet startar begränsat och växer när efterfrågan blir tydlig.",
      p3:
        "Webbplatsen stöder nu kundkonton, varukorg och beställningsförfrågningar som kontrolleras på servern. Betalning ordnas först efter att Nancy's Castalla har bekräftat tillgänglighet, via Bizum eller banköverföring. WhatsApp finns kvar för frågor och support.",
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Beställningshjälp via WhatsApp",
      address: "Adress",
      send: "Skicka WhatsApp",
      note: "Hämtningstider, lokal leverans och betalningsinformation bekräftas per beställning under förbeställningsfasen.",
    },
    order: {
      title: "Din beställningsförfrågan",
      empty: "Välj produkter och antal för att förbereda din beställningsförfrågan.",
      estimatedTotal: "Beräknad totalsumma",
      deliveryNote: "Minsta order för lokal leverans är",
      after:
        "När beställningsförfrågan har tagits emot bekräftar Nancy's Castalla tillgänglighet och skickar instruktioner för Bizum eller banköverföring.",
    },
  },
} as const;
