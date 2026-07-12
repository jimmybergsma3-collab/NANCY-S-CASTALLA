alter table products add column if not exists sales_unit_type text not null default '';
alter table products add column if not exists sales_unit_quantity numeric not null default 0;
alter table products add column if not exists sales_unit_confirmed boolean not null default false;
alter table products add column if not exists price_basis_confirmed boolean not null default false;
alter table products add column if not exists supplier_case_price numeric not null default 0;
alter table products add column if not exists supplier_unit_price numeric not null default 0;
alter table products add column if not exists supplier_case_quantity numeric not null default 0;
alter table products add column if not exists source_package_text text not null default '';

alter table products drop constraint if exists products_sales_unit_type_check;
alter table products add constraint products_sales_unit_type_check
  check (sales_unit_type in ('', 'case', 'single', 'custom_pack', 'per_kg', 'per_unit'));

create index if not exists products_import_sales_unit_review_idx
  on products(import_batch, product_status, is_visible, sales_unit_confirmed, price_basis_confirmed)
  where import_batch like 'IMPORT_2026_LIVE_%';

update products p
   set supplier_case_price = coalesce(nullif(p.supplier_case_price, 0), coalesce(o.case_price, 0)),
       supplier_unit_price = coalesce(nullif(p.supplier_unit_price, 0), coalesce(o.unit_price, p.unit_cost, 0)),
       supplier_case_quantity = coalesce(nullif(p.supplier_case_quantity, 0), coalesce(o.units_per_case, 0)),
       source_package_text = coalesce(nullif(p.source_package_text, ''), o.package_description, p.pack_size, p.unit)
  from supplier_product_offers o
 where o.product_id = p.id
   and o.active = true
   and p.import_batch like 'IMPORT_2026_LIVE_%';

create or replace function product_package_looks_like_case(p_text text)
returns boolean
language sql
immutable
as $$
  select coalesce(p_text, '') ~* '(^|[^0-9a-z])([0-9]+\s*x\s*[0-9]+|x\s*(2|4|6|8|10|12|20|24|36|40|48|72|80|100)([^0-9a-z]|$)|(2|4|6|8|10|12|20|24|36|40|48|72|80|100)\s*(pcs|st|units|x)([^0-9a-z]|$))';
$$;

create or replace function product_has_sales_unit_price_issue(
  p_import_batch text,
  p_unit text,
  p_source_package text,
  p_sale_price numeric,
  p_case_price numeric,
  p_unit_price numeric,
  p_sales_unit_type text,
  p_sales_unit_quantity numeric,
  p_sales_unit_confirmed boolean,
  p_price_basis_confirmed boolean
)
returns boolean
language plpgsql
immutable
as $$
declare
  v_case_like_public boolean;
  v_case_like_source boolean;
begin
  if coalesce(p_import_batch, '') not like 'IMPORT_2026_LIVE_%' then
    return false;
  end if;

  if not coalesce(p_sales_unit_confirmed, false)
     or not coalesce(p_price_basis_confirmed, false)
     or coalesce(p_sales_unit_type, '') = '' then
    return true;
  end if;

  if coalesce(p_sale_price, 0) <= 0 or coalesce(trim(p_unit), '') = '' then
    return true;
  end if;

  v_case_like_public := product_package_looks_like_case(p_unit);
  v_case_like_source := product_package_looks_like_case(p_source_package);

  if p_sales_unit_type = 'case'
     and coalesce(p_case_price, 0) > 0
     and coalesce(p_sale_price, 0) < coalesce(p_case_price, 0) then
    return true;
  end if;

  if p_sales_unit_type = 'single'
     and v_case_like_public then
    return true;
  end if;

  if p_sales_unit_type = 'single'
     and coalesce(p_unit_price, 0) > 0
     and coalesce(p_sale_price, 0) < coalesce(p_unit_price, 0) then
    return true;
  end if;

  if p_sales_unit_type = 'custom_pack'
     and coalesce(p_sales_unit_quantity, 0) <= 0 then
    return true;
  end if;

  if p_sales_unit_type = 'custom_pack'
     and coalesce(p_unit_price, 0) > 0
     and coalesce(p_sales_unit_quantity, 0) > 0
     and coalesce(p_sale_price, 0) < coalesce(p_unit_price, 0) * coalesce(p_sales_unit_quantity, 0) then
    return true;
  end if;

  if v_case_like_public
     and coalesce(p_unit_price, 0) > 0
     and abs(coalesce(p_sale_price, 0) - coalesce(p_unit_price, 0)) <= greatest(0.08, coalesce(p_unit_price, 0) * 0.12)
     and p_sales_unit_type <> 'single' then
    return true;
  end if;

  if (v_case_like_public or v_case_like_source)
     and p_sales_unit_type = 'case'
     and coalesce(p_case_price, 0) > 0
     and coalesce(p_sale_price, 0) < coalesce(p_case_price, 0) then
    return true;
  end if;

  return false;
end;
$$;

update products
   set product_status = 'draft',
       is_visible = false,
       featured = false,
       ready_for_publish = false,
       needs_package_review = true
 where product_status = 'active'
   and is_visible = true
   and product_has_sales_unit_price_issue(
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

revoke all on function product_package_looks_like_case(text) from public, anon, authenticated;
grant execute on function product_package_looks_like_case(text) to service_role;

revoke all on function product_has_sales_unit_price_issue(text, text, text, numeric, numeric, numeric, text, numeric, boolean, boolean) from public, anon, authenticated;
grant execute on function product_has_sales_unit_price_issue(text, text, text, numeric, numeric, numeric, text, numeric, boolean, boolean) to service_role;

revoke all on function publish_approved_import_batch(text) from public, anon, authenticated;
grant execute on function publish_approved_import_batch(text) to service_role;
