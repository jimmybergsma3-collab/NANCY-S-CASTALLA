import { businessConfig } from "@/config/business";
import { env, hasEmailProvider } from "./env";
import { formatEuro } from "./pricing";

export type OrderEmailInput = {
  orderId: string; customerName: string; customerEmail: string; customerPhone?: string;
  fulfillment: string; notes?: string; total: number;
  lines: Array<{ name: string; quantity: number; unit: string; packageLabel?: string; packageQuantity?: number; salePriceInclVat: number }>;
};

function orderLinesText(input: OrderEmailInput) { return input.lines.map((line) => `${line.quantity} x ${line.name} (${line.unit}) - ${formatEuro(line.salePriceInclVat * line.quantity)}`).join("\n"); }

async function sendEmail(to: string, subject: string, text: string, idempotencyKey: string) {
  if (!hasEmailProvider()) return { sent: false, skipped: true };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ from: env.fromEmail || businessConfig.fromEmail, to, subject, text }),
  });
  if (!response.ok) return { sent: false, skipped: false, error: await response.text() };
  return { sent: true, skipped: false };
}

export async function sendOrderEmails(input: OrderEmailInput) {
  const adminBody = [`New order request: ${input.orderId}`, "", `Customer: ${input.customerName}`, `Email: ${input.customerEmail}`, `Phone: ${input.customerPhone || "Not provided"}`, `Fulfillment: ${input.fulfillment}`, "", orderLinesText(input), "", `Total: ${formatEuro(input.total)}`, `Notes: ${input.notes || "None"}`].join("\n");
  const customerBody = [`Hello ${input.customerName},`, "", `Thank you for your order request with ${businessConfig.businessName}.`, "We will confirm availability and payment instructions before anything is final.", "", orderLinesText(input), "", `Estimated total: ${formatEuro(input.total)}`, `Preferred option: ${input.fulfillment}`, "", "Payment options after confirmation: Bizum, bank transfer, cash on collection or cash on delivery.", "", businessConfig.businessName].join("\n");
  const [admin, customer] = await Promise.all([
    sendEmail(env.orderEmail || businessConfig.orderEmail, `New order ${input.orderId}`, adminBody, `${input.orderId}-new-admin`),
    sendEmail(input.customerEmail, `Order request received - ${businessConfig.businessName}`, customerBody, `${input.orderId}-new-customer`),
  ]);
  return { admin, customer, sent: admin.sent && customer.sent };
}

export async function sendOrderStatusEmail(input: { orderId: string; customerName: string; customerEmail: string; status: string }) {
  const readableStatus = input.status.replaceAll("_", " ");
  const text = [`Hello ${input.customerName},`, "", `Your order ${input.orderId} is now: ${readableStatus}.`, "", "Questions? Reply to this email or contact us via WhatsApp.", "", businessConfig.businessName].join("\n");
  return sendEmail(input.customerEmail, `Order ${input.orderId}: ${readableStatus}`, text, `${input.orderId}-status-${input.status}`);
}
