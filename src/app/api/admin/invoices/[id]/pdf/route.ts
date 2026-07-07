import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { createInvoicePdf } from "@/services/invoices/invoice-pdf";
import { getInvoice, invoiceLabel } from "@/services/invoices/invoice-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const invoice = await getInvoice((await params).id);
  if (!invoice) return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
  return new Response(Buffer.from(await createInvoicePdf(invoice)), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${invoiceLabel(invoice)}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
