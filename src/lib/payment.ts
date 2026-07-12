import type { Locale } from "@/i18n/config";

export type PaymentMethod = "bizum" | "bank-transfer" | "cash" | "card" | "pending";

export const paymentMethods: PaymentMethod[] = ["bizum", "bank-transfer", "pending"];

const labels: Record<Locale, Record<PaymentMethod, string>> = {
  en: { bizum: "Bizum", "bank-transfer": "Bank transfer", cash: "Cash", card: "Card", pending: "Pending" },
  nl: { bizum: "Bizum", "bank-transfer": "Bankoverschrijving", cash: "Contant", card: "Kaart", pending: "Nog te kiezen" },
  de: { bizum: "Bizum", "bank-transfer": "Überweisung", cash: "Bar", card: "Karte", pending: "Noch offen" },
  es: { bizum: "Bizum", "bank-transfer": "Transferencia bancaria", cash: "Efectivo", card: "Tarjeta", pending: "Pendiente" },
  sv: { bizum: "Bizum", "bank-transfer": "Banköverföring", cash: "Kontant", card: "Kort", pending: "Väntar" },
};

export function normalizePaymentMethod(value?: string): PaymentMethod {
  return paymentMethods.includes(value as PaymentMethod) ? value as PaymentMethod : "pending";
}

export function paymentMethodLabel(value: string | undefined, locale: Locale = "en") {
  return labels[locale][normalizePaymentMethod(value)];
}
