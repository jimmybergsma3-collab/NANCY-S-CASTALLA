import { businessConfig } from "@/config/business";
import { env, hasEmailProvider } from "./env";
import { formatEuro } from "./pricing";
import { isLocale, type Locale } from "@/i18n/config";
import { paymentMethodLabel } from "./payment";
import { translateProductName } from "./product-translations";

export type OrderEmailInput = {
  orderId: string; customerName: string; customerEmail: string; customerPhone?: string;
  fulfillment: string; paymentMethod?: string; notes?: string; total: number;
  lines: Array<{ productId?: string; name: string; quantity: number; unit: string; packageLabel?: string; packageQuantity?: number; salePriceInclVat: number }>;
  locale?: string;
};

type MailCopy = {
  greeting: string; questions: string; whatsapp: string; email: string; website: string;
  receivedSubject: string; receivedLead: string[]; confirmedSubject: string; confirmed: string[];
  paidSubject: string; paid: string[]; readySubject: string; ready: string[];
  shippedSubject: string; shipped: string[]; deliveredSubject: string; delivered: string[];
  cancelledSubject: string; cancelled: string[]; orderSummary: string; orderNumber: string;
  total: string; fulfilment: string; paymentMethod: string; products: string;
};

const mailCopy: Record<Locale, MailCopy> = {
  nl: { greeting: "Beste", questions: "Heb je vragen?", whatsapp: "WhatsApp", email: "E-mail", website: "Website", receivedSubject: "We hebben je bestelling ontvangen", receivedLead: ["Bedankt voor je bestelling bij Nancy's Castalla.", "Wij controleren eerst of alle producten beschikbaar zijn.", "Zodra de bestelling compleet is ontvang je via WhatsApp of e-mail de betaalinstructies.", "Na ontvangst van de betaling bereiden wij jouw bestelling voor."], confirmedSubject: "Je bestelling is bevestigd", confirmed: ["Wij hebben alle producten gecontroleerd.", "Je ontvangt hierbij de betaalinstructies voor Bizum of bankoverschrijving."], paidSubject: "Betaling ontvangen", paid: ["Bedankt.", "Wij gaan de bestelling voorbereiden."], readySubject: "Klaar voor afhalen", ready: ["Je bestelling staat klaar."], shippedSubject: "Je bestelling is onderweg", shipped: ["Je bestelling is onderweg."], deliveredSubject: "Je bestelling is afgeleverd", delivered: ["Je bestelling is afgeleverd. Bedankt voor je bestelling."], cancelledSubject: "Je bestelling is geannuleerd", cancelled: ["Je bestelling is geannuleerd. Neem contact met ons op als je vragen hebt."], orderSummary: "Je bestelling", orderNumber: "Ordernummer", total: "Totaal", fulfilment: "Afhalen of bezorgen", paymentMethod: "Betaalmethode", products: "Producten" },
  en: { greeting: "Dear", questions: "Questions?", whatsapp: "WhatsApp", email: "Email", website: "Website", receivedSubject: "We have received your order", receivedLead: ["Thank you for your order at Nancy's Castalla.", "We will first check whether all products are available.", "As soon as the order is complete, you will receive payment instructions by WhatsApp or email.", "After payment is received, we will prepare your order."], confirmedSubject: "Your order is confirmed", confirmed: ["We have checked all products.", "You will receive payment instructions for Bizum or bank transfer."], paidSubject: "Payment received", paid: ["Thank you.", "We will start preparing your order."], readySubject: "Ready for collection", ready: ["Your order is ready for collection."], shippedSubject: "Your order is on its way", shipped: ["Your order is on its way."], deliveredSubject: "Your order has been delivered", delivered: ["Your order has been delivered. Thank you."], cancelledSubject: "Your order has been cancelled", cancelled: ["Your order has been cancelled. Please contact us with any questions."], orderSummary: "Your order", orderNumber: "Order number", total: "Total", fulfilment: "Collection or delivery", paymentMethod: "Payment method", products: "Products" },
  de: { greeting: "Hallo", questions: "Fragen?", whatsapp: "WhatsApp", email: "E-Mail", website: "Website", receivedSubject: "Wir haben Ihre Bestellung erhalten", receivedLead: ["Vielen Dank für Ihre Bestellung bei Nancy's Castalla.", "Wir prüfen zuerst, ob alle Produkte verfügbar sind.", "Sobald die Bestellung vollständig ist, erhalten Sie Zahlungsinformationen per WhatsApp oder E-Mail.", "Nach Zahlungseingang bereiten wir Ihre Bestellung vor."], confirmedSubject: "Ihre Bestellung ist bestätigt", confirmed: ["Wir haben alle Produkte geprüft.", "Sie erhalten die Zahlungsinformationen für Bizum oder Banküberweisung."], paidSubject: "Zahlung erhalten", paid: ["Vielen Dank.", "Wir bereiten Ihre Bestellung jetzt vor."], readySubject: "Abholbereit", ready: ["Ihre Bestellung steht zur Abholung bereit."], shippedSubject: "Ihre Bestellung ist unterwegs", shipped: ["Ihre Bestellung ist unterwegs."], deliveredSubject: "Bestellung zugestellt", delivered: ["Ihre Bestellung wurde zugestellt. Vielen Dank."], cancelledSubject: "Bestellung storniert", cancelled: ["Ihre Bestellung wurde storniert. Kontaktieren Sie uns bei Fragen."], orderSummary: "Ihre Bestellung", orderNumber: "Bestellnummer", total: "Gesamt", fulfilment: "Abholung oder Lieferung", paymentMethod: "Zahlungsart", products: "Produkte" },
  es: { greeting: "Hola", questions: "¿Tienes preguntas?", whatsapp: "WhatsApp", email: "E-mail", website: "Web", receivedSubject: "Hemos recibido tu pedido", receivedLead: ["Gracias por tu pedido en Nancy's Castalla.", "Primero comprobaremos si todos los productos están disponibles.", "Cuando el pedido esté completo recibirás las instrucciones de pago por WhatsApp o correo electrónico.", "Después de recibir el pago prepararemos tu pedido."], confirmedSubject: "Tu pedido está confirmado", confirmed: ["Hemos comprobado todos los productos.", "Recibirás las instrucciones para pagar por Bizum o transferencia bancaria."], paidSubject: "Pago recibido", paid: ["Gracias.", "Vamos a preparar tu pedido."], readySubject: "Listo para recoger", ready: ["Tu pedido está listo para recoger."], shippedSubject: "Tu pedido está en camino", shipped: ["Tu pedido está en camino."], deliveredSubject: "Pedido entregado", delivered: ["Tu pedido ha sido entregado. Gracias."], cancelledSubject: "Pedido cancelado", cancelled: ["Tu pedido ha sido cancelado. Contacta con nosotros si tienes preguntas."], orderSummary: "Tu pedido", orderNumber: "Número de pedido", total: "Total", fulfilment: "Recogida o entrega", paymentMethod: "Método de pago", products: "Productos" },
  sv: { greeting: "Hej", questions: "Frågor?", whatsapp: "WhatsApp", email: "E-post", website: "Webbplats", receivedSubject: "Vi har tagit emot din beställning", receivedLead: ["Tack för din beställning hos Nancy's Castalla.", "Vi kontrollerar först att alla produkter är tillgängliga.", "När beställningen är komplett får du betalningsinstruktioner via WhatsApp eller e-post.", "När betalningen är mottagen förbereder vi din beställning."], confirmedSubject: "Din beställning är bekräftad", confirmed: ["Vi har kontrollerat alla produkter.", "Du får betalningsinstruktioner för Bizum eller banköverföring."], paidSubject: "Betalning mottagen", paid: ["Tack.", "Vi börjar nu förbereda din beställning."], readySubject: "Klar för avhämtning", ready: ["Din beställning är klar för avhämtning."], shippedSubject: "Din beställning är på väg", shipped: ["Din beställning är på väg."], deliveredSubject: "Beställningen är levererad", delivered: ["Din beställning har levererats. Tack."], cancelledSubject: "Beställningen är avbruten", cancelled: ["Din beställning har avbrutits. Kontakta oss om du har frågor."], orderSummary: "Din beställning", orderNumber: "Ordernummer", total: "Totalt", fulfilment: "Avhämtning eller leverans", paymentMethod: "Betalningsmetod", products: "Produkter" },
};

