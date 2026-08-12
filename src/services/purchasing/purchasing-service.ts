import crypto from "crypto";
import { createRequire } from "module";
import { env, hasSupabaseAdmin } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";
import { logAdminAction } from "@/services/admin/audit-service";

const require = createRequire(import.meta.url);

export type SupplierRow = {
  id: string;
  code: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  active?: boolean | null;
};

export type SupplierOfferRow = {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_code: string | null;
  supplier_product_name: string | null;
  ean: string | null;
  brand: string | null;
  category_source: string | null;
  storage_type: string | null;
  package_description: string | null;
  units_per_case: number | null;
  case_price: number | null;
  unit_price: number | null;
  price_ex_vat: number | null;
  currency: string | null;
  source_batch: string | null;
  active: boolean | null;
  updated_at: string;
};

export type PurchaseOrderRow = {
  id: string;
  purchase_number: number | string | null;
  supplier_id: string | null;
  status: string;
  total_ex_vat: number | null;
  total_vat: number | null;
  total_incl_vat: number | null;
  expected_at?: string | null;
  expected_delivery_date?: string | null;
  created_at: string;
  notes?: string | null;
};

export type PurchaseOrderItemRow = {
  id: string;
  purchase_order_id: string;
  product_id: string;
  supplier_product_offer_id: string | null;
  supplier_code: string | null;
  product_name: string;
  package_description: string | null;
  units_per_case: number;
  ordered_cases: number;
  ordered_units: number;
  unit_cost_ex_vat: number;
  line_total_ex_vat: number;
  vat_rate: number | null;
  line_vat: number;
  line_total_incl_vat: number;
  received_units: number;
};

export type SupplierInvoiceRow = {
  id: string;
  supplier_id: string;
  purchase_order_id: string | null;
  supplier_invoice_number: string | null;
  invoice_date: string | null;
  status: string;
  total_ex_vat: number | null;
  vat_total: number | null;
  total_incl_vat: number | null;
  file_path: string | null;
  needs_review: boolean | null;
  review_reason: string | null;
  created_at: string;
};

export type GoodsReceiptRow = {
  id: string;
  purchase_order_id: string;
  supplier_invoice_id: string | null;
  status: string;
  received_at: string | null;
  processed_at: string | null;
  created_at: string;
  notes: string | null;
};

export type GoodsReceiptItemRow = {
  id: string;
  goods_receipt_id: string;
  purchase_order_item_id: string;
  product_id: string;
  received_cases: number;
  received_units: number;
  total_received_units: number;
  unit_cost_ex_vat: number | null;
};

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
};

type PurchasePriceHistoryRow = {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_product_offer_id: string | null;
  purchase_order_id: string | null;
  supplier_invoice_id: string | null;
  unit_cost_ex_vat: number;
  currency: string;
  source: string;
  recorded_at: string;
};

export type PurchasingOverview = {
  schemaReady: boolean;
  diagnostics: string[];
  suppliers: SupplierRow[];
  offers: SupplierOfferRow[];
  products: ProductRow[];
  purchaseOrders: PurchaseOrderRow[];
  purchaseOrderItems: PurchaseOrderItemRow[];
  supplierInvoices: SupplierInvoiceRow[];
  goodsReceipts: GoodsReceiptRow[];
  goodsReceiptItems: GoodsReceiptItemRow[];
  priceHistory: PurchasePriceHistoryRow[];
};

type CreatePurchaseOrderInput = {
  supplierId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  vatRate?: number | null;
  items?: Array<{ offerId: string; orderedCases: number; orderedUnits?: number }>;
};

