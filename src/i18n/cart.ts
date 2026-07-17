import type { Locale } from "./config";

export type CartCopy = {
  title: string; cart: string; add: string; added: string; goToCart: string; empty: string; continueShopping: string;
  checkout: string; quantity: string; remove: string; removeUnavailable: string; subtotal: string; vat: string; total: string;
  preorderNote: string; comingSoon: string; unavailable: string; insufficientStock: string; packageUnavailable: string;
  priceBasisReview: string;
  validating: string; validationError: string; checkoutIntro: string; collection: string; delivery: string;
  name: string; email: string; phone: string; address: string; notes: string; paymentMethod: string; send: string; sending: string;
  orderError: string; orderSent: string; emailUnavailable: string; badgeLabel: string;
  missingFields: string; serviceUnavailable: string; invalidOrder: string; deliveryAddressRequired: string;
};

const copies: Record<Locale, CartCopy> = {
  en: {
    title: "Shopping cart", cart: "Cart", add: "Add to cart", added: "Added to cart", goToCart: "View cart", empty: "Your cart is empty.", continueShopping: "Continue shopping",
    checkout: "Checkout", quantity: "Quantity", remove: "Remove", removeUnavailable: "Remove unavailable products", subtotal: "Subtotal excl. VAT", vat: "VAT", total: "Total",
    preorderNote: "Pre-order: orderable even when current stock is zero.", comingSoon: "Coming soon and not yet orderable.", unavailable: "This product is no longer available.",
    insufficientStock: "Not enough stock for this quantity.", packageUnavailable: "This package is no longer available.", priceBasisReview: "This product is temporarily unavailable while package and price are checked.",
    validating: "Checking current prices and availability...", validationError: "The cart could not be checked. Please try again.", checkoutIntro: "Send your order request. We will confirm availability and payment instructions.",
    collection: "Collection", delivery: "Local delivery", name: "Name", email: "Email for confirmation", phone: "Phone / WhatsApp", address: "Delivery address", notes: "Notes or preferred time",
    paymentMethod: "Preferred payment method", send: "Send order request", sending: "Sending...", orderError: "The order could not be sent.", orderSent: "Your order request has been received.",
    emailUnavailable: "Email confirmation is temporarily unavailable.", badgeLabel: "items in cart", missingFields: "Please enter your name, email and at least one product.",
    serviceUnavailable: "Ordering is temporarily unavailable. Please contact us by WhatsApp.", invalidOrder: "Please check your cart and details before sending again.",
    deliveryAddressRequired: "Please enter a delivery address for local delivery.",
  },
  nl: {
    title: "Winkelmand", cart: "Winkelmand", add: "In winkelmand", added: "Toegevoegd aan winkelmand", goToCart: "Bekijk winkelmand", empty: "Je winkelmand is leeg.", continueShopping: "Verder winkelen",
    checkout: "Afrekenen", quantity: "Aantal", remove: "Verwijderen", removeUnavailable: "Niet-beschikbare producten verwijderen", subtotal: "Subtotaal excl. btw", vat: "Btw", total: "Totaal",
    preorderNote: "Voorbestelling: ook bestelbaar wanneer de huidige voorraad nul is.", comingSoon: "Binnenkort beschikbaar en nog niet bestelbaar.", unavailable: "Dit product is niet meer beschikbaar.",
    insufficientStock: "Onvoldoende voorraad voor dit aantal.", packageUnavailable: "Deze verpakking is niet meer beschikbaar.", priceBasisReview: "Dit product is tijdelijk niet beschikbaar terwijl verpakking en prijs worden gecontroleerd.",
    validating: "Actuele prijzen en beschikbaarheid controleren...", validationError: "De winkelmand kon niet worden gecontroleerd. Probeer het opnieuw.", checkoutIntro: "Verstuur je bestelaanvraag. Wij bevestigen beschikbaarheid en betaalinstructies.",
    collection: "Afhalen", delivery: "Lokale bezorging", name: "Naam", email: "E-mail voor bevestiging", phone: "Telefoon / WhatsApp", address: "Bezorgadres", notes: "Opmerkingen of gewenst tijdstip",
    paymentMethod: "Gewenste betaalmethode", send: "Bestelaanvraag versturen", sending: "Versturen...", orderError: "De bestelling kon niet worden verzonden.", orderSent: "Je bestelaanvraag is ontvangen.",
    emailUnavailable: "E-mailbevestiging is tijdelijk niet beschikbaar.", badgeLabel: "producten in winkelmand", missingFields: "Vul je naam, e-mail en minimaal één product in.",
    serviceUnavailable: "Bestellen is tijdelijk niet beschikbaar. Neem contact op via WhatsApp.", invalidOrder: "Controleer je winkelmand en gegevens voordat je opnieuw verstuurt.",
    deliveryAddressRequired: "Vul een bezorgadres in voor lokale bezorging.",
  },
  de: {
    title: "Warenkorb", cart: "Warenkorb", add: "In den Warenkorb", added: "Zum Warenkorb hinzugefügt", goToCart: "Warenkorb ansehen", empty: "Ihr Warenkorb ist leer.", continueShopping: "Weiter einkaufen",
    checkout: "Bestellanfrage", quantity: "Menge", remove: "Entfernen", removeUnavailable: "Nicht verfügbare Produkte entfernen", subtotal: "Zwischensumme ohne MwSt.", vat: "MwSt.", total: "Gesamt",
    preorderNote: "Vorbestellung: auch bei aktuellem Bestand null bestellbar.", comingSoon: "Demnächst verfügbar und noch nicht bestellbar.", unavailable: "Dieses Produkt ist nicht mehr verfügbar.",
    insufficientStock: "Nicht genügend Bestand für diese Menge.", packageUnavailable: "Diese Packung ist nicht mehr verfügbar.", priceBasisReview: "Dieses Produkt ist vorübergehend nicht verfügbar, während Packung und Preis geprüft werden.",
    validating: "Aktuelle Preise und Verfügbarkeit werden geprüft...", validationError: "Der Warenkorb konnte nicht geprüft werden. Bitte erneut versuchen.", checkoutIntro: "Senden Sie Ihre Bestellanfrage. Wir bestätigen Verfügbarkeit und Zahlungsinformationen.",
    collection: "Abholung", delivery: "Lokale Lieferung", name: "Name", email: "E-Mail für Bestätigung", phone: "Telefon / WhatsApp", address: "Lieferadresse", notes: "Anmerkungen oder gewünschte Zeit",
    paymentMethod: "Gewünschte Zahlungsart", send: "Bestellanfrage senden", sending: "Wird gesendet...", orderError: "Die Bestellung konnte nicht gesendet werden.", orderSent: "Ihre Bestellanfrage ist eingegangen.",
    emailUnavailable: "Die E-Mail-Bestätigung ist vorübergehend nicht verfügbar.", badgeLabel: "Artikel im Warenkorb", missingFields: "Bitte geben Sie Name, E-Mail und mindestens ein Produkt ein.",
    serviceUnavailable: "Bestellungen sind vorübergehend nicht verfügbar. Bitte kontaktieren Sie uns per WhatsApp.", invalidOrder: "Bitte prüfen Sie Warenkorb und Angaben, bevor Sie erneut senden.",
    deliveryAddressRequired: "Bitte geben Sie eine Lieferadresse für die lokale Lieferung ein.",
  },
  es: {
    title: "Carrito", cart: "Carrito", add: "Añadir al carrito", added: "Añadido al carrito", goToCart: "Ver carrito", empty: "Tu carrito está vacío.", continueShopping: "Seguir comprando",
    checkout: "Finalizar solicitud", quantity: "Cantidad", remove: "Eliminar", removeUnavailable: "Eliminar productos no disponibles", subtotal: "Subtotal sin IVA", vat: "IVA", total: "Total",
    preorderNote: "Prepedido: se puede pedir aunque el stock actual sea cero.", comingSoon: "Próximamente y todavía no disponible para pedido.", unavailable: "Este producto ya no está disponible.",
    insufficientStock: "No hay suficiente stock para esta cantidad.", packageUnavailable: "Este formato ya no está disponible.", priceBasisReview: "Este producto no está disponible temporalmente mientras se revisan el formato y el precio.",
    validating: "Comprobando precios y disponibilidad actuales...", validationError: "No se pudo comprobar el carrito. Inténtalo de nuevo.", checkoutIntro: "Envía tu solicitud. Confirmaremos disponibilidad e instrucciones de pago.",
    collection: "Recogida", delivery: "Entrega local", name: "Nombre", email: "Correo para confirmación", phone: "Teléfono / WhatsApp", address: "Dirección de entrega", notes: "Notas u horario preferido",
    paymentMethod: "Método de pago preferido", send: "Enviar solicitud de pedido", sending: "Enviando...", orderError: "No se pudo enviar el pedido.", orderSent: "Hemos recibido tu solicitud de pedido.",
    emailUnavailable: "La confirmación por correo no está disponible temporalmente.", badgeLabel: "productos en el carrito", missingFields: "Introduce tu nombre, correo y al menos un producto.",
    serviceUnavailable: "Los pedidos no están disponibles temporalmente. Contacta con nosotros por WhatsApp.", invalidOrder: "Revisa el carrito y tus datos antes de volver a enviar.",
    deliveryAddressRequired: "Introduce una dirección para la entrega local.",
  },
  sv: {
    title: "Varukorg", cart: "Varukorg", add: "Lägg i varukorgen", added: "Tillagd i varukorgen", goToCart: "Visa varukorg", empty: "Din varukorg är tom.", continueShopping: "Fortsätt handla",
    checkout: "Skicka beställning", quantity: "Antal", remove: "Ta bort", removeUnavailable: "Ta bort otillgängliga produkter", subtotal: "Delsumma exkl. moms", vat: "Moms", total: "Totalt",
    preorderNote: "Förbeställning: kan beställas även när aktuellt lager är noll.", comingSoon: "Kommer snart och kan ännu inte beställas.", unavailable: "Produkten är inte längre tillgänglig.",
    insufficientStock: "Otillräckligt lager för detta antal.", packageUnavailable: "Förpackningen är inte längre tillgänglig.", priceBasisReview: "Produkten är tillfälligt otillgänglig medan förpackning och pris kontrolleras.",
    validating: "Kontrollerar aktuella priser och tillgänglighet...", validationError: "Varukorgen kunde inte kontrolleras. Försök igen.", checkoutIntro: "Skicka din beställningsförfrågan. Vi bekräftar tillgänglighet och betalningsinformation.",
    collection: "Hämtning", delivery: "Lokal leverans", name: "Namn", email: "E-post för bekräftelse", phone: "Telefon / WhatsApp", address: "Leveransadress", notes: "Anteckningar eller önskad tid",
    paymentMethod: "Önskad betalningsmetod", send: "Skicka beställningsförfrågan", sending: "Skickar...", orderError: "Beställningen kunde inte skickas.", orderSent: "Din beställningsförfrågan har mottagits.",
    emailUnavailable: "E-postbekräftelse är tillfälligt otillgänglig.", badgeLabel: "varor i varukorgen", missingFields: "Fyll i namn, e-post och minst en produkt.",
    serviceUnavailable: "Beställning är tillfälligt otillgänglig. Kontakta oss via WhatsApp.", invalidOrder: "Kontrollera varukorgen och uppgifterna innan du skickar igen.",
    deliveryAddressRequired: "Ange en leveransadress för lokal leverans.",
  },
};

export function getCartCopy(locale: Locale) { return copies[locale]; }
