-- Keep Tindale products offline.
-- Business reason: Tindale orders require pickup in La Nucia, while Europ Foods delivers free.

create or replace function import_batch_is_offline_only(p_import_batch text)
returns boolean
language sql
immutable
as $$
  select coalesce(p_import_batch, '') ilike '%TINDALE%';
$$;

update products
   set product_status = 'draft',
       is_visible = false,
       featured = false,
       ready_for_publish = false,
       needs_package_review = true
 where (
       import_batch ilike '%TINDALE%'
       or supplier ilike '%Tindale%'
       or original_supplier_name ilike '%Tindale%'
     )
   and product_status in ('active', 'draft', 'disabled');

create or replace function publish_approved_import_batch(p_import_batch text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_blocked integer;
  v_count integer;
begin
  if coalesce(trim(p_import_batch), '') = '' then
    raise exception 'import_batch_required';
  end if;

  if import_batch_is_offline_only(p_import_batch) then
    raise exception 'import_batch_offline_only:%', p_import_batch;
  end if;

  select count(*) into v_blocked
    from products
   where import_batch = p_import_batch
     and product_status = 'draft'
     and (
       not ready_for_publish
       or needs_tax_review
       or needs_category_review
       or needs_package_review
       or sale_price_incl_vat <= 0
       or coalesce(nullif(trim(unit), ''), '') = ''
       or coalesce(nullif(trim(category), ''), '') = ''
       or product_has_sales_unit_price_issue(
         import_batch,
         unit,
         source_package_text,
         sale_price_incl_vat,
         supplier_case_price,
         supplier_unit_price,
         sales_unit_type,
         sales_unit_quantity,
         sales_unit_confirmed,
         price_basis_confirmed
       )
     );

  if v_blocked > 0 then
    raise exception 'import_batch_has_unapproved_products:%', v_blocked;
  end if;

  update products
     set product_status = 'active',
         is_visible = true,
         archived_at = null
   where import_batch = p_import_batch
     and product_status = 'draft'
     and ready_for_publish = true
     and not import_batch_is_offline_only(import_batch)
     and not product_has_sales_unit_price_issue(
       import_batch,
       unit,
       source_package_text,
       sale_price_incl_vat,
       supplier_case_price,
       supplier_unit_price,
       sales_unit_type,
       sales_unit_quantity,
       sales_unit_confirmed,
       price_basis_confirmed
     );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function import_batch_is_offline_only(text) from public, anon, authenticated;
grant execute on function import_batch_is_offline_only(text) to service_role;

revoke all on function publish_approved_import_batch(text) from public, anon, authenticated;
grant execute on function publish_approved_import_batch(text) to service_role;
