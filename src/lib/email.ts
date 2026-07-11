import { businessConfig } from "@/config/business";
import { isLocale, type Locale } from "@/i18n/config";
import { paymentMethodLabel } from "./payment";
import { env, hasEmailProvider } from "./env";
import { formatEuro } from "./pricing";
import { translateProductName } from "./product-translations";

export type OrderEmailInput = {
  orderId: string; customerName: string; customerEmail: string; customerPhone?: string;
  fulfillment: string; paymentMethod?: string; notes?: string; total: number;
  lines: Array<{ productId?: string; name: string; quantity: number; unit: string; packageLabel?: string; packageQuantity?: number; salePriceInclVat: number }>;
  locale?: string;
};

type MailCopy = {
  greeting: string; questions: string; whatsapp: string; email: string; website: string; facebook: string;
  receivedSubject: string; receivedLead: string[]; confirmedSubject: string; confirmed: string[];
  paidSubject: string; paid: string[]; readySubject: string; ready: string[];
  shippedSubject: string; shipped: string[]; deliveredSubject: string; delivered: string[];
  cancelledSubject: string; cancelled: string[]; orderSummary: string; orderNumber: string;
  total: string; fulfilment: string; paymentMethod: string; products: string; paymentInfo: string;
  paymentInfoBody: string; product: string; package: string; quantity: string; lineTotal: string;
  preheader: string; footerLine: string;
};

