import type { Locale } from "@/i18n/config";
import type { Product, ProductCategory } from "@/types/product";
import { getProductCategories } from "@/lib/product-categories";

const translationSoon: Record<Locale, string> = {
  en: "Translation coming soon.",
  nl: "Vertaling volgt binnenkort.",
  de: "Übersetzung folgt in Kürze.",
  es: "Traducción próximamente.",
  sv: "Översättning kommer snart.",
};

const categoryFallbacks: Record<ProductCategory, Record<Locale, string>> = {
  "Dutch products": {
    en: "Dutch product available by pre-order.",
    nl: "Nederlands product beschikbaar als voorbestelling.",
    de: "Niederländisches Produkt auf Vorbestellung verfügbar.",
    es: "Producto neerlandés disponible por prepedido.",
    sv: "Nederländsk produkt tillgänglig som förbeställning.",
  },
  "British & Irish products": {
    en: "British or Irish product available by pre-order.",
    nl: "Brits of Iers product beschikbaar als voorbestelling.",
    de: "Britisches oder irisches Produkt auf Vorbestellung verfügbar.",
    es: "Producto británico o irlandés disponible por prepedido.",
    sv: "Brittisk eller irländsk produkt tillgänglig som förbeställning.",
  },
  "German products": {
    en: "German product available by pre-order.",
    nl: "Duits product beschikbaar als voorbestelling.",
    de: "Deutsches Produkt auf Vorbestellung verfügbar.",
    es: "Producto alemán disponible por prepedido.",
    sv: "Tysk produkt tillgänglig som förbeställning.",
  },
  "Scandinavian products": {
    en: "Scandinavian product available by pre-order.",
    nl: "Scandinavisch product beschikbaar als voorbestelling.",
    de: "Skandinavisches Produkt auf Vorbestellung verfügbar.",
    es: "Producto escandinavo disponible por prepedido.",
    sv: "Skandinavisk produkt tillgänglig som förbeställning.",
  },
  "Asian & Indonesian products": {
    en: "Asian or Indonesian product available by pre-order.",
    nl: "Aziatisch of Indonesisch product beschikbaar als voorbestelling.",
    de: "Asiatisches oder indonesisches Produkt auf Vorbestellung verfügbar.",
    es: "Producto asiático o indonesio disponible por prepedido.",
    sv: "Asiatisk eller indonesisk produkt tillgänglig som förbeställning.",
  },
  "South American products": {
    en: "South American product available by pre-order.",
    nl: "Zuid-Amerikaans product beschikbaar als voorbestelling.",
    de: "Südamerikanisches Produkt auf Vorbestellung verfügbar.",
    es: "Producto sudamericano disponible por prepedido.",
    sv: "Sydamerikansk produkt tillgänglig som förbeställning.",
  },
  "Vegan & vegetarian": {
    en: "Vegan or vegetarian product available by pre-order.",
    nl: "Vegan of vegetarisch product beschikbaar als voorbestelling.",
    de: "Veganes oder vegetarisches Produkt auf Vorbestellung verfügbar.",
    es: "Producto vegano o vegetariano disponible por prepedido.",
    sv: "Vegansk eller vegetarisk produkt tillgänglig som förbeställning.",
  },
  "Frozen snacks": {
    en: "Frozen snack available by pre-order.",
    nl: "Diepvriessnack beschikbaar als voorbestelling.",
    de: "Tiefkühl-Snack auf Vorbestellung verfügbar.",
    es: "Aperitivo congelado disponible por prepedido.",
    sv: "Fryst snack tillgängligt som förbeställning.",
  },
  "Bread & bakery": {
    en: "Fresh bakery product available by pre-order.",
    nl: "Vers bakkerijproduct beschikbaar als voorbestelling.",
    de: "Frisches Backwarenprodukt auf Vorbestellung verfügbar.",
    es: "Producto de panadería disponible por prepedido.",
    sv: "Färsk bageriprodukt tillgänglig som förbeställning.",
  },
  "Breakfast products": {
    en: "Breakfast product available by pre-order.",
    nl: "Ontbijtproduct beschikbaar als voorbestelling.",
    de: "Frühstücksprodukt auf Vorbestellung verfügbar.",
    es: "Producto de desayuno disponible por prepedido.",
    sv: "Frukostprodukt tillgänglig som förbeställning.",
  },
  "Coffee & drinks": {
    en: "Drink or pantry product available by pre-order.",
    nl: "Drank of voorraadkastproduct beschikbaar als voorbestelling.",
    de: "Getränk oder Vorratsprodukt auf Vorbestellung verfügbar.",
    es: "Bebida o producto de despensa disponible por prepedido.",
    sv: "Dryck eller skafferiprodukt tillgänglig som förbeställning.",
  },
  "Sauces & condiments": {
    en: "Sauce or condiment available by pre-order.",
    nl: "Saus of smaakmaker beschikbaar als voorbestelling.",
    de: "Sauce oder Würzmittel auf Vorbestellung verfügbar.",
    es: "Salsa o condimento disponible por prepedido.",
    sv: "Sås eller tillbehör tillgängligt som förbeställning.",
  },
  "Non-food & packaging": {
    en: "Accessory or packaging item available by pre-order.",
    nl: "Accessoire of verpakkingsartikel beschikbaar als voorbestelling.",
    de: "Zubehör oder Verpackungsartikel auf Vorbestellung verfügbar.",
    es: "Accesorio o envase disponible por prepedido.",
    sv: "Tillbehör eller förpackning tillgänglig som förbeställning.",
  },
};

