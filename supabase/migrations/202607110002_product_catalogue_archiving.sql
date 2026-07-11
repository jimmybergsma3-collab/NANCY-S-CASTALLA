alter table products add column if not exists product_status text not null default 'active';
alter table products add column if not exists import_batch text not null default '';
alter table products add column if not exists archived_at timestamptz;

alter table products drop constraint if exists products_product_status_check;
alter table products add constraint products_product_status_check
  check (product_status in ('active', 'archived', 'disabled', 'draft'));

create index if not exists products_product_status_idx on products(product_status, is_visible);
create index if not exists products_import_batch_idx on products(import_batch);

create or replace function archive_current_catalogue(p_import_batch text default 'IMPORT_2026_PRELAUNCH')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update products
     set product_status = 'archived',
         is_visible = false,
         featured = false,
         import_batch = coalesce(nullif(trim(p_import_batch), ''), 'IMPORT_2026_PRELAUNCH'),
         archived_at = coalesce(archived_at, now())
   where product_status <> 'archived';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function restore_archived_product(p_product_id text)
returns setof products
language plpgsql
security definer
set search_path = public
as $$
begin
  update products
     set product_status = 'active',
         is_visible = true,
         archived_at = null
   where id = p_product_id
     and product_status = 'archived';

  return query select * from products where id = p_product_id;
end;
$$;

revoke all on function archive_current_catalogue(text) from public, anon, authenticated;
grant execute on function archive_current_catalogue(text) to service_role;

revoke all on function restore_archived_product(text) from public, anon, authenticated;
grant execute on function restore_archived_product(text) to service_role;
