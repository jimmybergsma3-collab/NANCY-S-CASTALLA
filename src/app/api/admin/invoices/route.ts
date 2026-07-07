import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { sendInvoiceEmail } from "@/lib/email";
import { createInvoicePdf } from "@/services/invoices/invoice-pdf";
import { createInvoiceFromOrder, getInvoice, invoiceLabel, InvoiceError, listInvoices, markInvoiceEmailed } from "@/services/invoices/invoice-service";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ invoices: await listInvoices() });
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { action?: "create" | "email"; orderId?: string; invoiceId?: string };
  try {
    if (body.action === "create" && body.orderId) return NextResponse.json({ invoice: await createInvoiceFromOrder(body.orderId) });
    if (body.action === "email" && body.invoiceId) {
      const invoice = await getInvoice(body.invoiceId);
      if (!invoice) return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
      const result = await sendInvoiceEmail({
        invoiceId: invoice.id, invoiceNumber: invoiceLabel(invoice),
        orderNumber: invoice.order_number ? `NC-${String(invoice.order_number).padStart(6, "0")}` : invoice.order_id,
        customerName: invoice.customer_name, customerEmail: invoice.customer_email,
        pdf: await createInvoicePdf(invoice),
      });
      if (result.sent) await markInvoiceEmailed(invoice.id);
      return NextResponse.json({ invoice: await getInvoice(invoice.id), email: result }, { status: result.sent || result.skipped ? 200 : 502 });
    }
    return NextResponse.json({ message: "Invalid invoice action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Invoice action failed." }, { status: error instanceof InvoiceError ? error.status : 500 });
  }
}
