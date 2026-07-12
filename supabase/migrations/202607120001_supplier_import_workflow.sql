alter table products add column if not exists needs_tax_review boolean not null default false;
alter table products add column if not exists needs_category_review boolean not null default false;
alter table products add column if not exists needs_package_review boolean not null default false;
alter table products add column if not exists needs_image_review boolean not null default false;
alter table products add column if not exists needs_translation_review boolean not null default false;
alter table products add column if not exists ready_for_publish boolean not null default false;
alter table products add column if not exists import_source_filename text not null default '';
alter table products add column if not exists import_source_row text not null default '';
alter table products add column if not exists original_supplier_name text not null default '';
alter table products add column if not exists original_package_unit text not null default '';

create table if not exists product_import_runs (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_name text not null default '',
  source_filename text not null,
  import_batch text not null,
  file_type text not null check (file_type in ('pdf', 'xls', 'xlsx', 'csv')),
  status text not null default 'pending' check (status in ('pending', 'analysing', 'preview_ready', 'importing', 'completed', 'failed', 'rolled_back')),
  dry_run boolean not null default true,
  started_at timestamptz,
  completed_at timestamptz,
  created_by text not null default '',
  source_row_count integer not null default 0,
  parsed_product_count integer not null default 0,
  created_product_count integer not null default 0,
  updated_offer_count integer not null default 0,
  skipped_count integer not null default 0,
  conflict_count integer not null default 0,
  warning_count integer not null default 0,
  error_count integer not null default 0,
  report_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists supplier_product_offers (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_code text not null default '',
  supplier_product_name text not null default '',
  ean text not null default '',
  brand text not null default '',
  category_source text not null default '',
  storage_type text not null default '',
  package_description text not null default '',
  units_per_case numeric,
  unit_weight_or_volume numeric,
  case_price numeric,
  unit_price numeric,
  price_ex_vat numeric,
  currency text not null default 'EUR',
  source_filename text not null default '',
  source_row text not null default '',
  source_batch text not null default '',
  price_valid_from date not null default current_date,
  last_imported_at timestamptz not null default now(),
  active boolean not null default true,
  needs_tax_review boolean not null default true,
  needs_category_review boolean not null default true,
  needs_package_review boolean not null default true,
  needs_image_review boolean not null default true,
  needs_translation_review boolean not null default true,
  ready_for_publish boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table product_import_runs enable row level security;
alter table supplier_product_offers enable row level security;

create index if not exists product_import_runs_batch_idx
  on product_import_runs(import_batch, status, created_at desc);

create index if not exists supplier_product_offers_product_idx
  on supplier_product_offers(product_id, active);

create index if not exists supplier_product_offers_supplier_code_idx
  on supplier_product_offers(supplier_id, supplier_code)
  where supplier_code <> '';

create index if not exists supplier_product_offers_ean_idx
  on supplier_product_offers(ean)
  where ean <> '';

create index if not exists supplier_product_offers_batch_idx
  on supplier_product_offers(source_batch, active);

create unique index if not exists supplier_product_offers_supplier_batch_pack_unique_idx
  on supplier_product_offers(supplier_id, supplier_code, source_batch, package_description)
  where active = true and supplier_code <> '';

alter table product_import_conflicts add column if not exists import_run_id uuid references product_import_runs(id) on delete set null;
alter table product_import_conflicts add column if not exists source_name text not null default '';
alter table product_import_conflicts add column if not exists source_package text not null default '';
alter table product_import_conflicts add column if not exists matching_product_id text references products(id) on delete set null;
alter table product_import_conflicts add column if not exists reason text not null default '';
alter table product_import_conflicts add column if not exists available_choices jsonb not null default '[]'::jsonb;
alter table product_import_conflicts add column if not exists resolved_by text not null default '';

alter table product_import_conflicts drop constraint if exists product_import_conflicts_resolution_check;
alter table product_import_conflicts add constraint product_import_conflicts_resolution_check
  check (resolution in ('pending', 'import_new', 'import_as_new', 'skip', 'restore_existing', 'restore_archived_product', 'linked', 'link_supplier_offer'));

create index if not exists product_import_conflicts_run_idx
  on product_import_conflicts(import_run_id, resolution, created_at desc);

create or replace function touch_product_import_run_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists product_import_runs_touch_updated_at on product_import_runs;
create trigger product_import_runs_touch_updated_at
before update on product_import_runs
for each row
execute function touch_product_import_run_updated_at();

create or replace function touch_supplier_product_offer_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists supplier_product_offers_touch_updated_at on supplier_product_offers;
create trigger supplier_product_offers_touch_updated_at
before update on supplier_product_offers
for each row
execute function touch_supplier_product_offer_updated_at();

create or replace function reserve_nancy_product_codes(p_count integer)
returns table(product_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_highest integer;
  v_index integer;
begin
  if p_count < 1 or p_count > 5000 then
    raise exception 'invalid_product_code_reservation_count';
  end if;

  lock table products in exclusive mode;

  select coalesce(max((regexp_match(id, '^NC-([0-9]{5})$'))[1]::integer), 0)
    into v_highest
    from products
   where id ~ '^NC-[0-9]{5}$';

  for v_index in 1..p_count loop
    product_code := 'NC-' || lpad((v_highest + v_index)::text, 5, '0');
    return next;
  end loop;
end;
$$;

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
       or needs_image_review
       or needs_translation_review
       or sale_price_incl_vat <= 0
       or coalesce(nullif(trim(unit), ''), '') = ''
       or coalesce(nullif(trim(category), ''), '') = ''
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
     and ready_for_publish = true;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function rollback_import_batch_to_draft(p_import_batch text, p_target_status text default 'draft')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if coalesce(trim(p_import_batch), '') = '' then
    raise exception 'import_batch_required';
  end if;

  if p_target_status not in ('draft', 'archived') then
    raise exception 'invalid_import_rollback_target';
  end if;

  update supplier_product_offers
     set active = false,
         last_imported_at = now()
   where source_batch = p_import_batch;

  update products
     set product_status = p_target_status,
         is_visible = false,
         featured = false,
         archived_at = case when p_target_status = 'archived' then coalesce(archived_at, now()) else archived_at end
   where import_batch = p_import_batch
     and product_status in ('draft', 'active', 'disabled');

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function reserve_nancy_product_codes(integer) from public, anon, authenticated;
grant execute on function reserve_nancy_product_codes(integer) to service_role;

revoke all on function publish_approved_import_batch(text) from public, anon, authenticated;
grant execute on function publish_approved_import_batch(text) to service_role;

revoke all on function rollback_import_batch_to_draft(text, text) from public, anon, authenticated;
grant execute on function rollback_import_batch_to_draft(text, text) to service_role;
