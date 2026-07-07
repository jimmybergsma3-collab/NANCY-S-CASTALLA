export type InvoiceNumberSource = { invoice_number: number; issued_at?: string; created_at?: string };

export function invoiceLabel(invoice: InvoiceNumberSource) {
  const date = invoice.issued_at || invoice.created_at;
  const year = date && !Number.isNaN(new Date(date).getTime()) ? new Date(date).getUTCFullYear() : new Date().getUTCFullYear();
  return `NC-${year}-${String(invoice.invoice_number).padStart(6, "0")}`;
}

export function formatInvoiceMoney(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(value)).replace(/\u00a0/g, " ");
}
