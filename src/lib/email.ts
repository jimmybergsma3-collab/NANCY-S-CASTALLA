import { businessConfig } from "@/config/business";
import { env, hasEmailProvider } from "./env";
import { formatEuro } from "./pricing";

export type OrderEmailInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  fulfillment: string;
  notes?: string;
  total: number;
  lines: Array<{
    name: string;
    quantity: number;
    unit: string;
    packageLabel?: string;
    packageQuantity?: number;
    salePriceInclVat: number;
  }>;
};

function orderLinesText(input: OrderEmailInput) {
  return input.lines
    .map((line) => `${line.quantity} x ${line.name} (${line.unit}) - ${formatEuro(line.salePriceInclVat * line.quantity)}`)
    .join("\n");
}

async function sendEmail(to: string, subject: string, text: string) {
  if (!hasEmailProvider()) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.fromEmail || businessConfig.fromEmail,
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function sendOrderEmails(input: OrderEmailInput) {
  const adminBody = [
    `New order request: ${input.orderId}`,
    "",
    `Customer: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    `Phone: ${input.customerPhone || "Not provided"}`,
    `Fulfillment: ${input.fulfillment}`,
    "",
    orderLinesText(input),
    "",
    `Total: ${formatEuro(input.total)}`,
    `Notes: ${input.notes || "None"}`,
  ].join("\n");

  const customerBody = [
    `Hello ${input.customerName},`,
    "",
    `Thank you for your order request with ${businessConfig.businessName}.`,
    "We will confirm availability and payment instructions before anything is final.",
    "",
    orderLinesText(input),
    "",
    `Estimated total: ${formatEuro(input.total)}`,
    `Preferred option: ${input.fulfillment}`,
    "",
    "Payment options after confirmation: Bizum, bank transfer, cash on collection or cash on delivery.",
    "",
    businessConfig.businessName,
  ].join("\n");

  await sendEmail(env.orderEmail || businessConfig.orderEmail, `New order ${input.orderId}`, adminBody);
  await sendEmail(input.customerEmail, `Order request received - ${businessConfig.businessName}`, customerBody);
}