const mailCopy: Record<Locale, MailCopy> = {
  nl: { greeting: "Beste", questions: "Heb je vragen?", whatsapp: "WhatsApp", email: "E-mail", website: "Website", facebook: "Facebook", receivedSubject: "We hebben je bestelling ontvangen", receivedLead: ["Bedankt voor je bestelling bij Nancy's Castalla.", "Wij controleren eerst of alle producten beschikbaar zijn.", "Zodra de bestelling compleet is ontvang je via WhatsApp of e-mail de betaalinstructies.", "Na ontvangst van de betaling bereiden wij jouw bestelling voor."], confirmedSubject: "Je bestelling is bevestigd", confirmed: ["Wij hebben alle producten gecontroleerd.", "Je ontvangt hierbij de betaalinstructies voor Bizum of bankoverschrijving."], paidSubject: "Betaling ontvangen", paid: ["Bedankt.", "Wij gaan de bestelling voorbereiden."], readySubject: "Klaar voor afhalen", ready: ["Je bestelling staat klaar."], shippedSubject: "Je bestelling is onderweg", shipped: ["Je bestelling is onderweg."], deliveredSubject: "Je bestelling is afgeleverd", delivered: ["Je bestelling is afgeleverd. Bedankt voor je bestelling."], cancelledSubject: "Je bestelling is geannuleerd", cancelled: ["Je bestelling is geannuleerd. Neem contact met ons op als je vragen hebt."], orderSummary: "Je bestelling", orderNumber: "Ordernummer", total: "Totaal", fulfilment: "Afhalen of bezorgen", paymentMethod: "Betaalmethode", products: "Producten", paymentInfo: "Betaalinformatie", paymentInfoBody: "Je hoeft nu nog niet te betalen. Nancy's Castalla controleert eerst de beschikbaarheid en stuurt daarna de betaalinstructies voor Bizum, bankoverschrijving of contante betaling.", product: "Product", package: "Verpakking", quantity: "Aantal", lineTotal: "Regeltotaal", preheader: "Nancy's Castalla bevestigt je bestelling en controleert de beschikbaarheid.", footerLine: "Internationale producten, koffie, brood en pre-orders in Castalla." },
  en: { greeting: "Dear", questions: "Questions?", whatsapp: "WhatsApp", email: "Email", website: "Website", facebook: "Facebook", receivedSubject: "We have received your order", receivedLead: ["Thank you for your order at Nancy's Castalla.", "We will first check whether all products are available.", "As soon as the order is complete, you will receive payment instructions by WhatsApp or email.", "After payment is received, we will prepare your order."], confirmedSubject: "Your order is confirmed", confirmed: ["We have checked all products.", "You will receive payment instructions for Bizum or bank transfer."], paidSubject: "Payment received", paid: ["Thank you.", "We will start preparing your order."], readySubject: "Ready for collection", ready: ["Your order is ready for collection."], shippedSubject: "Your order is on its way", shipped: ["Your order is on its way."], deliveredSubject: "Your order has been delivered", delivered: ["Your order has been delivered. Thank you."], cancelledSubject: "Your order has been cancelled", cancelled: ["Your order has been cancelled. Please contact us with any questions."], orderSummary: "Your order", orderNumber: "Order number", total: "Total", fulfilment: "Collection or delivery", paymentMethod: "Payment method", products: "Products", paymentInfo: "Payment information", paymentInfoBody: "You do not need to pay yet. Nancy's Castalla first checks availability and then sends payment instructions for Bizum, bank transfer or cash payment.", product: "Product", package: "Package", quantity: "Qty", lineTotal: "Line total", preheader: "Nancy's Castalla confirms your order request and checks availability.", footerLine: "International foods, coffee, bread and pre-orders in Castalla." },
  de: { greeting: "Hallo", questions: "Fragen?", whatsapp: "WhatsApp", email: "E-Mail", website: "Website", facebook: "Facebook", receivedSubject: "Wir haben Ihre Bestellung erhalten", receivedLead: ["Vielen Dank für Ihre Bestellung bei Nancy's Castalla.", "Wir prüfen zuerst, ob alle Produkte verfügbar sind.", "Sobald die Bestellung vollständig ist, erhalten Sie Zahlungsinformationen per WhatsApp oder E-Mail.", "Nach Zahlungseingang bereiten wir Ihre Bestellung vor."], confirmedSubject: "Ihre Bestellung ist bestätigt", confirmed: ["Wir haben alle Produkte geprüft.", "Sie erhalten die Zahlungsinformationen für Bizum oder Banküberweisung."], paidSubject: "Zahlung erhalten", paid: ["Vielen Dank.", "Wir bereiten Ihre Bestellung jetzt vor."], readySubject: "Abholbereit", ready: ["Ihre Bestellung steht zur Abholung bereit."], shippedSubject: "Ihre Bestellung ist unterwegs", shipped: ["Ihre Bestellung ist unterwegs."], deliveredSubject: "Bestellung zugestellt", delivered: ["Ihre Bestellung wurde zugestellt. Vielen Dank."], cancelledSubject: "Bestellung storniert", cancelled: ["Ihre Bestellung wurde storniert. Kontaktieren Sie uns bei Fragen."], orderSummary: "Ihre Bestellung", orderNumber: "Bestellnummer", total: "Gesamt", fulfilment: "Abholung oder Lieferung", paymentMethod: "Zahlungsart", products: "Produkte", paymentInfo: "Zahlungsinformationen", paymentInfoBody: "Sie müssen jetzt noch nicht bezahlen. Nancy's Castalla prüft zuerst die Verfügbarkeit und sendet danach Zahlungsinformationen für Bizum, Banküberweisung oder Barzahlung.", product: "Produkt", package: "Packung", quantity: "Menge", lineTotal: "Zeilensumme", preheader: "Nancy's Castalla bestätigt Ihre Bestellanfrage und prüft die Verfügbarkeit.", footerLine: "Internationale Lebensmittel, Kaffee, Brot und Vorbestellungen in Castalla." },
  es: { greeting: "Hola", questions: "¿Tienes preguntas?", whatsapp: "WhatsApp", email: "E-mail", website: "Web", facebook: "Facebook", receivedSubject: "Hemos recibido tu pedido", receivedLead: ["Gracias por tu pedido en Nancy's Castalla.", "Primero comprobaremos si todos los productos están disponibles.", "Cuando el pedido esté completo recibirás las instrucciones de pago por WhatsApp o correo electrónico.", "Después de recibir el pago prepararemos tu pedido."], confirmedSubject: "Tu pedido está confirmado", confirmed: ["Hemos comprobado todos los productos.", "Recibirás las instrucciones para pagar por Bizum o transferencia bancaria."], paidSubject: "Pago recibido", paid: ["Gracias.", "Vamos a preparar tu pedido."], readySubject: "Listo para recoger", ready: ["Tu pedido está listo para recoger."], shippedSubject: "Tu pedido está en camino", shipped: ["Tu pedido está en camino."], deliveredSubject: "Pedido entregado", delivered: ["Tu pedido ha sido entregado. Gracias."], cancelledSubject: "Pedido cancelado", cancelled: ["Tu pedido ha sido cancelado. Contacta con nosotros si tienes preguntas."], orderSummary: "Tu pedido", orderNumber: "Número de pedido", total: "Total", fulfilment: "Recogida o entrega", paymentMethod: "Método de pago", products: "Productos", paymentInfo: "Información de pago", paymentInfoBody: "No tienes que pagar todavía. Nancy's Castalla comprobará primero la disponibilidad y después enviará las instrucciones para Bizum, transferencia bancaria o pago en efectivo.", product: "Producto", package: "Formato", quantity: "Cantidad", lineTotal: "Total línea", preheader: "Nancy's Castalla confirma tu solicitud y comprueba disponibilidad.", footerLine: "Productos internacionales, café, pan y prepedidos en Castalla." },
  sv: { greeting: "Hej", questions: "Frågor?", whatsapp: "WhatsApp", email: "E-post", website: "Webbplats", facebook: "Facebook", receivedSubject: "Vi har tagit emot din beställning", receivedLead: ["Tack för din beställning hos Nancy's Castalla.", "Vi kontrollerar först att alla produkter är tillgängliga.", "När beställningen är komplett får du betalningsinstruktioner via WhatsApp eller e-post.", "När betalningen är mottagen förbereder vi din beställning."], confirmedSubject: "Din beställning är bekräftad", confirmed: ["Vi har kontrollerat alla produkter.", "Du får betalningsinstruktioner för Bizum eller banköverföring."], paidSubject: "Betalning mottagen", paid: ["Tack.", "Vi börjar nu förbereda din beställning."], readySubject: "Klar för avhämtning", ready: ["Din beställning är klar för avhämtning."], shippedSubject: "Din beställning är på väg", shipped: ["Din beställning är på väg."], deliveredSubject: "Beställningen är levererad", delivered: ["Din beställning har levererats. Tack."], cancelledSubject: "Beställningen är avbruten", cancelled: ["Din beställning har avbrutits. Kontakta oss om du har frågor."], orderSummary: "Din beställning", orderNumber: "Ordernummer", total: "Totalt", fulfilment: "Avhämtning eller leverans", paymentMethod: "Betalningsmetod", products: "Produkter", paymentInfo: "Betalningsinformation", paymentInfoBody: "Du behöver inte betala ännu. Nancy's Castalla kontrollerar först tillgänglighet och skickar sedan betalningsinstruktioner för Bizum, banköverföring eller kontant betalning.", product: "Produkt", package: "Förpackning", quantity: "Antal", lineTotal: "Radtotal", preheader: "Nancy's Castalla bekräftar din beställningsförfrågan och kontrollerar tillgänglighet.", footerLine: "Internationella livsmedel, kaffe, bröd och förbeställningar i Castalla." },
};

