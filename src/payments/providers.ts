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
    instructions: `Bank details are confirmed after order review. Account holder: ${businessConfig.bankAccountName}. IBAN: ${businessConfig.bankIban}. BIC: ${businessConfig.bankBic}.`,
  },
  {
    id: "stripe",
    label: "Card payment",
    active: false,
    instructions: "Prepared for a future Stripe checkout integration, not active in version 1.",
  },
];
