import { supabaseAdminFetch } from "@/lib/supabase-rest";
import type { BackofficeInvoice } from "@/types/backoffice";
import { businessConfig } from "@/config/business";
export { invoiceLabel } from "@/lib/invoice-format";

export class InvoiceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const invoiceSelect = "*,invoice_items(*)";

export type ManualInvoiceInput = {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: string;
  customerFiscalId?: string;
  customerCompanyName?: string;
  customerFiscalAddress?: string;
  customerLanguage?: string;
  paymentMethod?: string;
  isTest?: boolean;
  items: Array<{
    productId?: string;
    productName: string;
    packageLabel?: string;
    quantity: number;
    unitPriceInclVat: number;
    vatRate: number;
  }>;
};

const paymentMethods = new Set(["bizum", "bank-transfer", "cash", "card", "pending"]);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function requireText(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) throw new InvoiceError(`${label} is verplicht.`);
  return trimmed;
}

export async function listInvoices() {
  return supabaseAdminFetch<BackofficeInvoice[]>(`invoices?select=${invoiceSelect}&order=created_at.desc&limit=500`);
}

export async function getInvoice(id: string) {
  const rows = await supabaseAdminFetch<BackofficeInvoice[]>(`invoices?select=${invoiceSelect}&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0];
}

export async function createInvoiceFromOrder(orderId: string) {
  try {
    const series = businessConfig.businessMode === "live" ? businessConfig.invoiceSeries : businessConfig.invoiceTestSeries;
    const id = await supabaseAdminFetch<string>("rpc/create_invoice_from_order", { method: "POST", body: { p_order_id: orderId, p_invoice_series: series, p_is_test: businessConfig.businessMode !== "live" } });
    const invoice = await getInvoice(id);
    if (!invoice) throw new InvoiceError("Invoice could not be loaded after creation.", 500);
    return invoice;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("invoice_not_allowed")) throw new InvoiceError("Confirm, complete or mark the order as paid before creating an invoice.", 409);
    if (message.includes("active_invoice_exists")) throw new InvoiceError("This order already has an active invoice.", 409);
    if (message.includes("order_has_no_items")) throw new InvoiceError("This order has no order lines.", 409);
    if (message.includes("order_not_found")) throw new InvoiceError("Order not found.", 404);
    throw error;
  }
}

export async function createManualInvoice(input: ManualInvoiceInput) {
  const customerName = requireText(input.customerName, "Klantnaam");
  if (!input.items.length) throw new InvoiceError("Voeg minimaal een factuurregel toe.");

  const lines = input.items.map((item, index) => {
    const productName = requireText(item.productName, `Productnaam op regel ${index + 1}`);
    const quantity = Number(item.quantity);
    const unitPriceInclVat = Number(item.unitPriceInclVat);
    const vatRate = Number(item.vatRate);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new InvoiceError(`Aantal op regel ${index + 1} moet groter zijn dan 0.`);
    if (!Number.isFinite(unitPriceInclVat) || unitPriceInclVat < 0) throw new InvoiceError(`Prijs op regel ${index + 1} is ongeldig.`);
    if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) throw new InvoiceError(`IVA op regel ${index + 1} is ongeldig.`);
    const lineTotalInclVat = roundMoney(quantity * unitPriceInclVat);
    const lineTotalExVat = roundMoney(lineTotalInclVat / (1 + vatRate / 100));
    return {
      product_id: item.productId?.trim() || null,
      product_name: productName,
      package_label: item.packageLabel?.trim() || "Manual",
      quantity,
      unit_price_incl_vat: roundMoney(unitPriceInclVat),
      vat_rate: vatRate,
      line_total_ex_vat: lineTotalExVat,
      line_vat: roundMoney(lineTotalInclVat - lineTotalExVat),
      line_total_incl_vat: lineTotalInclVat,
    };
  });

  const totalInclVat = roundMoney(lines.reduce((sum, item) => sum + item.line_total_incl_vat, 0));
  const totalExVat = roundMoney(lines.reduce((sum, item) => sum + item.line_total_ex_vat, 0));
  const totalVat = roundMoney(totalInclVat - totalExVat);
  const isTest = input.isTest ?? businessConfig.businessMode !== "live";
  const series = isTest ? "TEST" : businessConfig.invoiceSeries;
  const year = new Date().getUTCFullYear();
  const seriesNumber = await supabaseAdminFetch<number>("rpc/next_invoice_series_number", {
    method: "POST",
    body: { p_series: series, p_year: year },
  });

  const inserted = await supabaseAdminFetch<BackofficeInvoice[]>("invoices", {
    method: "POST",
    body: {
      status: "issued",
      total_ex_vat: totalExVat,
      total_vat: totalVat,
      total_incl_vat: totalInclVat,
      issued_at: new Date().toISOString(),
      customer_name: customerName,
      customer_email: input.customerEmail?.trim().toLowerCase() || "",
      customer_phone: input.customerPhone?.trim() || "",
      billing_address: input.billingAddress?.trim() || "",
      customer_language: input.customerLanguage?.trim() || "en",
      customer_fiscal_id: input.customerFiscalId?.trim() || "",
      customer_company_name: input.customerCompanyName?.trim() || "",
      customer_fiscal_address: input.customerFiscalAddress?.trim() || "",
      payment_method: paymentMethods.has(input.paymentMethod || "") ? input.paymentMethod : "pending",
      invoice_series: series,
      invoice_series_year: year,
      invoice_series_number: seriesNumber,
      is_test: isTest,
    },
  });
  const invoice = inserted[0];
  if (!invoice) throw new InvoiceError("Factuur kon niet worden aangemaakt.", 500);

  await supabaseAdminFetch("invoice_items", {
    method: "POST",
    body: lines.map((line) => ({ ...line, invoice_id: invoice.id })),
  });

  const completeInvoice = await getInvoice(invoice.id);
  if (!completeInvoice) throw new InvoiceError("Factuur kon niet worden geladen na aanmaken.", 500);
  return completeInvoice;
}

export async function markInvoiceEmailed(id: string) {
  const rows = await supabaseAdminFetch<BackofficeInvoice[]>(`invoices?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", body: { email_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  });
  return rows[0];
}

export async function markInvoiceTest(id: string, isTest: boolean) {
  const rows = await supabaseAdminFetch<BackofficeInvoice[]>(`invoices?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", body: { is_test: isTest, updated_at: new Date().toISOString() },
  });
  return rows[0];
}

export async function archiveInvoice(id: string, archived: boolean) {
  const rows = await supabaseAdminFetch<BackofficeInvoice[]>(`invoices?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", body: { archived_at: archived ? new Date().toISOString() : null, updated_at: new Date().toISOString() },
  });
  return rows[0];
}

export async function getCustomerInvoice(id: string, authUserId: string) {
  const customers = await supabaseAdminFetch<Array<{ id: string }>>(`customers?select=id&auth_user_id=eq.${encodeURIComponent(authUserId)}&limit=1`);
  if (!customers[0]) return undefined;
  const rows = await supabaseAdminFetch<BackofficeInvoice[]>(`invoices?select=${invoiceSelect}&id=eq.${encodeURIComponent(id)}&customer_id=eq.${customers[0].id}&limit=1`);
  return rows[0];
}
