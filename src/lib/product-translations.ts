import { isLocale, type Locale } from "@/i18n/config";

type ProductNameTranslation = Record<Locale, string>;

const translations: Record<string, ProductNameTranslation> = {
  "chicken satay in peanut sauce": {
    en: "Chicken Satay in Peanut Sauce",
    nl: "Kip Saté in Pindasaus",
    es: "Brochetas de Pollo con Salsa de Cacahuete",
    de: "Hähnchen-Satay mit Erdnusssauce",
    sv: "Kycklingsatay med jordnötssås",
  },
  "dutch fricandel": {
    en: "Dutch Fricandel",
    nl: "Frikandel",
    es: "Fricandel Holandesa",
    de: "Niederländische Frikandel",
    sv: "Nederländsk frikandel",
  },
  frikandel: {
    en: "Dutch Fricandel",
    nl: "Frikandel",
    es: "Fricandel Holandesa",
    de: "Niederländische Frikandel",
    sv: "Nederländsk frikandel",
  },
  shoarmarollen: {
    en: "Shawarma Rolls",
    nl: "Shoarmarollen",
    es: "Rollitos de Shawarma",
    de: "Shawarma-Rollen",
    sv: "Shawarmarullar",
  },
  "back bacon": {
    en: "Back Bacon",
    nl: "Britse Back Bacon",
    es: "Bacon Británico",
    de: "Britischer Back Bacon",
    sv: "Brittiskt back bacon",
  },
  "puff pastry block raw": {
    en: "Puff Pastry Block RAW",
    nl: "Bladerdeegblok RAW",
    es: "Bloque de Hojaldre RAW",
    de: "Blätterteigblock RAW",
    sv: "Smördegsblock RAW",
  },
  "potato scones": {
    en: "Potato Scones",
    nl: "Aardappelscones",
    es: "Scones de Patata",
    de: "Kartoffel-Scones",
    sv: "Potatisscones",
  },
  "hash brown lw": {
    en: "Hash Brown LW",
    nl: "Hash Browns LW",
    es: "Hash Browns LW",
    de: "Hash Browns LW",
    sv: "Hash Browns LW",
  },
  "irn bru drink": {
    en: "IRN BRU Drink",
    nl: "IRN BRU frisdrank",
    es: "Bebida IRN BRU",
    de: "IRN BRU Getränk",
    sv: "IRN BRU dryck",
  },
  "toastie medium white bread": {
    en: "Toastie Medium White Bread",
    nl: "Medium wit toastbrood",
    es: "Pan Blanco Mediano para Tostadas",
    de: "Mittleres weißes Toastbrot",
    sv: "Mellanstort vitt toastbröd",
  },
  "mexicano chiliburger": {
    en: "Mexicano Chiliburger",
    nl: "Mexicano Chiliburger",
    es: "Hamburguesa Mexicano Chili",
    de: "Mexicano Chiliburger",
    sv: "Mexicano chiliburgare",
  },
  "gehaktstaaf pikant": {
    en: "Spicy Minced Meat Stick",
    nl: "Gehaktstaaf Pikant",
    es: "Barra de Carne Picada Picante",
    de: "Pikanter Hackfleischstab",
    sv: "Kryddig färsstav",
  },
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function translateProductName(name: string, locale?: string) {
  const safeLocale = isLocale(locale) ? locale : "en";
  return translations[normalize(name)]?.[safeLocale] ?? name;
}
