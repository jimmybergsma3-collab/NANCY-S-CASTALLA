import type { Locale } from "@/i18n/config";
import type { Product, ProductCategory } from "@/types/product";
import { getProductCategories } from "@/lib/product-categories";

const translationSoon: Record<Locale, string> = {
  en: "Translation coming soon.",
  nl: "Vertaling volgt binnenkort.",
  de: "Uebersetzung folgt in Kuerze.",
  es: "Traduccion proximamente.",
  sv: "Oversattning kommer snart.",
};

const categoryFallbacks: Record<ProductCategory, Record<Locale, string>> = {
  "Dutch products": {
    en: "Dutch product available by pre-order.",
    nl: "Nederlands product beschikbaar als voorbestelling.",
    de: "Niederlaendisches Produkt auf Vorbestellung verfuegbar.",
    es: "Producto neerlandes disponible por prepedido.",
    sv: "Nederlaendsk produkt tillgaenglig som forbestallning.",
  },
  "British & Irish products": {
    en: "British or Irish product available by pre-order.",
    nl: "Brits of Iers product beschikbaar als voorbestelling.",
    de: "Britisches oder irisches Produkt auf Vorbestellung verfuegbar.",
    es: "Producto britanico o irlandes disponible por prepedido.",
    sv: "Brittisk eller irlaendsk produkt tillgaenglig som forbestallning.",
  },
  "German products": {
    en: "German product available by pre-order.",
    nl: "Duits product beschikbaar als voorbestelling.",
    de: "Deutsches Produkt auf Vorbestellung verfuegbar.",
    es: "Producto aleman disponible por prepedido.",
    sv: "Tysk produkt tillgaenglig som forbestallning.",
  },
  "Scandinavian products": {
    en: "Scandinavian product available by pre-order.",
    nl: "Scandinavisch product beschikbaar als voorbestelling.",
    de: "Skandinavisches Produkt auf Vorbestellung verfuegbar.",
    es: "Producto escandinavo disponible por prepedido.",
    sv: "Skandinavisk produkt tillgaenglig som forbestallning.",
  },
  "Asian & Indonesian products": {
    en: "Asian or Indonesian product available by pre-order.",
    nl: "Aziatisch of Indonesisch product beschikbaar als voorbestelling.",
    de: "Asiatisches oder indonesisches Produkt auf Vorbestellung verfuegbar.",
    es: "Producto asiatico o indonesio disponible por prepedido.",
    sv: "Asiatisk eller indonesisk produkt tillgaenglig som forbestallning.",
  },
  "South American products": {
    en: "South American product available by pre-order.",
    nl: "Zuid-Amerikaans product beschikbaar als voorbestelling.",
    de: "Suedamerikanisches Produkt auf Vorbestellung verfuegbar.",
    es: "Producto sudamericano disponible por prepedido.",
    sv: "Sydamerikansk produkt tillgaenglig som forbestallning.",
  },
  "Vegan & vegetarian": {
    en: "Vegan or vegetarian product available by pre-order.",
    nl: "Vegan of vegetarisch product beschikbaar als voorbestelling.",
    de: "Veganes oder vegetarisches Produkt auf Vorbestellung verfuegbar.",
    es: "Producto vegano o vegetariano disponible por prepedido.",
    sv: "Vegansk eller vegetarisk produkt tillgaenglig som forbestallning.",
  },
  "Frozen snacks": {
    en: "Frozen snack available by pre-order.",
    nl: "Diepvriessnack beschikbaar als voorbestelling.",
    de: "Tiefkuehl-Snack auf Vorbestellung verfuegbar.",
    es: "Aperitivo congelado disponible por prepedido.",
    sv: "Fryst snack tillgaengligt som forbestallning.",
  },
  "Bread & bakery": {
    en: "Fresh bakery product available by pre-order.",
    nl: "Vers bakkerijproduct beschikbaar als voorbestelling.",
    de: "Frisches Backwarenprodukt auf Vorbestellung verfuegbar.",
    es: "Producto de panaderia disponible por prepedido.",
    sv: "Faersk bageriprodukt tillgaenglig som forbestallning.",
  },
  "Breakfast products": {
    en: "Breakfast product available by pre-order.",
    nl: "Ontbijtproduct beschikbaar als voorbestelling.",
    de: "Fruehstuecksprodukt auf Vorbestellung verfuegbar.",
    es: "Producto de desayuno disponible por prepedido.",
    sv: "Frukostprodukt tillgaenglig som forbestallning.",
  },
  "Coffee & drinks": {
    en: "Drink or pantry product available by pre-order.",
    nl: "Drank of voorraadkastproduct beschikbaar als voorbestelling.",
    de: "Getraenk oder Vorratsprodukt auf Vorbestellung verfuegbar.",
    es: "Bebida o producto de despensa disponible por prepedido.",
    sv: "Dryck eller skafferiprodukt tillgaenglig som forbestallning.",
  },
  "Sauces & condiments": {
    en: "Sauce or condiment available by pre-order.",
    nl: "Saus of smaakmaker beschikbaar als voorbestelling.",
    de: "Sauce oder Wuerzmittel auf Vorbestellung verfuegbar.",
    es: "Salsa o condimento disponible por prepedido.",
    sv: "Sas eller tillbehor tillgaengligt som forbestallning.",
  },
  "Non-food & packaging": {
    en: "Accessory or packaging item available by pre-order.",
    nl: "Accessoire of verpakkingsartikel beschikbaar als voorbestelling.",
    de: "Zubehoer oder Verpackungsartikel auf Vorbestellung verfuegbar.",
    es: "Accesorio o envase disponible por prepedido.",
    sv: "Tillbehor eller forpackning tillgaenglig som forbestallning.",
  },
};

