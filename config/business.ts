export const businessEmails = {
  info: "info@nancys.es",
  orders: "orders@nancys.es",
  account: "account@nancys.es",
} as const;

const configuredBusinessMode = process.env.BUSINESS_MODE === "live" ? "live" : "prelaunch";
const configuredInvoiceSeries = process.env.INVOICE_SERIES?.trim() || "NC";
const configuredInvoiceTestSeries = process.env.INVOICE_TEST_SERIES?.trim() || "TEST";

export const businessConfig = {
  businessName: "Nancy's Castalla",
  phaseLabel: "Starting soon / pre-order phase",
  address: "Calle Murcia 111, 03420 Castalla",
  fiscalName: "JIMMY BERGSMA",
  fiscalId: "Y8875740P",
  fiscalAddress: "Calle Murcia 111, 03420 Castalla",
  businessActivity: "Supermercado / Comercio al por menor de productos alimenticios",
  termsOwnerName: "JIMMY BERGSMA",
  whatsappNumber: "+34644059769",
  displayWhatsappNumber: "+34 644 05 97 69",
  emails: businessEmails,
  orderEmail: businessEmails.orders,
  fromEmail: `Nancy's Castalla <${businessEmails.orders}>`,
  businessMode: configuredBusinessMode,
  invoiceSeries: configuredInvoiceSeries,
  invoiceTestSeries: configuredInvoiceTestSeries,
  bankAccount: "NANCYS CASTALLA - IBAN ES89 2100 1460 6002 0010 3972 - BIC CAIXESBBXXX",
  bankAccountName: "NANCYS CASTALLA",
  bankIban: "ES89 2100 1460 6002 0010 3972",
  bankBic: "CAIXESBBXXX",
  bizumNumber: "+34 644 21 22 57",
  deliveryMinimum: 25,
  deliveryRadiusKm: 15,
  deliveryFee: 3.5,
  whatsappCtaLabel: "Order support",
  social: {
    facebookUrl: "https://www.facebook.com/p/Nancys-Castalla-61590879870532/",
  },
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