type SendEmailOptions = {
  attachments?: Array<{ filename: string; content: string }>;
  html?: string;
  replyTo?: string;
  includeListUnsubscribe?: boolean;
};

function copyFor(locale?: string) { return mailCopy[isLocale(locale) ? locale : "en"]; }
function localeFor(locale?: string): Locale { return isLocale(locale) ? locale : "en"; }
function firstName(name: string) { return name.trim().split(/\s+/)[0] || name; }
function siteUrl() { return (env.siteUrl || "https://www.nancys.es").replace(/\/$/, ""); }
function logoUrl() { return `${siteUrl()}/nancys-castalla-logo.jpg`; }
function whatsappUrl() { return `https://wa.me/${businessConfig.whatsappNumber.replace(/\D/g, "")}`; }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char)); }
function senderFrom() { return `Nancy's Castalla <${env.orderEmail || businessConfig.orderEmail}>`; }
function defaultReplyTo() { return businessConfig.emails.info; }
function textFooter(copy: MailCopy) {
  return [
    "",
    copy.questions,
    `${copy.whatsapp}: ${businessConfig.displayWhatsappNumber} (${whatsappUrl()})`,
    `${copy.email}: ${businessConfig.emails.info}`,
    `${copy.website}: ${siteUrl()}`,
    `${copy.facebook}: ${businessConfig.social.facebookUrl}`,
    "",
    businessConfig.businessName,
    businessConfig.address,
  ].join("\n");
}

