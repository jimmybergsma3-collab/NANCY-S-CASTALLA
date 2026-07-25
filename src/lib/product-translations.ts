import { isLocale, type Locale } from "@/i18n/config";

type ProductNameTranslation = Record<Locale, string>;

const translations: Record<string, ProductNameTranslation> = {
  "strongbow cider": {
    en: "Strongbow Cider",
    nl: "Strongbow Cider",
    es: "Sidra Strongbow",
    de: "Strongbow Cider",
    sv: "Strongbow cider",
  },
  "magners cider": {
    en: "Magners Cider",
    nl: "Magners Cider",
    es: "Sidra Magners",
    de: "Magners Cider",
    sv: "Magners cider",
  },
  "magners cider dark fruit": {
    en: "Magners Dark Fruit Cider",
    nl: "Magners Dark Fruit Cider",
    es: "Sidra Magners Dark Fruit",
    de: "Magners Dark Fruit Cider",
    sv: "Magners Dark Fruit cider",
  },
  "guinness beer": {
    en: "Guinness Beer",
    nl: "Guinness bier",
    es: "Cerveza Guinness",
    de: "Guinness Bier",
    sv: "Guinness öl",
  },
  "guinness draught can": {
    en: "Guinness Draught Can",
    nl: "Guinness Draught blik",
    es: "Lata Guinness Draught",
    de: "Guinness Draught Dose",
    sv: "Guinness Draught burk",
  },
  "john smith beer": {
    en: "John Smith's Beer",
    nl: "John Smith's bier",
    es: "Cerveza John Smith's",
    de: "John Smith's Bier",
    sv: "John Smith's öl",
  },
  "tennents beer bottle": {
    en: "Tennent's Beer Bottle",
    nl: "Tennent's bier fles",
    es: "Cerveza Tennent's botella",
    de: "Tennent's Bier Flasche",
    sv: "Tennent's öl flaska",
  },
  "tennents beer can": {
    en: "Tennent's Beer Can",
    nl: "Tennent's bier blik",
    es: "Cerveza Tennent's lata",
    de: "Tennent's Bier Dose",
    sv: "Tennent's öl burk",
  },
  "stella artois beer": {
    en: "Stella Artois Beer",
    nl: "Stella Artois bier",
    es: "Cerveza Stella Artois",
    de: "Stella Artois Bier",
    sv: "Stella Artois öl",
  },
  "corona extra beer": {
    en: "Corona Extra Beer",
    nl: "Corona Extra bier",
    es: "Cerveza Corona Extra",
    de: "Corona Extra Bier",
    sv: "Corona Extra öl",
  },
  "peroni nastro azzurro beer": {
    en: "Peroni Nastro Azzurro Beer",
    nl: "Peroni Nastro Azzurro bier",
    es: "Cerveza Peroni Nastro Azzurro",
    de: "Peroni Nastro Azzurro Bier",
    sv: "Peroni Nastro Azzurro öl",
  },
  "jupiler beer crate": {
    en: "Jupiler Beer + Crate",
    nl: "Jupiler bier + krat",
    es: "Cerveza Jupiler + caja",
    de: "Jupiler Bier + Kiste",
    sv: "Jupiler öl + back",
  },
  "kopparberg strawberry lime": {
    en: "Kopparberg Strawberry & Lime",
    nl: "Kopparberg aardbei & limoen",
    es: "Kopparberg fresa y lima",
    de: "Kopparberg Erdbeere & Limette",
    sv: "Kopparberg jordgubb & lime",
  },
  "kopparberg mixed fruit": {
    en: "Kopparberg Mixed Fruit",
    nl: "Kopparberg gemengd fruit",
    es: "Kopparberg frutas mixtas",
    de: "Kopparberg Mixed Fruit",
    sv: "Kopparberg mixed fruit",
  },
  "kopparberg tropical": {
    en: "Kopparberg Tropical",
    nl: "Kopparberg Tropical",
    es: "Kopparberg Tropical",
    de: "Kopparberg Tropical",
    sv: "Kopparberg Tropical",
  },
  "kopparberg wildberries": {
    en: "Kopparberg Wildberries",
    nl: "Kopparberg wildberries",
    es: "Kopparberg frutos del bosque",
    de: "Kopparberg Wildberries",
    sv: "Kopparberg wildberries",
  },
  "rekorderlig strawberry lime": {
    en: "Rekorderlig Strawberry Lime",
    nl: "Rekorderlig aardbei limoen",
    es: "Rekorderlig fresa lima",
    de: "Rekorderlig Erdbeere Limette",
    sv: "Rekorderlig jordgubb lime",
  },
  "rekorderlig wildberries": {
    en: "Rekorderlig Wildberries",
    nl: "Rekorderlig wildberries",
    es: "Rekorderlig frutos del bosque",
    de: "Rekorderlig Wildberries",
    sv: "Rekorderlig wildberries",
  },
  "chicken satay in peanut sauce": {
    en: "Chicken Satay in Peanut Sauce",
    nl: "Kip Saté in Pindasaus",
    es: "Brochetas de Pollo con Salsa de Cacahuete",
    de: "Hähnchen-Satay mit Erdnusssauce",
    sv: "Kycklingsatay med jordnötssås",
  },
  "sate ajam": {
    en: "Chicken Satay in Peanut Sauce",
    nl: "Kip Saté in Pindasaus",
    es: "Brochetas de Pollo con Salsa de Cacahuete",
    de: "Hähnchen-Satay mit Erdnusssauce",
    sv: "Kycklingsatay med jordnötssås",
  },
  frikandel: {
    en: "Dutch Fricandel",
    nl: "Frikandel",
    es: "Fricandel Holandesa",
    de: "Niederländische Frikandel",
    sv: "Nederländsk frikandel",
  },
  "dutch fricandel": {
    en: "Dutch Fricandel",
    nl: "Frikandel",
    es: "Fricandel Holandesa",
    de: "Niederländische Frikandel",
    sv: "Nederländsk frikandel",
  },
  "frikandel klassiek": {
    en: "Classic Dutch Fricandel",
    nl: "Frikandel Klassiek",
    es: "Fricandel Holandesa Clásica",
    de: "Klassische niederländische Frikandel",
    sv: "Klassisk nederländsk frikandel",
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
  "smoked back bacon": {
    en: "Smoked Back Bacon",
    nl: "Gerookte Britse Back Bacon",
    es: "Bacon Británico Ahumado",
    de: "Geräucherter britischer Back Bacon",
    sv: "Rökt brittiskt back bacon",
  },
  "baked beans": {
    en: "Baked Beans",
    nl: "Witte Bonen in Tomatensaus",
    es: "Alubias en Salsa de Tomate",
    de: "Baked Beans in Tomatensauce",
    sv: "Vita bönor i tomatsås",
  },
  "hp sauce": {
    en: "HP Brown Sauce",
    nl: "HP Brown Sauce",
    es: "Salsa HP Brown Sauce",
    de: "HP Brown Sauce",
    sv: "HP Brown Sauce",
  },
  "bisto gravy": {
    en: "Bisto Gravy Granules",
    nl: "Bisto Juskorrels",
    es: "Granulado para Salsa Bisto",
    de: "Bisto Bratensaucen-Granulat",
    sv: "Bisto såsgranulat",
  },
  "potato scones": {
    en: "Potato Scones",
    nl: "Aardappelscones",
    es: "Scones de Patata",
    de: "Kartoffel-Scones",
    sv: "Potatisscones",
  },
  "hash brown": {
    en: "Hash Browns",
    nl: "Hash Browns",
    es: "Hash Browns",
    de: "Hash Browns",
    sv: "Hash Browns",
  },
  "hash brown lw": {
    en: "Hash Brown LW",
    nl: "Hash Browns LW",
    es: "Hash Browns LW",
    de: "Hash Browns LW",
    sv: "Hash Browns LW",
  },
  "puff pastry block raw": {
    en: "Puff Pastry Block RAW",
    nl: "Bladerdeegblok RAW",
    es: "Bloque de Hojaldre RAW",
    de: "Blätterteigblock RAW",
    sv: "Smördegsblock RAW",
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
  bitterballen: {
    en: "Bitterballen",
    nl: "Bitterballen",
    es: "Bitterballen Holandesas",
    de: "Bitterballen",
    sv: "Bitterballen",
  },
  kroket: {
    en: "Dutch Croquette",
    nl: "Kroket",
    es: "Croqueta Holandesa",
    de: "Niederländische Kroket",
    sv: "Nederländsk kroket",
  },
  kaassouffle: {
    en: "Dutch Cheese Soufflé",
    nl: "Kaassoufflé",
    es: "Soufflé de Queso Holandés",
    de: "Niederländisches Käse-Soufflé",
    sv: "Nederländsk ostsoufflé",
  },
  kaastengels: {
    en: "Cheese Sticks",
    nl: "Kaastengels",
    es: "Palitos de Queso",
    de: "Käsestangen",
    sv: "Oststänger",
  },
  "onion rings": {
    en: "Onion Rings",
    nl: "Uienringen",
    es: "Aros de Cebolla",
    de: "Zwiebelringe",
    sv: "Lökringar",
  },
  "chili cheese nuggets": {
    en: "Chili Cheese Nuggets",
    nl: "Chili Cheese Nuggets",
    es: "Nuggets de Queso y Chili",
    de: "Chili-Cheese-Nuggets",
    sv: "Chili cheese nuggets",
  },
  "mozzarella sticks": {
    en: "Mozzarella Sticks",
    nl: "Mozzarella Sticks",
    es: "Palitos de Mozzarella",
    de: "Mozzarella-Sticks",
    sv: "Mozzarellastavar",
  },
  "jalapeno cheddar peppers": {
    en: "Jalapeño Cheddar Peppers",
    nl: "Jalapeño Cheddar Peppers",
    es: "Jalapeños con Cheddar",
    de: "Jalapeño-Cheddar-Poppers",
    sv: "Jalapeño cheddar-poppers",
  },
};

const containsRules: Array<{ needles: string[]; translationKey: string }> = [
  { needles: ["strongbow"], translationKey: "strongbow cider" },
  { needles: ["magners cider dark fruit"], translationKey: "magners cider dark fruit" },
  { needles: ["magners"], translationKey: "magners cider" },
  { needles: ["guinness can", "guinness draught"], translationKey: "guinness draught can" },
  { needles: ["guinness bier", "guinness beer"], translationKey: "guinness beer" },
  { needles: ["john smith"], translationKey: "john smith beer" },
  { needles: ["tennents bier fles", "tennents beer bottle"], translationKey: "tennents beer bottle" },
  { needles: ["tennents bier blik", "tennents beer can"], translationKey: "tennents beer can" },
  { needles: ["stella artois"], translationKey: "stella artois beer" },
  { needles: ["corona extra"], translationKey: "corona extra beer" },
  { needles: ["peroni nastro azzurro"], translationKey: "peroni nastro azzurro beer" },
  { needles: ["jupiler"], translationKey: "jupiler beer crate" },
  { needles: ["kopparberg aardbei", "kopparberg strawberry"], translationKey: "kopparberg strawberry lime" },
  { needles: ["kopparberg gemengd", "kopparberg mixed"], translationKey: "kopparberg mixed fruit" },
  { needles: ["kopparberg tropical"], translationKey: "kopparberg tropical" },
  { needles: ["kopparberg wild"], translationKey: "kopparberg wildberries" },
  { needles: ["rekorderlig aardbei", "rekorderlig strawberry"], translationKey: "rekorderlig strawberry lime" },
  { needles: ["rekorderlig wild", "rekorderlig wildberries", "rekorderlig wilde"], translationKey: "rekorderlig wildberries" },
  { needles: ["chicken satay", "sate ajam", "satay in peanut"], translationKey: "chicken satay in peanut sauce" },
  { needles: ["frikandel klassiek"], translationKey: "frikandel klassiek" },
  { needles: ["dutch fricandel", "fricandel", "frikandel"], translationKey: "frikandel" },
  { needles: ["shoarmarollen", "shoarma rollen"], translationKey: "shoarmarollen" },
  { needles: ["gerookt engelse spek", "smoked back bacon"], translationKey: "smoked back bacon" },
  { needles: ["back bacon", "engelse a grade", "ierse back bacon"], translationKey: "back bacon" },
  { needles: ["witte bonen in tomatensaus", "baked beans"], translationKey: "baked beans" },
  { needles: ["hp engelse brown sauce", "hp sauce", "brown sauce"], translationKey: "hp sauce" },
  { needles: ["bisto gravy", "gravy korrels"], translationKey: "bisto gravy" },
  { needles: ["hash brown", "rosti hash brown"], translationKey: "hash brown" },
  { needles: ["potato scone"], translationKey: "potato scones" },
  { needles: ["bitterballen"], translationKey: "bitterballen" },
  { needles: ["vleeskroket", "kroketten", "kroket"], translationKey: "kroket" },
  { needles: ["kaassouffle", "kaassoufle"], translationKey: "kaassouffle" },
  { needles: ["kaastengels"], translationKey: "kaastengels" },
  { needles: ["onion ring", "uienringen"], translationKey: "onion rings" },
  { needles: ["chili cheese nugget"], translationKey: "chili cheese nuggets" },
  { needles: ["mozzarella finger", "mozzarella stick"], translationKey: "mozzarella sticks" },
  { needles: ["jalapeno cheddar"], translationKey: "jalapeno cheddar peppers" },
  { needles: ["puff pastry block"], translationKey: "puff pastry block raw" },
  { needles: ["irn bru"], translationKey: "irn bru drink" },
  { needles: ["toastie medium white bread"], translationKey: "toastie medium white bread" },
  { needles: ["mexicano chiliburger"], translationKey: "mexicano chiliburger" },
  { needles: ["gehaktstaaf pikant"], translationKey: "gehaktstaaf pikant" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(classic|klassiek|raw|lw|smoked|unsmoked|pack|case|box|doos|tray|frozen)\b/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
}

function findTranslationKey(name: string) {
  const normalized = normalize(name);
  if (translations[normalized]) return normalized;

  const rule = containsRules.find((candidate) => candidate.needles.some((needle) => normalized.includes(normalize(needle))));
  return rule?.translationKey;
}

export function translateProductName(name: string, locale?: string) {
  const safeLocale = isLocale(locale) ? locale : "en";
  const key = findTranslationKey(name);
  return key ? translations[key][safeLocale] : name;
}
