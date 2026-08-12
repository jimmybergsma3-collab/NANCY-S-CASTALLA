# Nancy's Castalla Purchasing And Supplier Invoice Report

Date: 2026-08-12

## Summary

The backoffice now has a supplier purchasing workflow ready for manual Supabase migration:

- create supplier purchase orders;
- upload supplier invoices to a private Supabase Storage bucket;
- read supplier invoice files best-effort without external OCR secrets;
- review supplier invoices separately from customer invoices;
- create goods receipts;
- update product stock only when a goods receipt is explicitly processed;
- view sales and purchase IVA reporting, with test sales excluded by default.

No production migration has been executed from Codex.
No production product, order, customer, invoice, stock or supplier data was changed by this implementation.

## Manual Migration

Run this file manually in Supabase before using the new purchasing screens in production:

`supabase/migrations/202608120001_purchasing_supplier_invoice_workflow.sql`

The migration adds:

- private Storage bucket `supplier-invoices`;
- purchase order line support;
- supplier invoice records and line records;
- goods receipt records and line records;
- purchase price history;
- supplier receipt references on inventory movements;
- `process_goods_receipt_for_admin`, which applies stock changes transactionally.

## Admin Routes

After the migration is applied, test:

- `/nl/admin/purchasing`
- `/nl/admin/inventory`
- `/nl/admin/reports`

## Safety Rules

- Supplier invoices are not customer invoices.
- Supplier invoice files are private and not publicly exposed.
- Stock is not changed when creating a purchase order.
- Stock is not changed when uploading a supplier invoice.
- Stock is changed only by processing a goods receipt.
- Existing inventory movements are not deleted by this flow.
- Sales reporting excludes invoice numbers starting with `TEST-` by default.
- No service role key is sent to the browser.

## Verification Checklist

- Confirm the migration was applied in Supabase.
- Confirm the `supplier-invoices` Storage bucket is private.
- Create a test purchase order from existing supplier offers.
- Upload a supplier invoice PDF or image.
- Create a goods receipt.
- Process the goods receipt and verify stock increases once.
- Verify `/nl/admin/inventory` shows the new movement.
- Verify `/nl/admin/reports` separates sales IVA from purchase IVA.
