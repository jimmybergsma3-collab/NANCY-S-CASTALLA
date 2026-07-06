export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "ready_for_collection"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type BackofficeCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  language: string;
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
  notes?: string;
  total?: number;
  lines: OrderLineInput[];
  idempotencyKey?: string;
  authUserId?: string;
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
  delivery_method: string;
  created_at: string;
  updated_at?: string;
  customer?: BackofficeCustomer;
  order_items: BackofficeOrderItem[];
};
