export const locales = ["en", "nl", "de", "es", "sv"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  es: "Español",
  sv: "Scandinavian",
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
        "Bread is available by pre-order when minimum demand is reached. Order interest is collected via WhatsApp first, then Nancy's Castalla confirms availability, delivery moments and payment instructions.",
      how: "How it works:",
      howText: "choose bread, send the WhatsApp order, and wait for confirmation before payment.",
    },
    delivery: {
      eyebrow: "Collection & delivery",
      title: "Simple, flexible fulfilment",
      collectionTitle: "Collection in Castalla",
      collectionText: "Orders are confirmed by WhatsApp and can be collected at",
      localTitle: "Local delivery",
      localText: "Delivery is possible when routes and timing allow.",
      paymentTitle: "Payment after confirmation",
      paymentText:
        "No Stripe checkout is active in version 1. After receiving the WhatsApp order, Nancy's Castalla sends Bizum details, bank transfer details or confirms cash payment on collection or delivery.",
    },
    about: {
      eyebrow: "About Nancy's Castalla",
      title: "A warm market for expat favourites",
      p1:
        "Nancy's Castalla is starting as a professional but simple international food concept for expats around Castalla: practical groceries, familiar snacks, coffee, bread by pre-order and flexible collection or delivery.",
      p2:
        "The first focus combines British, Dutch, Irish and wider European favourites with a growing South American selection. The South American range starts limited and expands once demand is clear.",
      p3:
        "The site is built for a small-stock launch: no checkout, no database and no complicated account system. Customers choose products, send a WhatsApp message and receive confirmation before payment.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Order and questions by WhatsApp",
      address: "Address",
      send: "Send WhatsApp",
      note: "Collection times are confirmed per order during the starting soon / pre-order phase.",
    },
    order: {
      title: "Your order request",
      empty: "Choose products and quantities to prepare your order request.",
      estimatedTotal: "Estimated total",
      deliveryNote: "Local delivery minimum is",
      after:
        "After receiving the order, Nancy's Castalla confirms availability and sends Bizum, bank transfer or cash payment instructions.",
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
      phase: "Binnenkort open / pre-order fase",
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
        "Brood is beschikbaar als pre-order wanneer de minimale vraag wordt gehaald. Interesse wordt eerst via WhatsApp verzameld; daarna bevestigt Nancy's Castalla beschikbaarheid, levermomenten en betaling.",
      how: "Zo werkt het:",
      howText: "kies brood, stuur de WhatsApp-bestelling en wacht op bevestiging voor betaling.",
    },
    delivery: {
      eyebrow: "Afhalen & bezorgen",
      title: "Simpel en flexibel",
      collectionTitle: "Afhalen in Castalla",
      collectionText: "Bestellingen worden via WhatsApp bevestigd en kunnen worden afgehaald op",
      localTitle: "Lokale bezorging",
      localText: "Bezorging is mogelijk wanneer route en timing passen.",
      paymentTitle: "Betalen na bevestiging",
      paymentText:
        "In versie 1 is er geen Stripe checkout. Na ontvangst van de WhatsApp-bestelling stuurt Nancy's Castalla Bizum-gegevens, bankgegevens of bevestigt contante betaling bij afhalen of bezorgen.",
    },
    about: {
      eyebrow: "Over Nancy's Castalla",
      title: "Een warme markt voor expatfavorieten",
      p1:
        "Nancy's Castalla start als professioneel maar eenvoudig internationaal foodconcept voor expats rond Castalla: praktische boodschappen, bekende snacks, koffie, brood op bestelling en flexibel afhalen of bezorgen.",
      p2:
        "De eerste focus combineert Britse, Nederlandse, Ierse en bredere Europese favorieten met een groeiende Zuid-Amerikaanse selectie. Het Zuid-Amerikaanse assortiment start beperkt en groeit mee met de vraag.",
      p3:
        "De site is gebouwd voor een start met kleine voorraad: geen checkout, geen database en geen ingewikkelde accounts. Klanten kiezen producten, sturen WhatsApp en krijgen bevestiging voor betaling.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Bestellen en vragen via WhatsApp",
      address: "Adres",
      send: "Stuur WhatsApp",
      note: "Afhaalmomenten worden per bestelling bevestigd tijdens de pre-order fase.",
    },
    order: {
      title: "Je bestelaanvraag",
      empty: "Kies producten en aantallen om je bestelaanvraag voor te bereiden.",
      estimatedTotal: "Geschat totaal",
      deliveryNote: "Minimum voor lokale bezorging is",
      after:
        "Na ontvangst bevestigt Nancy's Castalla beschikbaarheid en stuurt instructies voor Bizum, bankoverschrijving of contante betaling.",
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
        "Ein warmes Marktkonzept mit kleiner Auswahl, niederländischen, britischen, irischen und europäischen Favoriten, Brot auf Vorbestellung und lokaler Lieferung wenn möglich.",
      shop: "Starterprodukte ansehen",
      bread: "Brot vorbestellen",
      cardTitle: "Internationale Lebensmittel, Kaffee, Brot und Getränke",
      cardText: "Premium, warm und praktisch für britische, niederländische, irische und europäische Expats rund um Castalla.",
      featured: "Empfohlene Produkte",
      starterRange: "Startsortiment",
      viewAll: "Alle Produkte",
      smallStock: "Zuerst kleine Auswahl",
      smallStockText: "Die erste Phase hält den Lagerbestand schlank und konzentriert sich auf beliebte Expat-Produkte.",
      breadDemand: "Brot nach Nachfrage",
      deliveryTitle: "Abholung und Lieferung",
      deliveryText: "Abholung in Castalla, lokale Lieferung wenn möglich und Mindestbestellung in der Konfiguration.",
    },
    products: {
      eyebrow: "Startsortiment",
      title: "Produkte",
      intro:
        "Eine gezielte erste Auswahl für einen kleinen Expat-Shop: niederländische Snacks, britische und irische Favoriten, Brot-Vorbestellungen, Frühstück, Kaffee, Getränke und Saucen.",
    },
    bread: {
      eyebrow: "Brot auf Vorbestellung",
      title: "Brot & Bäckerei",
      intro:
        "Brot ist per Vorbestellung verfügbar, wenn die Mindestnachfrage erreicht wird. Bestellinteresse läuft zuerst über WhatsApp, danach bestätigt Nancy's Castalla Verfügbarkeit, Termine und Zahlung.",
      how: "So funktioniert es:",
      howText: "Brot wählen, WhatsApp-Bestellung senden und vor der Zahlung auf Bestätigung warten.",
    },
    delivery: {
      eyebrow: "Abholung & Lieferung",
      title: "Einfach und flexibel",
      collectionTitle: "Abholung in Castalla",
      collectionText: "Bestellungen werden per WhatsApp bestätigt und können abgeholt werden bei",
      localTitle: "Lokale Lieferung",
      localText: "Lieferung ist möglich, wenn Route und Zeit passen.",
      paymentTitle: "Zahlung nach Bestätigung",
      paymentText:
        "In Version 1 gibt es keinen Stripe Checkout. Nach der WhatsApp-Bestellung sendet Nancy's Castalla Bizum-Daten, Bankdaten oder bestätigt Barzahlung bei Abholung oder Lieferung.",
    },
    about: {
      eyebrow: "Über Nancy's Castalla",
      title: "Ein warmer Markt für Expat-Favoriten",
      p1:
        "Nancy's Castalla startet als professionelles, aber einfaches internationales Food-Konzept für Expats rund um Castalla: praktische Lebensmittel, bekannte Snacks, Kaffee, Brot auf Vorbestellung und flexible Abholung oder Lieferung.",
      p2:
        "Der Sommerfokus liegt auf britischen, niederländischen, irischen und europäischen Favoriten. Südamerikanische Produkte sind als spätere Erweiterung geplant.",
      p3:
        "Die Website ist für einen Start mit kleinem Lager gebaut: kein Checkout, keine Datenbank und keine komplizierten Konten. Kunden wählen Produkte, senden WhatsApp und erhalten vor der Zahlung eine Bestätigung.",
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Bestellungen und Fragen per WhatsApp",
      address: "Adresse",
      send: "WhatsApp senden",
      note: "Abholzeiten werden pro Bestellung während der Vorbestellphase bestätigt.",
    },
    order: {
      title: "Ihre Bestellanfrage",
      empty: "Wählen Sie Produkte und Mengen für Ihre Bestellanfrage.",
      estimatedTotal: "Geschätzte Summe",
      deliveryNote: "Mindestbestellung für lokale Lieferung ist",
      after:
        "Nach Eingang der Bestellung bestätigt Nancy's Castalla die Verfügbarkeit und sendet Zahlungsanweisungen für Bizum, Überweisung oder Barzahlung.",
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
        "Un concepto cálido de mercado con stock pequeño, favoritos holandeses, británicos, irlandeses, europeos y sudamericanos, pan por encargo y entrega local cuando sea posible.",
      shop: "Ver productos iniciales",
      bread: "Prepedir pan",
      cardTitle: "Productos internacionales, café, pan y bebidas",
      cardText: "Premium, cálido y práctico para expatriados británicos, holandeses, irlandeses, europeos y sudamericanos cerca de Castalla.",
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
        "Una primera gama enfocada para una pequeña tienda expat: snacks holandeses, favoritos británicos e irlandeses, productos sudamericanos de despensa, pan por encargo, desayuno, café, bebidas y salsas.",
    },
    bread: {
      eyebrow: "Pan por encargo",
      title: "Pan y bollería",
      intro:
        "El pan está disponible por prepedido cuando se alcanza una demanda mínima. Primero se recoge el interés por WhatsApp y después Nancy's Castalla confirma disponibilidad, momentos de entrega y pago.",
      how: "Cómo funciona:",
      howText: "elige pan, envía el pedido por WhatsApp y espera confirmación antes de pagar.",
    },
    delivery: {
      eyebrow: "Recogida y entrega",
      title: "Simple y flexible",
      collectionTitle: "Recogida en Castalla",
      collectionText: "Los pedidos se confirman por WhatsApp y se pueden recoger en",
      localTitle: "Entrega local",
      localText: "La entrega es posible cuando la ruta y el horario lo permiten.",
      paymentTitle: "Pago tras confirmación",
      paymentText:
        "En la versión 1 no hay Stripe checkout. Tras recibir el pedido por WhatsApp, Nancy's Castalla envía datos de Bizum, transferencia bancaria o confirma pago en efectivo al recoger o recibir.",
    },
    about: {
      eyebrow: "Sobre Nancy's Castalla",
      title: "Un mercado cálido para favoritos expat",
      p1:
        "Nancy's Castalla empieza como un concepto internacional profesional pero sencillo para expatriados cerca de Castalla: productos prácticos, snacks familiares, café, pan por encargo y recogida o entrega flexible.",
      p2:
        "El primer enfoque combina favoritos británicos, holandeses, irlandeses y europeos con una selección sudamericana en crecimiento. La gama sudamericana empieza limitada y crecerá según la demanda.",
      p3:
        "La web está hecha para empezar con stock pequeño: sin checkout, sin base de datos y sin cuentas complicadas. Los clientes eligen productos, envían WhatsApp y reciben confirmación antes de pagar.",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Pedidos y preguntas por WhatsApp",
      address: "Dirección",
      send: "Enviar WhatsApp",
      note: "Los horarios de recogida se confirman por pedido durante la fase de prepedido.",
    },
    order: {
      title: "Tu solicitud de pedido",
      empty: "Elige productos y cantidades para preparar tu solicitud de pedido.",
      estimatedTotal: "Total estimado",
      deliveryNote: "El mínimo para entrega local es",
      after:
        "Tras recibir el pedido, Nancy's Castalla confirma disponibilidad y envía instrucciones para Bizum, transferencia o pago en efectivo.",
    },
  },
  sv: {
    nav: {
      home: "Hem",
      products: "Produkter",
      bread: "Bröd",
      delivery: "Hämtning och leverans",
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
      headline: "Internationella livsmedel, kaffe och förbeställningar för nordiska utlandsboende runt Castalla.",
      intro:
        "Ett varmt marknadskoncept med litet lager, europeiska och sydamerikanska favoriter, bröd på förbeställning och lokal leverans när det är möjligt.",
      shop: "Se startprodukterna",
      bread: "Förbeställ bröd",
      cardTitle: "Internationella livsmedel, kaffe, bröd och drycker",
      cardText: "Premium, varmt och praktiskt för nordiska, europeiska och sydamerikanska utlandsboende runt Castalla.",
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
      eyebrow: "Brod pa forbestallning",
      title: "Brod & bageri",
      intro:
        "Brod kan forbestallas nar minsta efterfragan har uppnatts. Nancy's Castalla bekraftar tillganglighet, leveranstillfallen och betalningsinformation innan betalning.",
      how: "Sa fungerar det:",
      howText: "valj brod, skicka din bestallning och vanta pa bekraftelse innan betalning.",
    },
    delivery: {
      eyebrow: "Collection & delivery",
      title: "Simple, flexible fulfilment",
      collectionTitle: "Collection in Castalla",
      collectionText: "Orders are confirmed by WhatsApp and can be collected at",
      localTitle: "Local delivery",
      localText: "Delivery is possible when routes and timing allow.",
      paymentTitle: "Payment after confirmation",
      paymentText:
        "No Stripe checkout is active in version 1. After receiving the WhatsApp order, Nancy's Castalla sends Bizum details, bank transfer details or confirms cash payment on collection or delivery.",
    },
    about: {
      eyebrow: "About Nancy's Castalla",
      title: "A warm market for expat favourites",
      p1:
        "Nancy's Castalla is starting as a professional but simple international food concept for expats around Castalla: practical groceries, familiar snacks, coffee, bread by pre-order and flexible collection or delivery.",
      p2:
        "The first focus combines British, Dutch, Irish and wider European favourites with a growing South American selection. The South American range starts limited and expands once demand is clear.",
      p3:
        "The site is built for a small-stock launch: no checkout, no database and no complicated account system. Customers choose products, send a WhatsApp message and receive confirmation before payment.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Order and questions by WhatsApp",
      address: "Address",
      send: "Send WhatsApp",
      note: "Collection times are confirmed per order during the starting soon / pre-order phase.",
    },
    order: {
      title: "Your order request",
      empty: "Choose products and quantities to prepare your order request.",
      estimatedTotal: "Estimated total",
      deliveryNote: "Local delivery minimum is",
      after:
        "After receiving the order, Nancy's Castalla confirms availability and sends Bizum, bank transfer or cash payment instructions.",
    },
  },
} as const;
