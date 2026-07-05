export const businessEmails = {
  info: "info@nancys.es",
  orders: "orders@nancys.es",
  account: "account@nancys.es",
} as const;

export const businessConfig = {
  businessName: "Nancy's Castalla",
  phaseLabel: "Starting soon / pre-order phase",
  address: "Calle Murcia 111, 03420 Castalla",
  whatsappNumber: "+34644059769",
  displayWhatsappNumber: "+34 644 05 97 69",
  emails: businessEmails,
  orderEmail: businessEmails.orders,
  fromEmail: `Nancy's Castalla <${businessEmails.orders}>`,
  bankAccount: "Add bank account details here",
  bizumNumber: "+34 694 26 93 89",
  deliveryMinimum: 25,
  deliveryRadiusKm: 15,
  deliveryFee: 3.5,
  whatsappCtaLabel: "Order support",
  openingTexts: {
    headline: "International food, coffee and pre-orders for expats around Castalla.",
    shortIntro:
      "A warm small-stock market concept with Dutch, British, Irish, European and South American favourites, plus bread by pre-order and local delivery when possible.",
    preorderNote:
      "Bread is available by pre-order when minimum demand is reached.",
    stockNote:
      "Nancy's Castalla starts with small stock, pre-orders, WhatsApp ordering, collection in Castalla and local delivery when possible.",
  },
  seoKeywords: [
    "international food Castalla",
    "British food Castalla",
    "Dutch snacks Castalla",
    "expat food Castalla",
    "bread order Castalla",
  ],
} as const;

export type BusinessConfig = typeof businessConfig;
