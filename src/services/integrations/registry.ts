export const integrationRegistry = [
  ["invoicing", "Invoicing"], ["pos", "POS / till"], ["sumup", "SumUp"],
  ["card-terminal", "Card terminals"], ["accounting", "Accounting"],
  ["suppliers", "Suppliers"], ["shipping", "Shipping services"],
  ["whatsapp-business", "WhatsApp Business"], ["email", "Email"],
  ["mobile-app", "Mobile app"], ["public-api", "Own API"],
].map(([id, name]) => ({ id, name, enabled: false, status: "Prepared" as const }));