type CreateGoodsReceiptInput = {
  purchaseOrderId: string;
  supplierInvoiceId?: string;
  notes?: string;
  items?: Array<{ purchaseOrderItemId: string; receivedCases: number; receivedUnits?: number }>;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function numberOrZero(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requireAdminEnvironment() {
  if (!hasSupabaseAdmin()) throw new Error("Supabase admin environment variables are required for purchasing.");
}

function requireActor(actor?: string) {
  const trimmed = cleanText(actor || env.adminEmail || "admin");
  if (trimmed.length < 3) throw new Error("A valid admin actor is required.");
  return trimmed;
}

function normalizeIds(values: string[]) {
  return values.map((value) => value.replace(/[^a-zA-Z0-9-]/g, "")).filter(Boolean);
}

function isAllowedVatRate(value: number | null | undefined) {
  return value == null || [0, 4, 10, 21].includes(Number(value));
}

async function safeFetch<T>(path: string, fallback: T, diagnostics: string[]) {
  try {
    return await supabaseAdminFetch<T>(path);
  } catch (error) {
    diagnostics.push(`${path}: ${error instanceof Error ? error.message : "Unknown Supabase error"}`);
    return fallback;
  }
}

function offerCaseCost(offer: SupplierOfferRow) {
  const unitsPerCase = Math.max(1, Math.floor(numberOrZero(offer.units_per_case) || 1));
  const casePrice = numberOrZero(offer.case_price);
  const priceExVat = numberOrZero(offer.price_ex_vat);
  const unitPrice = numberOrZero(offer.unit_price);
  const unitCost = priceExVat > 0 ? priceExVat : unitPrice > 0 ? unitPrice : casePrice > 0 ? casePrice / unitsPerCase : 0;
  const totalCaseCost = casePrice > 0 ? casePrice : roundMoney(unitCost * unitsPerCase);
  return { unitsPerCase, unitCost: roundMoney(unitCost), caseCost: roundMoney(totalCaseCost) };
}

export async function getPurchasingOverview(): Promise<PurchasingOverview> {
  requireAdminEnvironment();
  const diagnostics: string[] = [];
  const suppliers = await safeFetch<SupplierRow[]>("suppliers?select=id,code,name,email,phone,active&order=name.asc&limit=500", [], diagnostics);
  const offers = await safeFetch<SupplierOfferRow[]>(
    "supplier_product_offers?select=id,product_id,supplier_id,supplier_code,supplier_product_name,ean,brand,category_source,storage_type,package_description,units_per_case,case_price,unit_price,price_ex_vat,currency,source_batch,active,updated_at&active=eq.true&order=updated_at.desc&limit=500",
    [],
    diagnostics,
  );
  const productIds = normalizeIds(offers.map((offer) => offer.product_id));
  const products = productIds.length
    ? await safeFetch<ProductRow[]>(`products?select=id,name,sku&id=in.(${productIds.join(",")})&limit=500`, [], diagnostics)
    : [];
  const purchaseOrders = await safeFetch<PurchaseOrderRow[]>(
    "purchase_orders?select=id,purchase_number,supplier_id,status,total_ex_vat,total_vat,total_incl_vat,expected_at,expected_delivery_date,created_at,notes&order=created_at.desc&limit=120",
    [],
    diagnostics,
  );
  const purchaseOrderIds = normalizeIds(purchaseOrders.map((order) => order.id));
  const purchaseOrderItems = purchaseOrderIds.length
    ? await safeFetch<PurchaseOrderItemRow[]>(`purchase_order_items?select=*&purchase_order_id=in.(${purchaseOrderIds.join(",")})&order=created_at.desc&limit=1000`, [], diagnostics)
    : [];
  const supplierInvoices = await safeFetch<SupplierInvoiceRow[]>("supplier_invoices?select=*&order=created_at.desc&limit=120", [], diagnostics);
  const goodsReceipts = await safeFetch<GoodsReceiptRow[]>("goods_receipts?select=*&order=created_at.desc&limit=120", [], diagnostics);
  const receiptIds = normalizeIds(goodsReceipts.map((receipt) => receipt.id));
  const goodsReceiptItems = receiptIds.length
    ? await safeFetch<GoodsReceiptItemRow[]>(`goods_receipt_items?select=*&goods_receipt_id=in.(${receiptIds.join(",")})&order=created_at.desc&limit=1000`, [], diagnostics)
    : [];
  const priceHistory = await safeFetch<PurchasePriceHistoryRow[]>("purchase_price_history?select=*&order=recorded_at.desc&limit=100", [], diagnostics);
  return {
    schemaReady: !diagnostics.some((item) => /purchase_order_items|supplier_invoices|goods_receipts|purchase_price_history/.test(item)),
    diagnostics,
    suppliers,
    offers,
    products,
    purchaseOrders,
    purchaseOrderItems,
    supplierInvoices,
    goodsReceipts,
    goodsReceiptItems,
    priceHistory,
  };
}

export async function createPurchaseOrderForAdmin(input: CreatePurchaseOrderInput, actorInput?: string) {
  requireAdminEnvironment();
  const actor = requireActor(actorInput);
  const supplierId = cleanText(input.supplierId);
  const requestedItems = input.items ?? [];
  if (!supplierId) throw new Error("Supplier is required.");
  if (requestedItems.length === 0) throw new Error("At least one supplier offer is required.");
  const vatRate = input.vatRate == null ? null : Number(input.vatRate);
  if (!isAllowedVatRate(vatRate)) throw new Error("Unsupported IVA rate.");
  const offerIds = normalizeIds(requestedItems.map((item) => cleanText(item.offerId)));
  if (offerIds.length !== requestedItems.length) throw new Error("Invalid supplier offer selection.");
  const offers = await supabaseAdminFetch<SupplierOfferRow[]>(
    `supplier_product_offers?select=*&id=in.(${offerIds.join(",")})&supplier_id=eq.${supplierId}&active=eq.true`,
  );
  if (offers.length !== offerIds.length) throw new Error("One or more supplier offers could not be found for this supplier.");
  const byId = new Map(offers.map((offer) => [offer.id, offer]));
  const lines = requestedItems.map((item) => {
    const offer = byId.get(cleanText(item.offerId));
    if (!offer) throw new Error("Selected supplier offer no longer exists.");
    const orderedCases = Math.max(0, Math.floor(Number(item.orderedCases)));
    const orderedUnits = Math.max(0, Math.floor(Number(item.orderedUnits ?? 0)));
    if (orderedCases === 0 && orderedUnits === 0) throw new Error("Every purchase line needs a case or unit quantity.");
    const { unitsPerCase, unitCost, caseCost } = offerCaseCost(offer);
    if (unitCost <= 0) throw new Error(`Supplier offer ${offer.supplier_code || offer.id} has no reliable purchase cost.`);
    const totalUnits = orderedCases * unitsPerCase + orderedUnits;
    const lineTotalExVat = orderedCases > 0 && orderedUnits === 0 ? roundMoney(orderedCases * caseCost) : roundMoney(totalUnits * unitCost);
    const lineVat = vatRate == null ? 0 : roundMoney(lineTotalExVat * (vatRate / 100));
    return {
      offer,
      orderedCases,
      orderedUnits,
      unitsPerCase,
      unitCost,
      lineTotalExVat,
      lineVat,
      lineTotalInclVat: roundMoney(lineTotalExVat + lineVat),
    };
  });
  const totalExVat = roundMoney(lines.reduce((sum, line) => sum + line.lineTotalExVat, 0));
  const totalVat = roundMoney(lines.reduce((sum, line) => sum + line.lineVat, 0));
  const totalInclVat = roundMoney(totalExVat + totalVat);
  const purchaseOrders = await supabaseAdminFetch<PurchaseOrderRow[]>("purchase_orders?select=purchase_number&order=purchase_number.desc&limit=1");
  const nextNumber = Math.max(0, ...purchaseOrders.map((order) => Number(order.purchase_number) || 0)) + 1;
  const insertedOrders = await supabaseAdminFetch<PurchaseOrderRow[]>("purchase_orders", {
    method: "POST",
    body: {
      purchase_number: nextNumber,
      supplier_id: supplierId,
      status: "draft",
      expected_at: input.expectedDeliveryDate || null,
      expected_delivery_date: input.expectedDeliveryDate || null,
      total_ex_vat: totalExVat,
      total_vat: totalVat,
      total_incl_vat: totalInclVat,
      currency: "EUR",
      notes: cleanText(input.notes) || null,
      created_by: actor,
      metadata: { source: "admin_purchasing_module" },
    },
  });
  const purchaseOrder = insertedOrders[0];
  if (!purchaseOrder?.id) throw new Error("Purchase order could not be created.");
  const insertedItems = await supabaseAdminFetch<PurchaseOrderItemRow[]>("purchase_order_items", {
    method: "POST",
    body: lines.map((line) => ({
      purchase_order_id: purchaseOrder.id,
      product_id: line.offer.product_id,
      supplier_product_offer_id: line.offer.id,
      supplier_code: line.offer.supplier_code,
      product_name: line.offer.supplier_product_name || line.offer.supplier_code || line.offer.id,
      package_description: line.offer.package_description,
      units_per_case: line.unitsPerCase,
      ordered_cases: line.orderedCases,
      ordered_units: line.orderedUnits,
      unit_cost_ex_vat: line.unitCost,
      line_total_ex_vat: line.lineTotalExVat,
      vat_rate: vatRate,
      line_vat: line.lineVat,
      line_total_incl_vat: line.lineTotalInclVat,
      metadata: { supplier_source_batch: line.offer.source_batch },
    })),
  });
  await logAdminAction({ recordType: "purchase_order", recordId: purchaseOrder.id, action: "create_purchase_order", metadata: { actor, lineCount: insertedItems.length, totalExVat, totalVat, totalInclVat } });
  return { purchaseOrder, items: insertedItems };
}

async function ensureSupplierInvoiceBucket() {
  const response = await fetch(`${env.supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: env.supplierInvoicesBucket,
      name: env.supplierInvoicesBucket,
      public: false,
      file_size_limit: 10 * 1024 * 1024,
      allowed_mime_types: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    }),
  });
  if (![200, 201, 409].includes(response.status)) {
    throw new Error((await response.text()) || "Supplier invoice storage bucket could not be prepared.");
  }
}

async function uploadPrivateObject(path: string, mimeType: string, buffer: Buffer) {
  await ensureSupplierInvoiceBucket();
  const response = await fetch(`${env.supabaseUrl}/storage/v1/object/${env.supplierInvoicesBucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
    body: buffer,
  });
  if (!response.ok) throw new Error((await response.text()) || "Supplier invoice file could not be uploaded.");
}

async function extractTextFromInvoice(buffer: Buffer, mimeType: string) {
  if (mimeType !== "application/pdf") return "";
  const { PDFParse } = require("pdf-parse") as {
    PDFParse: {
      new (input: { data: Buffer }): { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> };
    };
  };
  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    return parsed.text.trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export async function uploadSupplierInvoiceForAdmin(formData: FormData, actorInput?: string) {
  requireAdminEnvironment();
  const actor = requireActor(actorInput);
  const supplierId = cleanText(formData.get("supplierId"));
  const purchaseOrderId = cleanText(formData.get("purchaseOrderId")) || null;
  const supplierInvoiceNumber = cleanText(formData.get("supplierInvoiceNumber")) || null;
  const file = formData.get("file");
  if (!supplierId) throw new Error("Supplier is required.");
  if (!(file instanceof File)) throw new Error("Supplier invoice file is required.");
  const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(file.type)) throw new Error("Only PDF, JPG, PNG and WebP supplier invoices are supported.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Supplier invoice file is larger than 10 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const duplicateByHash = await supabaseAdminFetch<SupplierInvoiceRow[]>(
    `supplier_invoices?select=*&document_sha256=eq.${hash}&status=not.in.(void,rejected)&limit=1`,
  ).catch(() => []);
  if (duplicateByHash[0]) return { duplicate: true, supplierInvoice: duplicateByHash[0], message: "This invoice document was already uploaded." };
  if (supplierInvoiceNumber) {
    const duplicateByNumber = await supabaseAdminFetch<SupplierInvoiceRow[]>(
      `supplier_invoices?select=*&supplier_id=eq.${supplierId}&supplier_invoice_number=eq.${encodeURIComponent(supplierInvoiceNumber)}&status=not.in.(void,rejected)&limit=1`,
    ).catch(() => []);
    if (duplicateByNumber[0]) return { duplicate: true, supplierInvoice: duplicateByNumber[0], message: "This supplier invoice number already exists for this supplier." };
  }
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() || "bin" : "bin";
  const filePath = `${supplierId}/${new Date().toISOString().slice(0, 10)}/${hash}.${extension}`;
  await uploadPrivateObject(filePath, file.type, buffer);
  let extractedText = "";
  let extractionProvider = "manual-review";
  let reviewReason = "Manual review required.";
  try {
    extractedText = await extractTextFromInvoice(buffer, file.type);
    if (extractedText) {
      extractionProvider = "pdf-text";
      reviewReason = "Review extracted supplier invoice details before booking.";
    }
  } catch (error) {
    reviewReason = `Text extraction failed: ${error instanceof Error ? error.message : "unknown error"}`;
  }
  const inserted = await supabaseAdminFetch<SupplierInvoiceRow[]>("supplier_invoices", {
    method: "POST",
    body: {
      supplier_id: supplierId,
      purchase_order_id: purchaseOrderId,
      supplier_invoice_number: supplierInvoiceNumber,
      invoice_date: cleanText(formData.get("invoiceDate")) || null,
      due_date: cleanText(formData.get("dueDate")) || null,
      total_ex_vat: numberOrZero(formData.get("totalExVat")) || null,
      vat_total: numberOrZero(formData.get("vatTotal")) || null,
      total_incl_vat: numberOrZero(formData.get("totalInclVat")) || null,
      currency: "EUR",
      status: "uploaded",
      file_bucket: env.supplierInvoicesBucket,
      file_path: filePath,
      mime_type: file.type,
      file_size: file.size,
      document_sha256: hash,
      extracted_text: extractedText,
      extraction_provider: extractionProvider,
      needs_review: true,
      review_reason: reviewReason,
      uploaded_by: actor,
      metadata: { originalFilename: file.name },
    },
  });
  const supplierInvoice = inserted[0];
  if (!supplierInvoice?.id) throw new Error("Supplier invoice could not be registered.");
  await logAdminAction({ recordType: "supplier_invoice", recordId: supplierInvoice.id, action: "upload_supplier_invoice", metadata: { actor, supplierId, purchaseOrderId, filePath, documentSha256: hash } });
  return { duplicate: false, supplierInvoice, message: reviewReason };
}

export async function createGoodsReceiptForAdmin(input: CreateGoodsReceiptInput, actorInput?: string) {
  requireAdminEnvironment();
  const actor = requireActor(actorInput);
  const purchaseOrderId = cleanText(input.purchaseOrderId);
  const requestedItems = input.items ?? [];
  if (!purchaseOrderId) throw new Error("Purchase order is required.");
  if (requestedItems.length === 0) throw new Error("At least one received line is required.");
  const itemIds = normalizeIds(requestedItems.map((item) => cleanText(item.purchaseOrderItemId)));
  const orderItems = await supabaseAdminFetch<PurchaseOrderItemRow[]>(`purchase_order_items?select=*&id=in.(${itemIds.join(",")})&purchase_order_id=eq.${purchaseOrderId}`);
  if (orderItems.length !== itemIds.length) throw new Error("One or more purchase order lines could not be found.");
  const byId = new Map(orderItems.map((item) => [item.id, item]));
  const receiptRows = requestedItems.map((item) => {
    const orderItem = byId.get(cleanText(item.purchaseOrderItemId));
    if (!orderItem) throw new Error("Received item no longer exists.");
    const receivedCases = Math.max(0, Math.floor(Number(item.receivedCases)));
    const receivedUnits = Math.max(0, Math.floor(Number(item.receivedUnits ?? 0)));
    if (receivedCases === 0 && receivedUnits === 0) throw new Error("Every receipt line needs a case or unit quantity.");
    return {
      orderItem,
      receivedCases,
      receivedUnits,
      totalReceivedUnits: receivedCases * Number(orderItem.units_per_case || 1) + receivedUnits,
    };
  });
  const receipts = await supabaseAdminFetch<GoodsReceiptRow[]>("goods_receipts", {
    method: "POST",
    body: {
      purchase_order_id: purchaseOrderId,
      supplier_invoice_id: cleanText(input.supplierInvoiceId) || null,
      status: "draft",
      received_at: new Date().toISOString(),
      notes: cleanText(input.notes) || null,
      received_by: actor,
      metadata: { source: "admin_purchasing_module" },
    },
  });
  const goodsReceipt = receipts[0];
  if (!goodsReceipt?.id) throw new Error("Goods receipt could not be created.");
  const items = await supabaseAdminFetch<GoodsReceiptItemRow[]>("goods_receipt_items", {
    method: "POST",
    body: receiptRows.map((row) => ({
      goods_receipt_id: goodsReceipt.id,
      purchase_order_item_id: row.orderItem.id,
      product_id: row.orderItem.product_id,
      received_cases: row.receivedCases,
      received_units: row.receivedUnits,
      total_received_units: row.totalReceivedUnits,
      unit_cost_ex_vat: row.orderItem.unit_cost_ex_vat,
      metadata: { actor },
    })),
  });
  await logAdminAction({ recordType: "goods_receipt", recordId: goodsReceipt.id, action: "create_goods_receipt", metadata: { actor, purchaseOrderId, itemCount: items.length } });
  return { goodsReceipt, items };
}

export async function processGoodsReceiptForAdmin(goodsReceiptId: string, actorInput?: string) {
  requireAdminEnvironment();
  const actor = requireActor(actorInput);
  return supabaseAdminFetch("rpc/process_goods_receipt_for_admin", {
    method: "POST",
    body: {
      p_goods_receipt_id: goodsReceiptId,
      p_actor: actor,
      p_idempotency_key: crypto.randomUUID(),
    },
  });
}

export async function getPurchasingReports() {
  requireAdminEnvironment();
  const diagnostics: string[] = [];
  const supplierInvoices = await safeFetch<SupplierInvoiceRow[]>("supplier_invoices?select=*&status=not.in.(void,rejected)&order=created_at.desc&limit=1000", [], diagnostics);
  const vatBuckets = supplierInvoices.reduce<Record<string, { invoiceCount: number; totalExVat: number; vatTotal: number; totalInclVat: number }>>((acc, invoice) => {
    const key = "supplier_invoices";
    acc[key] ??= { invoiceCount: 0, totalExVat: 0, vatTotal: 0, totalInclVat: 0 };
    acc[key].invoiceCount += 1;
    acc[key].totalExVat = roundMoney(acc[key].totalExVat + numberOrZero(invoice.total_ex_vat));
    acc[key].vatTotal = roundMoney(acc[key].vatTotal + numberOrZero(invoice.vat_total));
    acc[key].totalInclVat = roundMoney(acc[key].totalInclVat + numberOrZero(invoice.total_incl_vat));
    return acc;
  }, {});
  const liveOrders = await safeFetch<Array<{ order_number?: string | null; total: number; status: string; payment_status: string }>>(
    "orders?select=order_number,total,status,payment_status&status=neq.cancelled&limit=5000",
    [],
    diagnostics,
  );
  const productionOrders = liveOrders.filter((order) => !String(order.order_number ?? "").toUpperCase().startsWith("TEST"));
  const paidRevenue = roundMoney(productionOrders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + numberOrZero(order.total), 0));
  const purchaseTotals = supplierInvoices.reduce(
    (totals, invoice) => ({
      supplierInvoiceCount: totals.supplierInvoiceCount + 1,
      totalExVat: roundMoney(totals.totalExVat + numberOrZero(invoice.total_ex_vat)),
      vatTotal: roundMoney(totals.vatTotal + numberOrZero(invoice.vat_total)),
      totalInclVat: roundMoney(totals.totalInclVat + numberOrZero(invoice.total_incl_vat)),
    }),
    { supplierInvoiceCount: 0, totalExVat: 0, vatTotal: 0, totalInclVat: 0 },
  );
  return {
    schemaReady: !diagnostics.some((item) => /supplier_invoices/.test(item)),
    diagnostics,
    sales: {
      orderCount: productionOrders.length,
      productionOrderCount: productionOrders.length,
      excludedTestOrderCount: liveOrders.length - productionOrders.length,
      paidRevenue,
    },
    purchases: purchaseTotals,
    supplierInvoices,
    vatBuckets,
  };
}
