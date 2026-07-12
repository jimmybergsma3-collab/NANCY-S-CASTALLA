import * as XLSX from "xlsx";
import { createRequire } from "node:module";
import type { SupplierImportKind, SupplierImportParseResult, SupplierImportProduct, SupplierImportWarning } from "@/types/imports";

const require = createRequire(import.meta.url);

const storageWords = new Set(["diepvries", "droog", "vers"]);
const priceTokenPattern = /^\d{1,5}(?:,\d{2})?$/;
const supplierCodePattern = /^[A-Z]?\d[A-Z0-9]{2,7}$/;

function logParserStep(diagnosticId: string | undefined, step: string, details?: Record<string, unknown>) {
  if (!diagnosticId) return;
  console.info("[supplier-import-parser]", JSON.stringify({ diagnosticId, step, ...details }));
}

function logParserError(diagnosticId: string | undefined, step: string, error: unknown, details?: Record<string, unknown>) {
  if (!diagnosticId) return;
  console.error("[supplier-import-parser]", JSON.stringify({
    diagnosticId,
    step,
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : "UnknownError",
    stack: error instanceof Error ? error.stack?.split("\n").slice(0, 6).join("\n") : undefined,
    ...details,
  }));
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCode(value: unknown) {
  const raw = String(value ?? "").trim();
  return raw.endsWith(".0") ? raw.slice(0, -2) : raw;
}

function normalizeEan(value: unknown) {
  const raw = normalizeCode(value).replace(/\D/g, "");
  return raw.length >= 6 ? raw : "";
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value * 10000) / 10000;
  const normalized = String(value).replace("EUR", "").replace("€", "").trim().replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? Math.round(number * 10000) / 10000 : undefined;
}

function compactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function looksLikePackageToken(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.startsWith("(")
    || normalized.includes("kg")
    || normalized.includes("gr")
    || normalized.includes("ltr")
    || normalized.includes("lt")
    || normalized.includes("cm")
    || normalized.includes("ml")
    || /^x?\d/.test(normalized)
  );
}

function parseEuropFoodsLine(line: string, currentSection: string) {
  const parts = line.split(" ").filter(Boolean);
  const storageIndex = parts.findIndex((part) => storageWords.has(part.toLowerCase()) || part === "-");
  if (storageIndex < 0) return undefined;

  const candidateIndexes = parts
    .map((part, index) => ({ part, index }))
    .filter(({ part }) => supplierCodePattern.test(part) && !part.includes(",") && !part.includes("."));
  if (!candidateIndexes.length) return undefined;

  const codeIndex =
    candidateIndexes.find(({ index }) => index < storageIndex)?.index
    ?? [...candidateIndexes].reverse().find(({ index }) => index > storageIndex)?.index
    ?? candidateIndexes[0].index;
  const supplierCode = normalizeCode(parts[codeIndex]);
  const storageType = parts[storageIndex].toLowerCase();
  let supplierProductName = "";
  let packageDescription = "";
  let casePrice: number | undefined;
  let unitPrice: number | undefined;

  if (codeIndex < storageIndex) {
    unitPrice = parseNumber(parts[0]);
    const priceAfterPackageIndex = parts.findIndex((part, index) => index > codeIndex && index < storageIndex && priceTokenPattern.test(part));
    if (priceAfterPackageIndex < 0) return undefined;
    casePrice = parseNumber(parts[priceAfterPackageIndex]);
    packageDescription = parts.slice(codeIndex + 1, priceAfterPackageIndex).join(" ");
    supplierProductName = parts.slice(priceAfterPackageIndex + 1, storageIndex).join(" ");
  } else {
    casePrice = parseNumber(parts[0]);
    unitPrice = parseNumber(parts[parts.length - 1]);
    const packageParts: string[] = [];
    let cursor = storageIndex + 1;
    while (cursor < codeIndex && looksLikePackageToken(parts[cursor])) {
      packageParts.push(parts[cursor]);
      cursor += 1;
    }
    packageDescription = packageParts.join(" ");
    supplierProductName = parts.slice(cursor, codeIndex).join(" ");
  }

  if (!supplierCode || !supplierProductName) return undefined;
  return {
    supplier: "Europ Foods",
    supplierCode,
    ean: "",
    supplierProductName,
    brand: "",
    categorySource: currentSection,
    storageType,
    packageDescription,
    casePrice,
    unitPrice,
    priceExVat: unitPrice ?? casePrice,
    sourceRow: line,
  };
}

