import { businessConfig } from "@/config/business";
import type { PaymentProvider } from "./types";

export const paymentProviders: PaymentProvider[] = [
  {
    id: "bizum",
    label: "Bizum",
    active: true,
    instructions: `Bizum details are confirmed by WhatsApp. Current Bizum number: ${businessConfig.bizumNumber}.`,
  },
  {
    id: "bank-transfer",
    label: "Bank transfer",
    active: true,
    instructions: `Bank details are confirmed after order review. Current setting: ${businessConfig.bankAccount}.`,
  },
  {
    id: "cash-collection",
    label: "Cash on collection",
    active: true,
    instructions: "Pay in cash when collecting your order in Castalla.",
  },
  {
    id: "cash-delivery",
    label: "Cash on delivery",
    active: true,
    instructions: "Pay in cash when your local delivery is handed over.",
  },
  {
    id: "stripe",
    label: "Card payment",
    active: false,
    instructions: "Prepared for a future Stripe checkout integration, not active in version 1.",
  },
];
