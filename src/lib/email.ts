import { businessConfig } from "@/config/business";
import { env, hasEmailProvider } from "./env";
import { formatEuro } from "./pricing";
import { isLocale, type Locale } from "@/i18n/config";

export type OrderEmailInput = {
  orderId: string; customerName: string; customerEmail: string; customerPhone?: string;
  fulfillment: string; notes?: string; total: number;
  lines: Array<{ name: string; quantity: number; unit: string; packageLabel?: string; packageQuantity?: number; salePriceInclVat: number }>;
  locale?: string;
};

type MailCopy = { receivedSubject: string; received: string[]; confirmedSubject: string; confirmed: string[]; paidSubject: string; paid: string[]; readySubject: string; ready: string[]; shippedSubject: string; shipped: string[]; deliveredSubject: string; delivered: string[]; cancelledSubject: string; cancelled: string[] };
const mailCopy: Record<Locale, MailCopy> = {
  nl: { receivedSubject: "We hebben je bestelling ontvangen", received: ["Bedankt.", "Wij controleren eerst de beschikbaarheid.", "Daarna ontvang je via WhatsApp of e-mail de betaalinstructies."], confirmedSubject: "Je bestelling is bevestigd", confirmed: ["Wij hebben alle producten gecontroleerd.", "Je ontvangt hierbij de betaalinstructies voor Bizum of bankoverschrijving."], paidSubject: "Betaling ontvangen", paid: ["Bedankt.", "Wij gaan de bestelling voorbereiden."], readySubject: "Klaar voor afhalen", ready: ["Je bestelling staat klaar."], shippedSubject: "Je bestelling is onderweg", shipped: ["Je bestelling is onderweg."], deliveredSubject: "Je bestelling is afgeleverd", delivered: ["Je bestelling is afgeleverd. Bedankt voor je bestelling."], cancelledSubject: "Je bestelling is geannuleerd", cancelled: ["Je bestelling is geannuleerd. Neem contact met ons op als je vragen hebt."] },
  en: { receivedSubject: "We have received your order", received: ["Thank you.", "We will check availability first.", "You will then receive payment instructions by WhatsApp or email."], confirmedSubject: "Your order is confirmed", confirmed: ["We have checked all products.", "You will receive payment instructions for Bizum or bank transfer."], paidSubject: "Payment received", paid: ["Thank you.", "We will start preparing your order."], readySubject: "Ready for collection", ready: ["Your order is ready for collection."], shippedSubject: "Your order is on its way", shipped: ["Your order is on its way."], deliveredSubject: "Your order has been delivered", delivered: ["Your order has been delivered. Thank you."], cancelledSubject: "Your order has been cancelled", cancelled: ["Your order has been cancelled. Please contact us with any questions."] },
  de: { receivedSubject: "Wir haben Ihre Bestellung erhalten", received: ["Vielen Dank.", "Wir prüfen zuerst die Verfügbarkeit.", "Danach erhalten Sie die Zahlungsinformationen per WhatsApp oder E-Mail."], confirmedSubject: "Ihre Bestellung ist bestätigt", confirmed: ["Wir haben alle Produkte geprüft.", "Sie erhalten die Zahlungsinformationen für Bizum oder Banküberweisung."], paidSubject: "Zahlung erhalten", paid: ["Vielen Dank.", "Wir bereiten Ihre Bestellung jetzt vor."], readySubject: "Abholbereit", ready: ["Ihre Bestellung steht zur Abholung bereit."], shippedSubject: "Ihre Bestellung ist unterwegs", shipped: ["Ihre Bestellung ist unterwegs."], deliveredSubject: "Bestellung zugestellt", delivered: ["Ihre Bestellung wurde zugestellt. Vielen Dank."], cancelledSubject: "Bestellung storniert", cancelled: ["Ihre Bestellung wurde storniert. Kontaktieren Sie uns bei Fragen."] },
  es: { receivedSubject: "Hemos recibido tu pedido", received: ["Gracias.", "Primero comprobaremos la disponibilidad.", "Después recibirás las instrucciones de pago por WhatsApp o correo electrónico."], confirmedSubject: "Tu pedido está confirmado", confirmed: ["Hemos comprobado todos los productos.", "Recibirás las instrucciones para pagar por Bizum o transferencia bancaria."], paidSubject: "Pago recibido", paid: ["Gracias.", "Vamos a preparar tu pedido."], readySubject: "Listo para recoger", ready: ["Tu pedido está listo para recoger."], shippedSubject: "Tu pedido está en camino", shipped: ["Tu pedido está en camino."], deliveredSubject: "Pedido entregado", delivered: ["Tu pedido ha sido entregado. Gracias."], cancelledSubject: "Pedido cancelado", cancelled: ["Tu pedido ha sido cancelado. Contacta con nosotros si tienes preguntas."] },
  sv: { receivedSubject: "Vi har tagit emot din beställning", received: ["Tack.", "Vi kontrollerar först tillgängligheten.", "Därefter får du betalningsinstruktioner via WhatsApp eller e-post."], confirmedSubject: "Din beställning är bekräftad", confirmed: ["Vi har kontrollerat alla produkter.", "Du får betalningsinstruktioner för Bizum eller banköverföring."], paidSubject: "Betalning mottagen", paid: ["Tack.", "Vi börjar nu förbereda din beställning."], readySubject: "Klar för avhämtning", ready: ["Din beställning är klar för avhämtning."], shippedSubject: "Din beställning är på väg", shipped: ["Din beställning är på väg."], deliveredSubject: "Beställningen är levererad", delivered: ["Din beställning har levererats. Tack."], cancelledSubject: "Beställningen är avbruten", cancelled: ["Din beställning har avbrutits. Kontakta oss om du har frågor."] },
};