function orderLinesText(input: OrderEmailInput, locale: Locale) {
  return input.lines.map((line) => `${line.quantity} x ${translateProductName(line.name, locale)} (${line.packageLabel || line.unit}) - ${formatEuro(line.salePriceInclVat * line.quantity)}`).join("\n");
}

function productRows(input: OrderEmailInput, locale: Locale, copy: MailCopy) {
  const headerStyle = "padding:11px 10px;background:#0d2f22;color:#f7efd9;font-size:12px;text-transform:uppercase;letter-spacing:.06em;";
  const cellStyle = "padding:12px 10px;border-bottom:1px solid #eee4cf;color:#0d2f22;font-size:14px;line-height:1.4;";
  const rows = input.lines.map((line) => `<tr>
    <td style="${cellStyle}"><strong>${escapeHtml(translateProductName(line.name, locale))}</strong>${line.productId ? `<br><span style="color:#6d7c70;font-size:12px;">${escapeHtml(line.productId)}</span>` : ""}</td>
    <td style="${cellStyle}">${escapeHtml(line.packageLabel || line.unit)}</td>
    <td align="center" style="${cellStyle}">${line.quantity}</td>
    <td align="right" style="${cellStyle}font-weight:700;">${formatEuro(line.salePriceInclVat * line.quantity)}</td>
  </tr>`).join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #eee4cf;">
    <thead><tr><th align="left" style="${headerStyle}">${escapeHtml(copy.product)}</th><th align="left" style="${headerStyle}">${escapeHtml(copy.package)}</th><th align="center" style="${headerStyle}">${escapeHtml(copy.quantity)}</th><th align="right" style="${headerStyle}">${escapeHtml(copy.lineTotal)}</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function actionButton(href: string, label: string, filled = true) {
  const bg = filled ? "#0d2f22" : "#fffaf0";
  const color = filled ? "#f7efd9" : "#0d2f22";
  const border = filled ? "#0d2f22" : "#d7c69a";
  return `<a href="${href}" style="display:inline-block;margin:4px 6px 4px 0;background:${bg};color:${color};border:1px solid ${border};border-radius:999px;padding:11px 16px;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(label)}</a>`;
}

function infoGrid(items: Array<[string, string]>) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;border-collapse:collapse;background:#f7efd9;border-radius:10px;overflow:hidden;">
    ${items.map(([label, value]) => `<tr><td style="padding:10px 14px;border-bottom:1px solid #eadfca;color:#6d4b1f;font-size:13px;font-weight:700;">${escapeHtml(label)}</td><td align="right" style="padding:10px 14px;border-bottom:1px solid #eadfca;color:#0d2f22;font-size:14px;font-weight:700;">${escapeHtml(value)}</td></tr>`).join("")}
  </table>`;
}

function emailShell(title: string, intro: string[], content: string, copy: MailCopy, preheader = copy.preheader) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#fbf7ed;font-family:Arial,Helvetica,sans-serif;color:#0d2f22;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fbf7ed;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fffaf0;border:1px solid #eadfca;border-radius:14px;overflow:hidden;box-shadow:0 18px 45px rgba(13,47,34,.08);">
        <tr>
          <td style="background:#0d2f22;padding:20px 24px;color:#f7efd9;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
              <td width="72"><img src="${logoUrl()}" width="58" height="58" alt="Nancy's Castalla" style="display:block;border-radius:50%;border:2px solid #d7a84d;"></td>
              <td><div style="font-family:Georgia,serif;font-size:26px;line-height:1.1;font-weight:700;">Nancy's Castalla</div><div style="margin-top:4px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#e8d9a8;">International foods & pre-orders</div></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 28px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#0d2f22;">${escapeHtml(title)}</h1>
            ${intro.map((line) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.55;color:#244538;">${escapeHtml(line)}</p>`).join("")}
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f7efd9;padding:22px 28px;border-top:1px solid #eadfca;">
            <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:21px;font-weight:700;color:#0d2f22;">${escapeHtml(copy.questions)}</p>
            <p style="margin:0 0 14px;color:#244538;font-size:14px;">${escapeHtml(copy.footerLine)}</p>
            ${actionButton(whatsappUrl(), `${copy.whatsapp}: ${businessConfig.displayWhatsappNumber}`)}
            ${actionButton(`mailto:${businessConfig.emails.info}`, `${copy.email}: ${businessConfig.emails.info}`, false)}
            ${actionButton(siteUrl(), copy.website, false)}
            ${actionButton(businessConfig.social.facebookUrl, copy.facebook, false)}
          </td>
        </tr>
        <tr>
          <td style="background:#0d2f22;padding:18px 28px;color:#f7efd9;font-size:12px;line-height:1.6;">
            <strong>${businessConfig.businessName}</strong><br>
            ${businessConfig.address}<br>
            ${businessConfig.emails.info} | ${businessConfig.displayWhatsappNumber}<br>
            <span style="color:#d7c69a;">This transactional email was sent about your Nancy's Castalla order or invoice.</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, text: string, idempotencyKey: string, options: SendEmailOptions = {}) {
  if (!hasEmailProvider()) return { sent: false, skipped: true };
  try {
    const headers: Record<string, string> = {
      "X-Entity-Ref-ID": idempotencyKey,
    };
    if (options.includeListUnsubscribe) {
      headers["List-Unsubscribe"] = `<mailto:${businessConfig.emails.info}?subject=Email%20preferences>, <${siteUrl()}/privacy>`;
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        from: senderFrom(),
        to,
        subject,
        text,
        reply_to: options.replyTo || defaultReplyTo(),
        headers,
        ...(options.html ? { html: options.html } : {}),
        ...(options.attachments ? { attachments: options.attachments } : {}),
      }),
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
  const subject = `Factura Nancy's Castalla / Invoice Nancy's Castalla - ${input.invoiceNumber}`;
  const lines = ["Beste klant / Estimado cliente / Dear customer,", "", "In de bijlage vindt u de factuur voor uw bestelling.", "Adjuntamos la factura correspondiente a su pedido.", "Please find the invoice for your order attached.", "", `Factura / Invoice: ${input.invoiceNumber}`, `Pedido / Order: ${input.orderNumber}`, "", "Gracias por su compra.", "Thank you for your order.", textFooter(copy)].join("\n");
  const content = `${infoGrid([["Factura / Invoice", input.invoiceNumber], ["Pedido / Order", input.orderNumber]])}<div style="margin-top:20px;padding:18px;background:#fff;border:1px solid #eadfca;border-radius:10px;"><strong style="display:block;margin-bottom:8px;color:#0d2f22;">Factura adjunta / Invoice attached</strong><p style="margin:0;color:#244538;line-height:1.55;">In de bijlage vindt u de factuur voor uw bestelling.<br>Adjuntamos la factura correspondiente a su pedido.<br>Please find the invoice for your order attached.</p></div>`;
  const html = emailShell(`Factura / Invoice ${input.invoiceNumber}`, ["Gracias por su compra. Thank you for your order."], content, copy, `Factura / Invoice ${input.invoiceNumber}`);
  return sendEmail(input.customerEmail, subject, lines, `${input.invoiceId}-invoice-v4`, {
    attachments: [{ filename: `${input.invoiceNumber}.pdf`, content: Buffer.from(input.pdf).toString("base64") }],
    html,
  });
}