const knownDescriptions: Record<string, Record<Locale, string>> = {
  frikandel: {
    en: "Dutch fricandel, ideal as a snack or with chips. Available by pre-order.",
    nl: "Nederlandse frikandel, ideaal als snack of bij friet. Beschikbaar als voorbestelling.",
    de: "Niederländische Frikandel, ideal als Snack oder zu Pommes. Auf Vorbestellung verfügbar.",
    es: "Fricandel neerlandesa, ideal como snack o con patatas fritas. Disponible por prepedido.",
    sv: "Nederländsk frikandel, perfekt som snack eller med pommes. Tillgänglig som förbeställning.",
  },
  "dutch fricandel": {
    en: "Dutch fricandel, ideal as a snack or with chips. Available by pre-order.",
    nl: "Nederlandse frikandel, ideaal als snack of bij friet. Beschikbaar als voorbestelling.",
    de: "Niederländische Frikandel, ideal als Snack oder zu Pommes. Auf Vorbestellung verfügbar.",
    es: "Fricandel neerlandesa, ideal como snack o con patatas fritas. Disponible por prepedido.",
    sv: "Nederländsk frikandel, perfekt som snack eller med pommes. Tillgänglig som förbeställning.",
  },
  shoarmarollen: {
    en: "Crispy shawarma rolls with a savoury filling. Available by pre-order.",
    nl: "Krokante shoarmarollen met hartige vulling. Beschikbaar als voorbestelling.",
    de: "Knusprige Shawarma-Rollen mit herzhafter Füllung. Auf Vorbestellung verfügbar.",
    es: "Rollitos crujientes de shawarma con relleno sabroso. Disponibles por prepedido.",
    sv: "Krispiga shawarmarullar med smakrik fyllning. Tillgängliga som förbeställning.",
  },
  "potato scones": {
    en: "Scottish-style potato scones for breakfast or brunch. Available by pre-order.",
    nl: "Schotse aardappelscones voor ontbijt of brunch. Beschikbaar als voorbestelling.",
    de: "Schottische Kartoffel-Scones für Frühstück oder Brunch. Auf Vorbestellung verfügbar.",
    es: "Scones de patata estilo escocés para desayuno o brunch. Disponibles por prepedido.",
    sv: "Skotska potatisscones till frukost eller brunch. Tillgängliga som förbeställning.",
  },
  "chicken satay in peanut sauce": {
    en: "Chicken satay skewers with peanut sauce. Available by pre-order.",
    nl: "Kip saté stokjes met pindasaus. Beschikbaar als voorbestelling.",
    de: "Hähnchen-Satay-Spieße mit Erdnusssauce. Auf Vorbestellung verfügbar.",
    es: "Brochetas de pollo satay con salsa de cacahuete. Disponibles por prepedido.",
    sv: "Kycklingsatay med jordnötssås. Tillgänglig som förbeställning.",
  },
};

const descriptionAliases: Record<string, string> = {
  fricandel: "frikandel",
  "frikandel klassiek": "frikandel",
  "sate ajam": "chicken satay in peanut sauce",
  "chicken satay": "chicken satay in peanut sauce",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function knownDescriptionKey(name: string) {
  const normalized = normalize(name);
  if (knownDescriptions[normalized]) return normalized;
  const alias = Object.entries(descriptionAliases).find(([needle]) => normalized.includes(normalize(needle)));
  return alias?.[1];
}

function isImportedPlaceholder(text: string) {
  return /^(imported|dutch bakery product).+hidden until selected for sale\.$/i.test(text);
}

export function getPublicProductDescription(product: Product, locale: Locale = "en") {
  const key = knownDescriptionKey(product.name);
  const known = key ? knownDescriptions[key]?.[locale] : undefined;
  if (known) return known;

  const text = product.description?.trim() ?? "";
  if (text && !isImportedPlaceholder(text)) {
    return locale === "en" ? text : translationSoon[locale];
  }

  const categories = getProductCategories(product);
  const fallbackCategory = categories[0] ?? product.category;
  return categoryFallbacks[fallbackCategory]?.[locale] ?? translationSoon[locale];
}

export function getPublicProductDetailText(text: string | undefined, locale: Locale) {
  const value = text?.trim() ?? "";
  if (!value) return "";
  return locale === "en" ? value : translationSoon[locale];
}