function copyFor(locale?: string) { return mailCopy[isLocale(locale) ? locale : "en"]; }
function localeFor(locale?: string): Locale { return isLocale(locale) ? locale : "en"; }
function firstName(name: string) { return name.trim().split(/\s+/)[0] || name; }
function siteUrl() { return (env.siteUrl || "https://www.nancys.es").replace(/\/$/, ""); }
function logoUrl() { return `${siteUrl()}/nancys-castalla-logo.jpg`; }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char)); }
function senderFrom() { return `Nancy's Castalla Orders <${env.orderEmail || businessConfig.orderEmail}>`; }

function orderLinesText(input: OrderEmailInput, locale: Locale) {
  return input.lines.map((line) => `${line.quantity} x ${translateProductName(line.name, locale)} (${line.packageLabel || line.unit}) - ${formatEuro(line.salePriceInclVat * line.quantity)}`).join("\n");
}

function orderLinesHtml(input: OrderEmailInput, locale: Locale) {
  return input.lines.map((line) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee4cf;"><strong>${escapeHtml(translateProductName(line.name, locale))}</strong><br><span style="color:#60756a;font-size:13px;">${escapeHtml(line.packageLabel || line.unit)}</span></td><td style="padding:10px 0;border-bottom:1px solid #eee4cf;text-align:center;">${line.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #eee4cf;text-align:right;font-weight:700;">${formatEuro(line.salePriceInclVat * line.quantity)}</td></tr>`).join("");
}

function emailShell(title: string, intro: string[], content: string, copy: MailCopy) {
  return `<!doctype html><html><body style="margin:0;background:#fbf7ed;font-family:Arial,Helvetica,sans-serif;color:#0d2f22;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fbf7ed;padding:24px 12px;"><tr><td align="center">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffaf0;border:1px solid #eadfca;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#0d2f22;padding:18px 24px;color:#f7efd9;"><img src="${logoUrl()}" width="58" height="58" alt="Nancy's Castalla" style="vertical-align:middle;border-radius:50%;margin-right:14px;"><span style="font-family:Georgia,serif;font-size:24px;font-weight:700;vertical-align:middle;">Nancy's Castalla</span></td></tr>
  <tr><td style="padding:30px 28px;"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#0d2f22;">${escapeHtml(title)}</h1>${intro.map((line) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.55;">${escapeHtml(line)}</p>`).join("")}${content}</td></tr>
  <tr><td style="background:#0d2f22;padding:22px 28px;color:#f7efd9;"><p style="margin:0 0 12px;font-weight:700;">${escapeHtml(copy.questions)}</p><p style="margin:0 0 6px;">${escapeHtml(copy.whatsapp)}: <a href="https://wa.me/${businessConfig.whatsappNumber.replace(/\D/g, "")}" style="color:#f7efd9;">${businessConfig.displayWhatsappNumber}</a></p><p style="margin:0 0 6px;">${escapeHtml(copy.email)}: <a href="mailto:${businessConfig.emails.info}" style="color:#f7efd9;">${businessConfig.emails.info}</a></p><p style="margin:0;">${escapeHtml(copy.website)}: <a href="${siteUrl()}" style="color:#f7efd9;">${siteUrl()}</a></p></td></tr>
  </table></td></tr></table></body></html>`;
}

async function sendEmail(to: string, subject: string, text: string, idempotencyKey: string, attachments?: Array<{ filename: string; content: string }>, html?: string) {
  if (!hasEmailProvider()) return { sent: false, skipped: true };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ from: senderFrom(), to, subject, text, ...(html ? { html } : {}), ...(attachments ? { attachments } : {}) }),
    });
    if (!response.ok) { const error = await response.text(); console.error("Resend email failed", { subject, to, status: response.status, error }); return { sent: false, skipped: false, error }; }
    return { sent: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("Resend email request failed", { subject, to, error: message });
    return { sent: false, skipped: false, error: message };
  }
}

export async function sendInvoiceEmail(input: { invoiceId: string; invoiceNumber: string; orderNumber: string; customerName: string; customerEmail: string; pdf: Uint8Array }) {
  const copy = mailCopy.es;
  const lines = ["Beste klant / Estimado cliente / Dear customer,", "", "In de bijlage vindt u de factuur voor uw bestelling.", "Adjuntamos la factura correspondiente a su pedido.", "Please find the invoice for your order attached.", "", `Factura / Invoice: ${input.invoiceNumber}`, `Pedido / Order: ${input.orderNumber}`, "", "Gracias por su compra.", "Thank you for your order.", "", businessConfig.businessName];
  const html = emailShell(`Factura / Invoice ${input.invoiceNumber}`, ["In de bijlage vindt u de factuur voor uw bestelling.", "Adjuntamos la factura correspondiente a su pedido.", "Please find the invoice for your order attached.", "Gracias por su compra. Thank you for your order."], `<p style="margin:20px 0 0;"><a href="${siteUrl()}" style="display:inline-block;background:#0d2f22;color:#f7efd9;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700;">Nancy's Castalla</a></p>`, copy);
  return sendEmail(input.customerEmail, `Factura Nancy's Castalla / Invoice Nancy's Castalla - ${input.invoiceNumber}`, lines.join("\n"), `${input.invoiceId}-invoice-v3`, [
    { filename: `${input.invoiceNumber}.pdf`, content: Buffer.from(input.pdf).toString("base64") },
  ], html);
}

