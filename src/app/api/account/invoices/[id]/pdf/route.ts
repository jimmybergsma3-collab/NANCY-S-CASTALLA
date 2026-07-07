import { NextResponse } from "next/server";
import { getCustomerAuthUser } from "@/lib/customer-auth";
import { createInvoicePdf } from "@/services/invoices/invoice-pdf";
import { getCustomerInvoice, invoiceLabel } from "@/services/invoices/invoice-service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCustomerAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const invoice = await getCustomerInvoice((await params).id, user.id);
  if (!invoice) return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
  return new Response(Buffer.from(await createInvoicePdf(invoice)), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${invoiceLabel(invoice)}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
