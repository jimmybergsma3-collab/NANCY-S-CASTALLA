export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "ready_for_collection"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type PaymentMethod = "bizum" | "bank-transfer" | "cash" | "card" | "pending";

export type InvoiceSummary = {
  id: string;
  invoice_number: number;
  invoice_series?: string;
  invoice_series_year?: number;
  invoice_series_number?: number;
  is_test?: boolean;
  archived_at?: string;
  status: string;
  email_sent_at?: string;
  issued_at?: string;
  created_at?: string;
};

export type BackofficeCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  language: string;
  auth_user_id?: string | null;
  created_at?: string;
  archived_at?: string | null;
  is_test?: boolean;
  test_reason?: string;
  order_count?: number;
  invoice_count?: number;
};

export type BackofficeOrderItem = {
  id: number;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  package_label: string;
  package_quantity: number;
  sale_price_incl_vat: number;
  vat_rate: number;
  line_total_incl_vat: number;
  line_total_ex_vat: number;
};

export type OrderLineInput = {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  packageLabel?: string;
  packageQuantity?: number;
  salePriceInclVat: number;
};

export type OrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  fulfillment?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  total?: number;
  lines: OrderLineInput[];
  idempotencyKey?: string;
  authUserId?: string;
  locale?: string;
};

export type BackofficeOrder = {
  id: string;
  uuid?: string;
  order_number?: number;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  fulfillment: string;
  notes: string;
  subtotal_ex_vat: number;
  vat_total: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  is_test?: boolean;
  test_reason?: string;
  archived_at?: string;
  inventory_committed?: boolean;
  delivery_method: string;
  created_at: string;
  updated_at?: string;
  customer?: BackofficeCustomer;
  order_items: BackofficeOrderItem[];
  invoices?: InvoiceSummary[];
};

export type BackofficeInvoiceItem = {
  id: number;
  invoice_id: string;
  product_id?: string;
  product_name: string;
  package_label: string;
  quantity: number;
  unit_price_incl_vat: number;
  vat_rate: number;
  line_total_ex_vat: number;
  line_vat: number;
  line_total_incl_vat: number;
};

export type BackofficeInvoice = InvoiceSummary & {
  order_id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: string;
  customer_language: string;
  customer_fiscal_id?: string;
  customer_company_name?: string;
  customer_fiscal_address?: string;
  order_number?: number;
  payment_method?: string;
  total_ex_vat: number;
  total_vat: number;
  total_incl_vat: number;
  issued_at: string;
  created_at: string;
  invoice_items: BackofficeInvoiceItem[];
};
