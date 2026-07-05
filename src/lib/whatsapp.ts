import { businessConfig } from "@/config/business";
import type { Product } from "@/types/product";
import type { Locale } from "@/i18n/config";
import { getUiCopy } from "@/i18n/ui";

export type CartLine = {
  product: Product;
  quantity: number;
  unit?: string;
  salePriceInclVat?: number;
};

export function buildWhatsAppMessage(lines: CartLine[], fulfillment: "Collection" | "Local delivery", locale: Locale) {
  const copy = getUiCopy(locale).whatsappMessage;
  const selected = lines.filter((line) => line.quantity > 0);
  const total = selected.reduce((sum, line) => sum + (line.salePriceInclVat ?? line.product.salePriceInclVat) * line.quantity, 0);
  const productLines = selected
    .map((line) => `- ${line.quantity} x ${line.product.name} (${line.unit ?? line.product.unit})`)
    .join("\n");

  return [
    `${copy.greeting} ${businessConfig.businessName},`,
    "",
    copy.preOrder,
    productLines || `- ${copy.availability}`,
    "",
    `${copy.preferredOption}: ${fulfillment === "Collection" ? copy.collection : copy.localDelivery}`,
    `${copy.total}: €${total.toFixed(2)}`,
    "",
    copy.payment,
    copy.name,
    copy.preferredTime,
    copy.address,
  ].join("\n");
}

export function buildWhatsAppUrl(message: string) {
  const phone = businessConfig.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
