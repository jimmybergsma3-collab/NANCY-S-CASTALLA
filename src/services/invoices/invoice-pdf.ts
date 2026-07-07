import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { businessConfig } from "@/config/business";
import { formatInvoiceMoney, invoiceLabel } from "@/lib/invoice-format";
import type { BackofficeInvoice } from "@/types/backoffice";

const forest = rgb(0.051, 0.184, 0.133);
const coffee = rgb(0.541, 0.302, 0.145);
const muted = rgb(0.34, 0.4, 0.37);
const rule = rgb(0.86, 0.84, 0.78);
const white = rgb(1, 1, 1);

function safe(value?: string) { return value?.trim() || "-"; }
function orderLabel(number?: number) { return number ? `NC-${String(number).padStart(6, "0")}` : "-"; }
function date(value: string) { return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }
function drawText(page: PDFPage, value: string, x: number, y: number, font: PDFFont, size = 8, color = forest) { page.drawText(value, { x, y, font, size, color }); }
function clip(value: string, max: number) { return value.length > max ? `${value.slice(0, max - 1)}.` : value; }

export async function createInvoicePdf(invoice: BackofficeInvoice) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 790;

  try {
    const logo = await pdf.embedJpg(await readFile(path.join(process.cwd(), "public", "nancys-castalla-logo.jpg")));
    page.drawImage(logo, { x: 46, y: 744, width: 62, height: 62 });
  } catch { /* A missing logo must not block an invoice. */ }

  drawText(page, businessConfig.businessName, 122, y, bold, 20);
  drawText(page, businessConfig.businessActivity, 122, y - 18, regular, 7.5, muted);
  drawText(page, `Titular / Fiscal name: ${safe(businessConfig.fiscalName)}`, 122, y - 34, regular, 8, muted);
  drawText(page, `NIF/NIE: ${safe(businessConfig.fiscalId)}`, 122, y - 48, regular, 8, muted);
  drawText(page, `Dirección fiscal / Fiscal address: ${safe(businessConfig.fiscalAddress)}`, 122, y - 62, regular, 8, muted);
  drawText(page, `${businessConfig.emails.info}  |  ${businessConfig.displayWhatsappNumber}`, 122, y - 76, regular, 8, muted);

  drawText(page, "FACTURA / INVOICE", 397, y, bold, 17, coffee);
  drawText(page, invoiceLabel(invoice), 397, y - 24, bold, 10);
  drawText(page, `Fecha / Date: ${date(invoice.issued_at || invoice.created_at)}`, 397, y - 42, regular, 7.5, muted);
  drawText(page, `Pedido / Order: ${orderLabel(invoice.order_number)}`, 397, y - 56, regular, 7.5, muted);
  drawText(page, `Estado / Status: ${safe(invoice.status)}`, 397, y - 70, regular, 7.5, muted);
  drawText(page, `Pago / Payment: ${safe(invoice.payment_method)}`, 397, y - 84, regular, 7.5, muted);

  y = 675;
  page.drawLine({ start: { x: 46, y: y + 16 }, end: { x: 549, y: y + 16 }, color: rule, thickness: 1 });
  drawText(page, "CLIENTE / CUSTOMER", 46, y, bold, 9, coffee);
  drawText(page, `Nombre / Name: ${safe(invoice.customer_name)}`, 46, y - 20, bold, 9);
  drawText(page, `Empresa / Company: ${safe(invoice.customer_company_name)}`, 46, y - 36, regular, 8, muted);
  drawText(page, `NIF/CIF/NIE: ${safe(invoice.customer_fiscal_id)}`, 46, y - 52, regular, 8, muted);
  drawText(page, `Email: ${safe(invoice.customer_email)}`, 300, y - 20, regular, 8, muted);
  drawText(page, `Teléfono / Phone: ${safe(invoice.customer_phone)}`, 300, y - 36, regular, 8, muted);
  drawText(page, `Dirección / Address: ${clip(safe(invoice.customer_fiscal_address || invoice.billing_address), 58)}`, 300, y - 52, regular, 8, muted);

  y = 580;
  const tableHeader = () => {
    page.drawRectangle({ x: 46, y: y - 5, width: 503, height: 30, color: forest });
    drawText(page, "Código", 52, y + 7, bold, 6.5, white); drawText(page, "Code", 52, y - 1, regular, 5.5, white);
    drawText(page, "Producto / Product", 105, y + 3, bold, 6.5, white);
    drawText(page, "Formato", 268, y + 7, bold, 6.5, white); drawText(page, "Package", 268, y - 1, regular, 5.5, white);
    drawText(page, "Cant.", 350, y + 7, bold, 6.5, white); drawText(page, "Qty", 350, y - 1, regular, 5.5, white);
    drawText(page, "Precio unit.", 384, y + 7, bold, 6.5, white); drawText(page, "Unit price", 384, y - 1, regular, 5.5, white);
    drawText(page, "IVA", 458, y + 3, bold, 6.5, white);
    drawText(page, "Total", 500, y + 3, bold, 6.5, white);
    y -= 26;
  };
  tableHeader();

  for (const item of invoice.invoice_items) {
    if (y < 190) { page = pdf.addPage([595.28, 841.89]); y = 790; tableHeader(); }
    drawText(page, clip(item.product_id || "-", 11), 52, y, regular, 7);
    drawText(page, clip(item.product_name, 32), 105, y, regular, 7);
    drawText(page, clip(safe(item.package_label), 16), 268, y, regular, 7);
    drawText(page, String(item.quantity), 350, y, regular, 7);
    drawText(page, formatInvoiceMoney(item.unit_price_incl_vat), 384, y, regular, 7);
    drawText(page, `${Number(item.vat_rate)}%`, 458, y, regular, 7);
    drawText(page, formatInvoiceMoney(item.line_total_incl_vat), 500, y, bold, 7);
    y -= 19;
    page.drawLine({ start: { x: 46, y: y + 8 }, end: { x: 549, y: y + 8 }, color: rule, thickness: 0.5 });
  }

  const vatGroups = new Map<number, { base: number; vat: number }>();
  for (const item of invoice.invoice_items) {
    const rate = Number(item.vat_rate); const values = vatGroups.get(rate) ?? { base: 0, vat: 0 };
    values.base += Number(item.line_total_ex_vat); values.vat += Number(item.line_vat); vatGroups.set(rate, values);
  }
  y -= 14;
  drawText(page, "RESUMEN IVA / VAT SUMMARY", 300, y, bold, 8, coffee); y -= 18;
  drawText(page, "Base imponible", 300, y, bold, 7, muted); drawText(page, "Tipo IVA", 402, y, bold, 7, muted); drawText(page, "Cuota IVA", 462, y, bold, 7, muted); y -= 16;
  for (const [rate, values] of [...vatGroups].sort(([a], [b]) => a - b)) {
    drawText(page, formatInvoiceMoney(values.base), 300, y, regular, 8); drawText(page, `${rate}%`, 402, y, regular, 8); drawText(page, formatInvoiceMoney(values.vat), 462, y, regular, 8); y -= 16;
  }
  page.drawLine({ start: { x: 300, y: y + 7 }, end: { x: 549, y: y + 7 }, color: forest, thickness: 1 });
  drawText(page, "Subtotal sin IVA / Subtotal excl. VAT", 300, y - 8, regular, 8); drawText(page, formatInvoiceMoney(invoice.total_ex_vat), 480, y - 8, bold, 8); y -= 23;
  drawText(page, "IVA total / Total VAT", 300, y - 8, regular, 8); drawText(page, formatInvoiceMoney(invoice.total_vat), 480, y - 8, bold, 8); y -= 23;
  drawText(page, "TOTAL FACTURA / INVOICE TOTAL", 300, y - 8, bold, 10); drawText(page, formatInvoiceMoney(invoice.total_incl_vat), 480, y - 8, bold, 10, coffee);

  pdf.getPages().forEach((pdfPage, index, pages) => {
    pdfPage.drawLine({ start: { x: 46, y: 58 }, end: { x: 549, y: 58 }, color: rule, thickness: 0.7 });
    drawText(pdfPage, `${businessConfig.businessName}  |  ${businessConfig.emails.info}  |  ${businessConfig.displayWhatsappNumber}`, 46, 42, regular, 7, muted);
    drawText(pdfPage, "Factura generada electrónicamente / Electronically generated invoice", 46, 29, regular, 6.5, muted);
    drawText(pdfPage, "Conserve esta factura para su administración / Keep this invoice for your records", 46, 18, regular, 6.5, muted);
    drawText(pdfPage, `${index + 1}/${pages.length}`, 526, 29, regular, 7, muted);
  });
  return pdf.save();
}