export async function sendOrderEmails(input: OrderEmailInput) {
  const locale = localeFor(input.locale);
  const copy = copyFor(input.locale);
  const adminBody = [`New order request: ${input.orderId}`, "", `Customer: ${input.customerName}`, `Email: ${input.customerEmail}`, `Phone: ${input.customerPhone || "Not provided"}`, `Fulfillment: ${input.fulfillment}`, `Payment method: ${paymentMethodLabel(input.paymentMethod, "en")}`, "", orderLinesText(input, "en"), "", `Total: ${formatEuro(input.total)}`, `Notes: ${input.notes || "None"}`].join("\n");
  const customerText = [`${copy.greeting} ${firstName(input.customerName)},`, "", ...copy.receivedLead, "", `${copy.products}:`, orderLinesText(input, locale), "", `${copy.orderNumber}: ${input.orderId}`, `${copy.total}: ${formatEuro(input.total)}`, `${copy.fulfilment}: ${input.fulfillment}`, `${copy.paymentMethod}: ${paymentMethodLabel(input.paymentMethod, locale)}`, "", businessConfig.businessName].join("\n");
  const summary = `<h2 style="margin:26px 0 10px;font-family:Georgia,serif;font-size:22px;">${escapeHtml(copy.orderSummary)}</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${orderLinesHtml(input, locale)}</table><div style="margin-top:18px;padding:16px;background:#f7efd9;border-radius:10px;"><p style="margin:0 0 8px;"><strong>${escapeHtml(copy.orderNumber)}:</strong> ${escapeHtml(input.orderId)}</p><p style="margin:0 0 8px;"><strong>${escapeHtml(copy.total)}:</strong> ${formatEuro(input.total)}</p><p style="margin:0 0 8px;"><strong>${escapeHtml(copy.fulfilment)}:</strong> ${escapeHtml(input.fulfillment)}</p><p style="margin:0;"><strong>${escapeHtml(copy.paymentMethod)}:</strong> ${escapeHtml(paymentMethodLabel(input.paymentMethod, locale))}</p></div>`;
  const customerHtml = emailShell(`${copy.receivedSubject}`, [`${copy.greeting} ${firstName(input.customerName)},`, ...copy.receivedLead], summary, copy);
  const [admin, customer] = await Promise.all([
    sendEmail(env.orderEmail || businessConfig.orderEmail, `New order ${input.orderId}`, adminBody, `${input.orderId}-new-admin-v2`),
    sendEmail(input.customerEmail, `${copy.receivedSubject} - ${input.orderId}`, customerText, `${input.orderId}-new-customer-v2`, undefined, customerHtml),
  ]);
  return { admin, customer, sent: admin.sent && customer.sent };
}

export async function sendOrderStatusEmail(input: { orderId: string; customerName: string; customerEmail: string; status: string; locale?: string }) {
  const copy = copyFor(input.locale);
  const key = input.status === "ready_for_collection" ? "ready" : input.status === "shipped" ? "shipped" : input.status === "delivered" ? "delivered" : input.status === "cancelled" ? "cancelled" : input.status === "paid" ? "paid" : "confirmed";
  const subject = copy[`${key}Subject` as keyof MailCopy] as string;
  const lines = copy[key as keyof MailCopy] as string[];
  const text = [`${copy.greeting} ${firstName(input.customerName)},`, "", ...lines, "", `${copy.orderNumber}: ${input.orderId}`, "", businessConfig.businessName].join("\n");
  const html = emailShell(subject, [`${copy.greeting} ${firstName(input.customerName)},`, ...lines], `<div style="margin-top:18px;padding:16px;background:#f7efd9;border-radius:10px;"><strong>${escapeHtml(copy.orderNumber)}:</strong> ${escapeHtml(input.orderId)}</div>`, copy);
  return sendEmail(input.customerEmail, `${subject} - ${input.orderId}`, text, `${input.orderId}-status-${input.status}-v2`, undefined, html);
}
