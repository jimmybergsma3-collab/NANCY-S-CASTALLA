export type PaymentMethod = "bizum" | "bank-transfer" | "cash-collection" | "cash-delivery" | "card-later";

export type PaymentProvider = {
  id: string;
  label: string;
  active: boolean;
  instructions: string;
};
