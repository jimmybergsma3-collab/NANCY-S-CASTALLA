create index if not exists products_supplier_code_lookup_idx
  on products(lower(supplier), supplier_code)
  where supplier_code <> '';

create index if not exists products_ean_lookup_idx
  on products(ean)
  where ean <> '';

create index if not exists products_name_lookup_idx
  on products(lower(name));

create table if not exists product_import_conflicts (
  id uuid primary key default gen_random_uuid(),
  import_batch text not null,
  incoming_product_id text not null default '',
  conflict_type text not null check (conflict_type in ('product_code', 'supplier_code', 'ean', 'name', 'packaging')),
  existing_product_id text references products(id) on delete set null,
  existing_product_status text not null default '',
  supplier text not null default '',
  supplier_code text not null default '',
  ean text not null default '',
  name text not null default '',
  package_signature text not null default '',
  resolution text not null default 'pending' check (resolution in ('pending', 'import_new', 'skip', 'restore_existing', 'linked')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists product_import_conflicts_batch_idx
  on product_import_conflicts(import_batch, resolution, created_at desc);

create index if not exists product_import_conflicts_existing_product_idx
  on product_import_conflicts(existing_product_id);

create or replace function prevent_archived_product_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.product_status = 'archived'
     and coalesce(current_setting('app.allow_archived_product_update', true), '') <> 'true' then
    raise exception 'Archived product % is protected. Restore it explicitly or import a new product code.', old.id
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists products_prevent_archived_product_mutation on products;
create trigger products_prevent_archived_product_mutation
before update on products
for each row
execute function prevent_archived_product_mutation();

create or replace function restore_archived_product(p_product_id text)
returns setof products
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.allow_archived_product_update', 'true', true);

  update products
     set product_status = 'active',
         is_visible = true,
         archived_at = null
   where id = p_product_id
     and product_status = 'archived';

  return query select * from products where id = p_product_id;
end;
$$;

revoke all on function prevent_archived_product_mutation() from public, anon, authenticated;

revoke all on function restore_archived_product(text) from public, anon, authenticated;
grant execute on function restore_archived_product(text) to service_role;
