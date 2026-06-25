import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { hasSupabaseAdmin } from "@/lib/env";
import { supabaseAdminFetch } from "@/lib/supabase-rest";

type OrderBody = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  fulfillment?: string;
  notes?: string;
  total?: number;
  lines?: Array<{
    productId: string;
    name: string;
    quantity: number;
    unit: string;
    packageLabel?: string;
    packageQuantity?: number;
    salePriceInclVat: number;
  }>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as OrderBody;

  if (!body.customerName || !body.customerEmail || !body.lines?.length) {
    return NextResponse.json({ ok: false, message: "Name, email and at least one product are required." }, { status: 400 });
  }

  const orderId = `NC-${Date.now()}`;
  const total = Number(body.total ?? 0);

  if (hasSupabaseAdmin()) {
    await supabaseAdminFetch("orders", {
      method: "POST",
      body: {
        id: orderId,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone ?? "",
        fulfillment: body.fulfillment ?? "Collection",
        notes: body.notes ?? "",
        total,
        status: "new",
      },
    });

    await supabaseAdminFetch("order_items", {
      method: "POST",
      body: body.lines.map((line) => ({
        order_id: orderId,
        product_id: line.productId,
        product_name: line.name,
        quantity: line.quantity,
        unit: line.unit,
        package_label: line.packageLabel ?? "",
        package_quantity: line.packageQuantity ?? 1,
        sale_price_incl_vat: line.salePriceInclVat,
      })),
    });
  }

  await sendOrderEmails({
    orderId,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    fulfillment: body.fulfillment ?? "Collection",
    notes: body.notes,
    total,
    lines: body.lines,
  });

  return NextResponse.json({
    ok: true,
    orderId,
    stored: hasSupabaseAdmin(),
    emailed: Boolean(process.env.RESEND_API_KEY),
  });
}
