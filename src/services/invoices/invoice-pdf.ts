import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { businessConfig } from "@/config/business";
import { invoiceLabel } from "./invoice-service";
import type { BackofficeInvoice } from "@/types/backoffice";

const forest = rgb(0.051, 0.184, 0.133);
const coffee = rgb(0.541, 0.302, 0.145);
const muted = rgb(0.36, 0.42, 0.39);
const line = rgb(0.86, 0.84, 0.78);

function money(value: number) { return `EUR ${Number(value).toFixed(2)}`; }
function orderLabel(number?: number) { return number ? `NC-${String(number).padStart(6, "0")}` : "-"; }
function safe(value?: string) { return value?.trim() || "-"; }

function text(page: PDFPage, value: string, x: number, y: number, font: PDFFont, size = 9, color = forest) {
  page.drawText(value, { x, y, font, size, color });
}

export async function createInvoicePdf(invoice: BackofficeInvoice) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 790;

  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "nancys-castalla-logo.jpg"));
    const logo = await pdf.embedJpg(logoBytes);
    page.drawImage(logo, { x: 48, y: 744, width: 64, height: 64 });
  } catch { /* A missing logo must not block an invoice. */ }

  text(page, businessConfig.businessName, 128, y, bold, 22);
  text(page, businessConfig.address, 128, y - 20, regular, 9, muted);
  text(page, businessConfig.emails.info, 128, y - 34, regular, 9, muted);
  text(page, businessConfig.displayWhatsappNumber, 128, y - 48, regular, 9, muted);
  if (businessConfig.taxId) text(page, `Tax ID: ${businessConfig.taxId}`, 128, y - 62, regular, 9, muted);

  text(page, "INVOICE", 430, y, bold, 20, coffee);
  text(page, invoiceLabel(invoice), 430, y - 24, bold, 11);
  text(page, `Date: ${new Date(invoice.issued_at || invoice.created_at).toLocaleDateString("en-GB")}`, 430, y - 42, regular, 8, muted);
  text(page, `Order: ${orderLabel(invoice.order_number)}`, 430, y - 56, regular, 8, muted);

  y = 700;
  page.drawLine({ start: { x: 48, y: y + 16 }, end: { x: 547, y: y + 16 }, color: line, thickness: 1 });
  text(page, "BILL TO", 48, y, bold, 9, coffee);
  text(page, safe(invoice.customer_name), 48, y - 20, bold, 11);
  text(page, safe(invoice.billing_address), 48, y - 36, regular, 9, muted);
  text(page, safe(invoice.customer_email), 48, y - 52, regular, 9, muted);
  text(page, safe(invoice.customer_phone), 48, y - 68, regular, 9, muted);
  text(page, `Payment method: ${safe(invoice.payment_method)}`, 350, y - 20, regular, 9, muted);
  text(page, `Status: ${invoice.status}`, 350, y - 36, regular, 9, muted);

  y = 590;
  const header = () => {
    page.drawRectangle({ x: 48, y: y - 5, width: 499, height: 24, color: forest });
    text(page, "Product", 56, y + 3, bold, 8, rgb(1, 1, 1));
    text(page, "Package", 260, y + 3, bold, 8, rgb(1, 1, 1));
    text(page, "Qty", 352, y + 3, bold, 8, rgb(1, 1, 1));
    text(page, "Unit price", 390, y + 3, bold, 8, rgb(1, 1, 1));
    text(page, "VAT", 460, y + 3, bold, 8, rgb(1, 1, 1));
    text(page, "Total", 500, y + 3, bold, 8, rgb(1, 1, 1));
    y -= 22;
  };
  header();

  for (const item of invoice.invoice_items) {
    if (y < 145) {
      page = pdf.addPage([595.28, 841.89]);
      y = 790;
      header();
    }
    const product = `${item.product_id ? `${item.product_id} - ` : ""}${item.product_name}`.slice(0, 43);
    text(page, product, 56, y, regular, 8);
    text(page, safe(item.package_label).slice(0, 17), 260, y, regular, 8);
    text(page, String(item.quantity), 352, y, regular, 8);
    text(page, money(item.unit_price_incl_vat), 390, y, regular, 8);
    text(page, `${Number(item.vat_rate)}%`, 460, y, regular, 8);
    text(page, money(item.line_total_incl_vat), 500, y, bold, 8);
    y -= 19;
    page.drawLine({ start: { x: 48, y: y + 8 }, end: { x: 547, y: y + 8 }, color: line, thickness: 0.5 });
  }

  y -= 10;
  const vatGroups = new Map<number, { base: number; vat: number }>();
  for (const item of invoice.invoice_items) {
    const rate = Number(item.vat_rate);
    const current = vatGroups.get(rate) ?? { base: 0, vat: 0 };
    current.base += Number(item.line_total_ex_vat);
    current.vat += Number(item.line_vat);
    vatGroups.set(rate, current);
  }
  text(page, "Subtotal excl. VAT", 350, y, regular, 9); text(page, money(invoice.total_ex_vat), 484, y, bold, 9); y -= 18;
  for (const [rate, values] of [...vatGroups].sort(([a], [b]) => a - b)) {
    text(page, `VAT ${rate}% on ${money(values.base)}`, 350, y, regular, 8, muted); text(page, money(values.vat), 484, y, bold, 8); y -= 16;
  }
  page.drawLine({ start: { x: 350, y: y + 7 }, end: { x: 547, y: y + 7 }, color: forest, thickness: 1 });
  text(page, "Total incl. VAT", 350, y - 8, bold, 11); text(page, money(invoice.total_incl_vat), 484, y - 8, bold, 11, coffee);

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    text(pdfPage, `${businessConfig.businessName} | ${businessConfig.emails.info}`, 48, 36, regular, 8, muted);
    text(pdfPage, `Page ${index + 1} of ${pages.length}`, 485, 36, regular, 8, muted);
  });
  return pdf.save();
}