function createProduct(input: Omit<SupplierImportProduct, "currency" | "needsTaxReview" | "needsCategoryReview" | "needsPackageReview" | "needsImageReview" | "needsTranslationReview">): SupplierImportProduct {
  return {
    ...input,
    currency: "EUR",
    needsTaxReview: true,
    needsCategoryReview: true,
    needsPackageReview: !input.packageDescription,
    needsImageReview: true,
    needsTranslationReview: true,
  };
}

export async function parseEuropFoodsPdf(buffer: Buffer, sourceFilename: string, importBatch: string, diagnosticId?: string): Promise<SupplierImportParseResult> {
  logParserStep(diagnosticId, "europ_pdf_import_start", { sourceFilename, importBatch, bytes: buffer.length });
  const { PDFParse } = require("pdf-parse") as {
    PDFParse: {
      new (input: { data: Buffer }): { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> };
    };
  };
  logParserStep(diagnosticId, "europ_pdf_module_loaded");
  const parser = new PDFParse({ data: buffer });
  logParserStep(diagnosticId, "europ_pdf_parser_created");
  let parsed: { text: string };
  try {
    parsed = await parser.getText();
    logParserStep(diagnosticId, "europ_pdf_text_extracted", { textLength: parsed.text.length });
  } catch (error) {
    logParserError(diagnosticId, "europ_pdf_text_extract_failed", error);
    throw error;
  } finally {
    try {
      await parser.destroy();
      logParserStep(diagnosticId, "europ_pdf_parser_destroyed");
    } catch (error) {
      logParserError(diagnosticId, "europ_pdf_parser_destroy_failed", error);
    }
  }
  const lines = parsed.text.split(/\r?\n/).map(normalizeSpace).filter(Boolean);
  logParserStep(diagnosticId, "europ_pdf_lines_ready", { lines: lines.length, firstLine: lines[0], lastLine: lines.at(-1) });
  const products: SupplierImportProduct[] = [];
  const warnings: SupplierImportWarning[] = [];
  const errors: SupplierImportWarning[] = [];
  const sectionHeadings: string[] = [];
  let currentSection = "";

  for (const line of lines) {
    if (line.startsWith("PAG ")) {
      currentSection = line;
      sectionHeadings.push(line);
      continue;
    }
    if (line.startsWith("Artikel Omschrijving")) continue;

    const parsedLine = parseEuropFoodsLine(line, currentSection);
    if (!parsedLine) {
      if (/\d/.test(line) && !line.includes("EUROP FOODS") && !line.includes("VILLAJOYOSA") && !line.includes("de Mei") && !line.includes("--")) {
        warnings.push({ sourceRow: line, reason: "Product line could not be parsed with confidence.", severity: "warning" });
      }
      continue;
    }

    if (!parsedLine.storageType) {
      warnings.push({ sourceRow: line, reason: "Storage type could not be detected.", severity: "warning" });
    }
    if (!parsedLine.packageDescription) {
      warnings.push({ sourceRow: line, reason: "Package description could not be detected.", severity: "warning" });
    }

    products.push(createProduct({
      ...parsedLine,
      sourceFilename,
      sourceBatch: importBatch,
    }));
  }

  const result: SupplierImportParseResult = {
    supplier: "Europ Foods",
    sourceFilename,
    fileType: "pdf",
    importBatch,
    sourceRowCount: lines.length,
    sectionHeadings: Array.from(new Set(sectionHeadings)),
    products,
    warnings,
    errors,
  };
  logParserStep(diagnosticId, "europ_pdf_parse_complete", {
    products: products.length,
    sections: result.sectionHeadings.length,
    warnings: warnings.length,
    errors: errors.length,
  });
  return result;
}

