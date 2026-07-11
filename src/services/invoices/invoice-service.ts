import { supabaseAdminFetch } from "@/lib/supabase-rest";
import type { BackofficeInvoice } from "@/types/backoffice";
import { businessConfig } from "@/config/business";
export { invoiceLabel } from "@/lib/invoice-format";

export class InvoiceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const invoiceSelect = "*,invoice_items(*)";

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
    if (message.includes("order_has_no_items")) throw new InvoiceError("This order has no order lines.", 409);
    if (message.includes("order_not_found")) throw new InvoiceError("Order not found.", 404);
    throw error;
  }
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
