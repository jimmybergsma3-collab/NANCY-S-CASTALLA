import { supabaseAdminFetch } from "@/lib/supabase-rest";
import type { BackofficeCustomer } from "@/types/backoffice";

export type CustomerDeleteCheck = {
  canDelete: boolean;
  reason: string;
  customer?: BackofficeCustomer;
};

function countByCustomerId(rows: Array<{ customer_id?: string | null }>) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    if (row.customer_id) counts.set(row.customer_id, (counts.get(row.customer_id) ?? 0) + 1);
  });
  return counts;
}

function isDiagnosticCustomer(customer: BackofficeCustomer) {
  const text = `${customer.name} ${customer.email} ${customer.test_reason ?? ""}`.toLowerCase();
  return (
    Boolean(customer.is_test) ||
    text.includes("codex test") ||
    text.includes("diagnostic") ||
    text.includes("invalid-token-test") ||
    text.includes("checkout-test") ||
    customer.email.endsWith("@example.com")
  );
}

export async function listAdminCustomers() {
  const [customers, orders, invoices] = await Promise.all([
    supabaseAdminFetch<BackofficeCustomer[]>(
      "customers?select=id,name,email,phone,address,language,auth_user_id,created_at,archived_at,is_test,test_reason&order=created_at.desc&limit=5000",
    ),
    supabaseAdminFetch<Array<{ customer_id?: string | null }>>("orders?select=customer_id&limit=5000"),
    supabaseAdminFetch<Array<{ customer_id?: string | null }>>("invoices?select=customer_id&limit=5000"),
  ]);
  const orderCounts = countByCustomerId(orders);
  const invoiceCounts = countByCustomerId(invoices);
  return customers.map((customer) => ({
    ...customer,
    is_test: isDiagnosticCustomer(customer),
    order_count: orderCounts.get(customer.id) ?? 0,
    invoice_count: invoiceCounts.get(customer.id) ?? 0,
  }));
}

export async function getCustomerDeleteCheck(id: string): Promise<CustomerDeleteCheck> {
  const customers = await supabaseAdminFetch<BackofficeCustomer[]>(
    `customers?select=id,name,email,phone,address,language,auth_user_id,created_at,archived_at,is_test,test_reason&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  const customer = customers[0];
  if (!customer) return { canDelete: false, reason: "Customer not found." };
  const [orders, invoices] = await Promise.all([
    supabaseAdminFetch<Array<{ id: string }>>(`orders?select=id&customer_id=eq.${encodeURIComponent(id)}&limit=1`),
    supabaseAdminFetch<Array<{ id: string }>>(`invoices?select=id&customer_id=eq.${encodeURIComponent(id)}&limit=1`),
  ]);
  const orderCount = orders.length;
  const invoiceCount = invoices.length;
  const enriched = { ...customer, order_count: orderCount, invoice_count: invoiceCount };
  if (customer.auth_user_id) return { canDelete: false, reason: "This customer has a login account. Archive only.", customer: enriched };
  if (orderCount > 0) return { canDelete: false, reason: "This customer has orders. Archive only.", customer: enriched };
  if (invoiceCount > 0) return { canDelete: false, reason: "This customer has invoices. Archive only.", customer: enriched };
  return { canDelete: true, reason: "This customer has no account, orders or invoices.", customer: enriched };
}

export async function archiveCustomer(id: string, archived: boolean) {
  const rows = await supabaseAdminFetch<BackofficeCustomer[]>(`customers?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { archived_at: archived ? new Date().toISOString() : null },
  });
  return rows[0];
}

export async function markCustomerTest(id: string, isTest: boolean, reason: string) {
  const rows = await supabaseAdminFetch<BackofficeCustomer[]>(`customers?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { is_test: isTest, test_reason: isTest ? reason.slice(0, 500) : "" },
  });
  return rows[0];
}

export async function deleteCustomerIfSafe(id: string, confirmation: string) {
  const check = await getCustomerDeleteCheck(id);
  if (!check.canDelete || !check.customer) throw new Error(check.reason);
  const normalized = confirmation.trim().toLowerCase();
  const matchesName = normalized === check.customer.name.trim().toLowerCase();
  const matchesEmail = normalized === check.customer.email.trim().toLowerCase();
  if (!matchesName && !matchesEmail) throw new Error("Confirmation must exactly match the customer name or email.");
  await supabaseAdminFetch(`customers?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", prefer: "return=minimal" });
}