export async function parseTindaleWorkbook(buffer: Buffer, sourceFilename: string, importBatch: string, diagnosticId?: string): Promise<SupplierImportParseResult> {
  logParserStep(diagnosticId, "tindale_workbook_import_start", { sourceFilename, importBatch, bytes: buffer.length });
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  logParserStep(diagnosticId, "tindale_workbook_loaded", { sheetName, sheetCount: workbook.SheetNames.length });
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Array<string | number | undefined>>(sheet, { header: 1, defval: "" });
  logParserStep(diagnosticId, "tindale_rows_ready", { rows: rows.length });
  const products: SupplierImportProduct[] = [];
  const sectionHeadings: string[] = [];
  const warnings: SupplierImportWarning[] = [];
  const errors: SupplierImportWarning[] = [];
  let currentSection = "";

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row.some((value) => String(value ?? "").trim())) continue;

    const [ref, ean, description, brand, kgPerUnit, unitsPerCase, unitPrice] = row;
    const onlyFirstCell = String(ref ?? "").trim() && row.slice(1).every((value) => !String(value ?? "").trim());
    if (onlyFirstCell) {
      currentSection = String(ref).trim();
      sectionHeadings.push(currentSection);
      continue;
    }

    const supplierCode = normalizeCode(ref);
    const supplierProductName = normalizeSpace(String(description ?? ""));
    const parsedUnitPrice = parseNumber(unitPrice);

    if (!supplierCode || !supplierProductName || parsedUnitPrice === undefined) {
      errors.push({
        sourceRow: `Excel row ${index + 1}: ${row.map((value) => String(value ?? "").trim()).join(" | ")}`,
        reason: "Missing supplier code, product name or unit price.",
        severity: "error",
      });
      continue;
    }

    const parsedUnitsPerCase = parseNumber(unitsPerCase);
    const parsedKgPerUnit = parseNumber(kgPerUnit);
    const packageDescription = [
      parsedUnitsPerCase ? `${compactNumber(parsedUnitsPerCase)} per case` : "",
      parsedKgPerUnit ? `${compactNumber(parsedKgPerUnit)} kg/unit` : "",
    ].filter(Boolean).join(" / ");

    products.push(createProduct({
      supplier: "Tindale",
      supplierCode,
      ean: normalizeEan(ean),
      supplierProductName,
      brand: normalizeSpace(String(brand ?? "")),
      categorySource: currentSection,
      storageType: currentSection.toLowerCase(),
      packageDescription,
      unitsPerCase: parsedUnitsPerCase,
      unitWeightOrVolume: parsedKgPerUnit,
      unitPrice: parsedUnitPrice,
      priceExVat: parsedUnitPrice,
      sourceFilename,
      sourceRow: `Excel row ${index + 1}`,
      sourceBatch: importBatch,
    }));
  }

  const result: SupplierImportParseResult = {
    supplier: "Tindale",
    sourceFilename,
    fileType: sourceFilename.toLowerCase().endsWith(".xlsx") ? "xlsx" : "xls",
    importBatch,
    sourceRowCount: rows.filter((row) => row.some((value) => String(value ?? "").trim())).length,
    sectionHeadings: Array.from(new Set(sectionHeadings)),
    products,
    warnings,
    errors,
  };
  logParserStep(diagnosticId, "tindale_parse_complete", {
    products: products.length,
    sections: result.sectionHeadings.length,
    warnings: warnings.length,
    errors: errors.length,
  });
  return result;
}

export async function parseSupplierFile(kind: SupplierImportKind, buffer: Buffer, sourceFilename: string, importBatch: string, diagnosticId?: string) {
  if (kind === "europfoods") return parseEuropFoodsPdf(buffer, sourceFilename, importBatch, diagnosticId);
  return parseTindaleWorkbook(buffer, sourceFilename, importBatch, diagnosticId);
}

export function supplierKindFromValue(value: string): SupplierImportKind | undefined {
  if (value === "europfoods" || value === "tindale") return value;
  return undefined;
}

export function defaultImportBatch(kind: SupplierImportKind) {
  return kind === "europfoods" ? "IMPORT_2026_LIVE_EUROPFOODS_JULY" : "IMPORT_2026_LIVE_TINDALE_JULY";
}
