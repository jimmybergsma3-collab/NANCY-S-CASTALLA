import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { sendInvoiceEmail } from "@/lib/email";
import { logAdminAction } from "@/services/admin/audit-service";
import { createInvoicePdf } from "@/services/invoices/invoice-pdf";
import { archiveInvoice, createInvoiceFromOrder, getInvoice, invoiceLabel, InvoiceError, listInvoices, markInvoiceEmailed, markInvoiceTest } from "@/services/invoices/invoice-service";

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ invoices: await listInvoices() });
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { action?: "create" | "email" | "mark_test" | "archive"; orderId?: string; invoiceId?: string; isTest?: boolean; archived?: boolean };
  try {
    if (body.action === "create" && body.orderId) {
      const invoice = await createInvoiceFromOrder(body.orderId);
      await logAdminAction({ recordType: "invoice", recordId: invoice.id, action: "create_from_order", metadata: { orderId: body.orderId } });
      return NextResponse.json({ invoice });
    }
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
      await logAdminAction({ recordType: "invoice", recordId: invoice.id, action: "email_customer", metadata: { sent: result.sent, skipped: result.skipped } });
      return NextResponse.json({ invoice: await getInvoice(invoice.id), email: result }, { status: result.sent || result.skipped ? 200 : 502 });
    }
    if (body.action === "mark_test" && body.invoiceId) {
      const invoice = await markInvoiceTest(body.invoiceId, Boolean(body.isTest));
      await logAdminAction({ recordType: "invoice", recordId: body.invoiceId, action: body.isTest ? "mark_test" : "unmark_test" });
      return NextResponse.json({ invoice });
    }
    if (body.action === "archive" && body.invoiceId) {
      const invoice = await archiveInvoice(body.invoiceId, Boolean(body.archived));
      await logAdminAction({ recordType: "invoice", recordId: body.invoiceId, action: body.archived ? "archive" : "restore" });
      return NextResponse.json({ invoice });
    }
    return NextResponse.json({ message: "Invalid invoice action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Invoice action failed." }, { status: error instanceof InvoiceError ? error.status : 500 });
  }
}
