import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const locales = ["en", "nl", "de", "es", "sv"];
const sourceFiles = [
  "src/i18n/config.ts",
  "src/i18n/ui.ts",
  "src/i18n/cart.ts",
  "src/i18n/auth.ts",
  "src/i18n/legal.ts",
];

function loadTsModule(relativePath) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;

  const commonJsModule = { exports: {} };
  const sandbox = {
    exports: commonJsModule.exports,
    module: commonJsModule,
    require(request) {
      if (request.startsWith("@/types/") || request.startsWith("@/lib/")) {
        return {};
      }
      throw new Error(`Unexpected runtime import in ${relativePath}: ${request}`);
    },
  };
  vm.runInNewContext(output, sandbox, { filename });
  return commonJsModule.exports;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function collectKeyPaths(value, prefix = "") {
  if (!isPlainObject(value)) return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return isPlainObject(child) ? [next, ...collectKeyPaths(child, next)] : [next];
  });
}

function collectEmptyStrings(value, prefix = "") {
  if (typeof value === "string") return value.trim() ? [] : [prefix || "(root)"];
  if (Array.isArray(value)) return value.flatMap((item, index) => collectEmptyStrings(item, `${prefix}[${index}]`));
  if (isPlainObject(value)) {
    return Object.entries(value).flatMap(([key, child]) => collectEmptyStrings(child, prefix ? `${prefix}.${key}` : key));
  }
  return [];
}

function compareShape(name, getter) {
  const english = getter("en");
  const expected = new Set(collectKeyPaths(english));
  const errors = [];

  for (const locale of locales) {
    const value = getter(locale);
    const actual = new Set(collectKeyPaths(value));
    const missing = [...expected].filter((key) => !actual.has(key));
    const extra = [...actual].filter((key) => !expected.has(key));
    const empty = collectEmptyStrings(value);
    if (missing.length) errors.push(`${name}.${locale} missing keys: ${missing.join(", ")}`);
    if (extra.length) errors.push(`${name}.${locale} extra keys: ${extra.join(", ")}`);
    if (empty.length) errors.push(`${name}.${locale} empty strings: ${empty.join(", ")}`);
  }

  return errors;
}

const config = loadTsModule("src/i18n/config.ts");
const ui = loadTsModule("src/i18n/ui.ts");
const cart = loadTsModule("src/i18n/cart.ts");
const auth = loadTsModule("src/i18n/auth.ts");
const legal = loadTsModule("src/i18n/legal.ts");

const errors = [];
for (const locale of locales) {
  if (!config.isLocale(locale)) errors.push(`Invalid locale in configured list: ${locale}`);
}

errors.push(...compareShape("config.dictionaries", (locale) => config.dictionaries[locale]));
errors.push(...compareShape("ui", (locale) => ui.getUiCopy(locale)));
errors.push(...compareShape("cart", (locale) => cart.getCartCopy(locale)));
errors.push(...compareShape("auth", (locale) => auth.getAuthCopy(locale)));
errors.push(...compareShape("legal", (locale) => legal.getLegalCopy(locale)));

const suspicious = [];
for (const relativePath of sourceFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (/[�]|Ã|Â/.test(source)) suspicious.push(relativePath);
}
if (suspicious.length) {
  errors.push(`Potential mojibake in i18n source files: ${suspicious.join(", ")}`);
}

if (errors.length) {
  console.error("i18n validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("i18n validation passed.");
