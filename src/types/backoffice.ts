export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "ready_for_collection"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

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
};

export type BackofficeOrder = {
  id: string;
  uuid?: string;
  order_number?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_method: string;
  created_at: string;
  order_items?: Array<Record<string, unknown>>;
};
