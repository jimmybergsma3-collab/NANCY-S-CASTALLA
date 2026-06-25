import { businessConfig } from "@/config/business";
import type { Product } from "@/types/product";

export type CartLine = {
  product: Product;
  quantity: number;
  unit?: string;
  salePriceInclVat?: number;
};

export function buildWhatsAppMessage(lines: CartLine[], fulfillment: "Collection" | "Local delivery") {
  const selected = lines.filter((line) => line.quantity > 0);
  const total = selected.reduce((sum, line) => sum + (line.salePriceInclVat ?? line.product.salePriceInclVat) * line.quantity, 0);
  const productLines = selected
    .map((line) => `- ${line.quantity} x ${line.product.name} (${line.unit ?? line.product.unit})`)
    .join("\n");

  return [
    `Hello ${businessConfig.businessName},`,
    "",
    "I would like to place a pre-order:",
    productLines || "- I would like to ask about current availability.",
    "",
    `Preferred option: ${fulfillment}`,
    `Estimated product total: €${total.toFixed(2)}`,
    "",
    "Payment preference: Bizum / bank transfer / cash",
    "Name:",
    "Preferred collection or delivery time:",
    "Delivery address, if needed:",
  ].join("\n");
}

export function buildWhatsAppUrl(message: string) {
  const phone = businessConfig.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
