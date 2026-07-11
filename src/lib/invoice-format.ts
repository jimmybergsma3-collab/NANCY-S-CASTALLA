export type InvoiceNumberSource = { invoice_number: number; issued_at?: string; created_at?: string; invoice_series?: string; invoice_series_year?: number; invoice_series_number?: number };

export function invoiceLabel(invoice: InvoiceNumberSource) {
  if (invoice.invoice_series && invoice.invoice_series_year && invoice.invoice_series_number) {
    return `${invoice.invoice_series}-${invoice.invoice_series_year}-${String(invoice.invoice_series_number).padStart(6, "0")}`;
  }
  const date = invoice.issued_at || invoice.created_at;
  const year = date && !Number.isNaN(new Date(date).getTime()) ? new Date(date).getUTCFullYear() : new Date().getUTCFullYear();
  return `NC-${year}-${String(invoice.invoice_number).padStart(6, "0")}`;
}

export function formatInvoiceMoney(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(value)).replace(/\u00a0/g, " ");
}