export async function sendOrderEmails(input: OrderEmailInput) {
  const locale = localeFor(input.locale);
  const copy = copyFor(input.locale);
  const adminCopy = mailCopy.en;
  const adminBody = [`New order request: ${input.orderId}`, "", `Customer: ${input.customerName}`, `Email: ${input.customerEmail}`, `Phone: ${input.customerPhone || "Not provided"}`, `Fulfillment: ${input.fulfillment}`, `Payment method: ${paymentMethodLabel(input.paymentMethod, "en")}`, "", orderLinesText(input, "en"), "", `Total: ${formatEuro(input.total)}`, `Notes: ${input.notes || "None"}`, textFooter(adminCopy)].join("\n");
  const adminHtml = emailShell(`New order ${input.orderId}`, [`Customer: ${input.customerName}`, `Email: ${input.customerEmail}`, `Phone: ${input.customerPhone || "Not provided"}`], `${productRows(input, "en", adminCopy)}${infoGrid([["Order", input.orderId], ["Total", formatEuro(input.total)], ["Fulfillment", input.fulfillment], ["Payment method", paymentMethodLabel(input.paymentMethod, "en")], ["Notes", input.notes || "None"]])}`, adminCopy, `New order request ${input.orderId}`);
  const customerText = [`${copy.greeting} ${firstName(input.customerName)},`, "", ...copy.receivedLead, "", `${copy.products}:`, orderLinesText(input, locale), "", `${copy.orderNumber}: ${input.orderId}`, `${copy.total}: ${formatEuro(input.total)}`, `${copy.fulfilment}: ${input.fulfillment}`, `${copy.paymentMethod}: ${paymentMethodLabel(input.paymentMethod, locale)}`, "", `${copy.paymentInfo}: ${copy.paymentInfoBody}`, textFooter(copy)].join("\n");
  const summary = `<h2 style="margin:26px 0 12px;font-family:Georgia,serif;font-size:22px;color:#0d2f22;">${escapeHtml(copy.orderSummary)}</h2>${productRows(input, locale, copy)}${infoGrid([[copy.orderNumber, input.orderId], [copy.total, formatEuro(input.total)], [copy.fulfilment, input.fulfillment], [copy.paymentMethod, paymentMethodLabel(input.paymentMethod, locale)]])}<div style="margin-top:18px;padding:16px;background:#fff;border:1px solid #eadfca;border-radius:10px;"><strong style="display:block;margin-bottom:8px;color:#0d2f22;">${escapeHtml(copy.paymentInfo)}</strong><p style="margin:0;color:#244538;line-height:1.55;">${escapeHtml(copy.paymentInfoBody)}</p></div>`;
  const customerHtml = emailShell(copy.receivedSubject, [`${copy.greeting} ${firstName(input.customerName)},`, ...copy.receivedLead], summary, copy);
  const [admin, customer] = await Promise.all([
    sendEmail(env.orderEmail || businessConfig.orderEmail, `New order ${input.orderId}`, adminBody, `${input.orderId}-new-admin-v3`, { html: adminHtml, replyTo: input.customerEmail }),
    sendEmail(input.customerEmail, `${copy.receivedSubject} - ${input.orderId}`, customerText, `${input.orderId}-new-customer-v3`, { html: customerHtml }),
  ]);
  return { admin, customer, sent: admin.sent && customer.sent };
}

export async function sendOrderStatusEmail(input: { orderId: string; customerName: string; customerEmail: string; status: string; locale?: string }) {
  const copy = copyFor(input.locale);
  const key = input.status === "ready_for_collection" ? "ready" : input.status === "shipped" ? "shipped" : input.status === "delivered" ? "delivered" : input.status === "cancelled" ? "cancelled" : input.status === "paid" ? "paid" : "confirmed";
  const subject = copy[`${key}Subject` as keyof MailCopy] as string;
  const lines = copy[key as keyof MailCopy] as string[];
  const text = [`${copy.greeting} ${firstName(input.customerName)},`, "", ...lines, "", `${copy.orderNumber}: ${input.orderId}`, textFooter(copy)].join("\n");
  const html = emailShell(subject, [`${copy.greeting} ${firstName(input.customerName)},`, ...lines], infoGrid([[copy.orderNumber, input.orderId]]), copy, `${subject} - ${input.orderId}`);
  return sendEmail(input.customerEmail, `${subject} - ${input.orderId}`, text, `${input.orderId}-status-${input.status}-v3`, { html });
}