const knownDescriptions: Record<string, Record<Locale, string>> = {
  frikandel: {
    en: "Dutch fricandel, ideal as a snack or with chips. Available by pre-order.",
    nl: "Nederlandse frikandel, ideaal als snack of bij friet. Beschikbaar als voorbestelling.",
    de: "Niederlaendische Frikandel, ideal als Snack oder zu Pommes. Auf Vorbestellung verfuegbar.",
    es: "Fricandel neerlandesa, ideal como snack o con patatas fritas. Disponible por prepedido.",
    sv: "Nederlaendsk frikandel, perfekt som snack eller med pommes. Tillgaenglig som forbestallning.",
  },
  "dutch fricandel": {
    en: "Dutch fricandel, ideal as a snack or with chips. Available by pre-order.",
    nl: "Nederlandse frikandel, ideaal als snack of bij friet. Beschikbaar als voorbestelling.",
    de: "Niederlaendische Frikandel, ideal als Snack oder zu Pommes. Auf Vorbestellung verfuegbar.",
    es: "Fricandel neerlandesa, ideal como snack o con patatas fritas. Disponible por prepedido.",
    sv: "Nederlaendsk frikandel, perfekt som snack eller med pommes. Tillgaenglig som forbestallning.",
  },
  shoarmarollen: {
    en: "Crispy shawarma rolls with a savoury filling. Available by pre-order.",
    nl: "Krokante shoarmarollen met hartige vulling. Beschikbaar als voorbestelling.",
    de: "Knusprige Shawarma-Rollen mit herzhafter Fuellung. Auf Vorbestellung verfuegbar.",
    es: "Rollitos crujientes de shawarma con relleno sabroso. Disponibles por prepedido.",
    sv: "Krispiga shawarmarullar med matig fyllning. Tillgaengliga som forbestallning.",
  },
  "potato scones": {
    en: "Scottish-style potato scones for breakfast or brunch. Available by pre-order.",
    nl: "Schotse aardappelscones voor ontbijt of brunch. Beschikbaar als voorbestelling.",
    de: "Schottische Kartoffel-Scones fuer Fruehstueck oder Brunch. Auf Vorbestellung verfuegbar.",
    es: "Scones de patata estilo escoces para desayuno o brunch. Disponibles por prepedido.",
    sv: "Skotska potatisscones till frukost eller brunch. Tillgaengliga som forbestallning.",
  },
  "chicken satay in peanut sauce": {
    en: "Chicken satay skewers with peanut sauce. Available by pre-order.",
    nl: "Kip sate stokjes met pindasaus. Beschikbaar als voorbestelling.",
    de: "Haehnchen-Satay-Spiesse mit Erdnusssauce. Auf Vorbestellung verfuegbar.",
    es: "Brochetas de pollo satay con salsa de cacahuete. Disponibles por prepedido.",
    sv: "Kycklingsatay med jordnotssas. Tillgaenglig som forbestallning.",
  },
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isImportedPlaceholder(text: string) {
  return /^(imported|dutch bakery product).+hidden until selected for sale\.$/i.test(text);
}

export function getPublicProductDescription(product: Product, locale: Locale = "en") {
  const key = normalize(product.name);
  const known = knownDescriptions[key]?.[locale];
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