function copyFor(locale?: string) { return mailCopy[isLocale(locale) ? locale : "en"]; }

function orderLinesText(input: OrderEmailInput) { return input.lines.map((line) => `${line.quantity} x ${line.name} (${line.unit}) - ${formatEuro(line.salePriceInclVat * line.quantity)}`).join("\n"); }

async function sendEmail(to: string, subject: string, text: string, idempotencyKey: string, attachments?: Array<{ filename: string; content: string }>) {
  if (!hasEmailProvider()) return { sent: false, skipped: true };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ from: env.fromEmail || businessConfig.fromEmail, to, subject, text, ...(attachments ? { attachments } : {}) }),
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
  const text = [`Hello ${input.customerName},`, "", `Attached is invoice ${input.invoiceNumber} for order ${input.orderNumber}.`, "", `Questions? Reply to this email or contact ${businessConfig.businessName}.`, "", businessConfig.businessName].join("\n");
  return sendEmail(input.customerEmail, `Invoice ${input.invoiceNumber} - ${businessConfig.businessName}`, text, `${input.invoiceId}-invoice`, [
    { filename: `${input.invoiceNumber}.pdf`, content: Buffer.from(input.pdf).toString("base64") },
  ]);
}

export async function sendOrderEmails(input: OrderEmailInput) {
  const copy = copyFor(input.locale);
  const adminBody = [`New order request: ${input.orderId}`, "", `Customer: ${input.customerName}`, `Email: ${input.customerEmail}`, `Phone: ${input.customerPhone || "Not provided"}`, `Fulfillment: ${input.fulfillment}`, "", orderLinesText(input), "", `Total: ${formatEuro(input.total)}`, `Notes: ${input.notes || "None"}`].join("\n");
  const customerBody = [`${input.customerName},`, "", ...copy.received, "", orderLinesText(input), "", `Total: ${formatEuro(input.total)}`, `Order: ${input.orderId}`, "", businessConfig.businessName].join("\n");
  const [admin, customer] = await Promise.all([
    sendEmail(env.orderEmail || businessConfig.orderEmail, `New order ${input.orderId}`, adminBody, `${input.orderId}-new-admin`),
    sendEmail(input.customerEmail, `${copy.receivedSubject} - ${input.orderId}`, customerBody, `${input.orderId}-new-customer`),
  ]);
  return { admin, customer, sent: admin.sent && customer.sent };
}

export async function sendOrderStatusEmail(input: { orderId: string; customerName: string; customerEmail: string; status: string; locale?: string }) {
  const copy = copyFor(input.locale);
  const key = input.status === "ready_for_collection" ? "ready" : input.status === "shipped" ? "shipped" : input.status === "delivered" ? "delivered" : input.status === "cancelled" ? "cancelled" : input.status === "paid" ? "paid" : "confirmed";
  const subject = copy[`${key}Subject` as keyof MailCopy] as string;
  const lines = copy[key as keyof MailCopy] as string[];
  const text = [`${input.customerName},`, "", ...lines, "", `Order: ${input.orderId}`, "", businessConfig.businessName].join("\n");
  return sendEmail(input.customerEmail, `${subject} - ${input.orderId}`, text, `${input.orderId}-status-${input.status}`);
}
