import { NextResponse } from "next/server";
import { getCustomerAuthUser } from "@/lib/customer-auth";
import { hasSupabaseAdmin } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

export async function GET(request: Request) {
  const user = await getCustomerAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasSupabaseAdmin()) return NextResponse.json({ message: "Account service is unavailable." }, { status: 503 });
  const customers = await supabaseAdminFetch<Array<{ id: string }>>(`customers?select=id&auth_user_id=eq.${user.id}&limit=1`);
  if (!customers[0]) return NextResponse.json({ orders: [] });
  const orders = await supabaseAdminFetch<Array<Record<string, unknown>>>(`orders?select=id,order_number,created_at,status,payment_status,fulfillment,delivery_method,notes,subtotal_ex_vat,vat_total,total,order_items(*),invoices(id,invoice_number,status,email_sent_at,issued_at)&customer_id=eq.${customers[0].id}&order=created_at.desc&limit=100`);
  return NextResponse.json({ orders });
}
