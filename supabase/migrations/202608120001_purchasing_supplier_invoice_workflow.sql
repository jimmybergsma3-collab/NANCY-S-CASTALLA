-- Supplier purchasing workflow for Nancy's Castalla.
-- Safe to run after the existing backoffice/import migrations.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'supplier-invoices',
  'supplier-invoices',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table purchase_orders
  add column if not exists supplier_reference text not null default '',
  add column if not exists order_date date not null default current_date,
  add column if not exists expected_delivery_date date,
  add column if not exists currency text not null default 'EUR',
  add column if not exists created_by text not null default '',
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by text not null default '',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  supplier_product_offer_id uuid references supplier_product_offers(id) on delete set null,
  supplier_code text not null default '',
  supplier_product_name text not null default '',
  package_description text not null default '',
  units_per_case numeric not null default 1,
  ordered_cases numeric not null default 0,
  ordered_units numeric not null default 0,
  received_units numeric not null default 0,
  unit_cost_ex_vat numeric not null default 0,
  case_cost_ex_vat numeric not null default 0,
  vat_rate numeric,
  line_ex_vat numeric not null default 0,
  line_vat numeric not null default 0,
  line_incl_vat numeric not null default 0,
  currency text not null default 'EUR',
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_order_items_units_check check (units_per_case > 0),
  constraint purchase_order_items_quantity_check check (ordered_cases >= 0 and ordered_units >= 0 and received_units >= 0),
  constraint purchase_order_items_cost_check check (unit_cost_ex_vat >= 0 and case_cost_ex_vat >= 0)
);

create index if not exists purchase_order_items_order_idx on purchase_order_items(purchase_order_id);
create index if not exists purchase_order_items_product_idx on purchase_order_items(product_id);
create index if not exists purchase_order_items_offer_idx on purchase_order_items(supplier_product_offer_id);
alter table purchase_order_items enable row level security;

create table if not exists supplier_invoices (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete restrict,
  purchase_order_id uuid references purchase_orders(id) on delete set null,
  supplier_invoice_number text not null default '',
  invoice_date date,
  due_date date,
  status text not null default 'uploaded',
  file_bucket text not null default 'supplier-invoices',
  file_path text not null,
  file_mime_type text not null default '',
  file_size bigint not null default 0,
  document_sha256 text not null default '',
  extracted_text text not null default '',
  needs_review boolean not null default true,
  review_reason text not null default '',
  total_ex_vat numeric,
  total_vat numeric,
  total_incl_vat numeric,
  currency text not null default 'EUR',
  uploaded_by text not null default '',
  reviewed_by text not null default '',
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_invoices_status_check check (status in ('uploaded', 'duplicate_review', 'reviewed', 'booked', 'void', 'rejected'))
);

create unique index if not exists supplier_invoices_supplier_number_active_uidx
  on supplier_invoices(supplier_id, supplier_invoice_number)
  where supplier_invoice_number <> '' and status not in ('void', 'rejected');

create unique index if not exists supplier_invoices_document_hash_active_uidx
  on supplier_invoices(document_sha256)
  where document_sha256 <> '' and status not in ('void', 'rejected');

create index if not exists supplier_invoices_supplier_idx on supplier_invoices(supplier_id, created_at desc);
create index if not exists supplier_invoices_purchase_order_idx on supplier_invoices(purchase_order_id);
alter table supplier_invoices enable row level security;

create table if not exists supplier_invoice_items (
  id uuid primary key default gen_random_uuid(),
  supplier_invoice_id uuid not null references supplier_invoices(id) on delete cascade,
  purchase_order_item_id uuid references purchase_order_items(id) on delete set null,
  product_id text references products(id) on delete set null,
  supplier_code text not null default '',
  description text not null default '',
  quantity numeric not null default 0,
  units_per_case numeric,
  unit_cost_ex_vat numeric,
  line_ex_vat numeric,
  vat_rate numeric,
  line_vat numeric,
  line_incl_vat numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists supplier_invoice_items_invoice_idx on supplier_invoice_items(supplier_invoice_id);
alter table supplier_invoice_items enable row level security;

create table if not exists goods_receipts (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete restrict,
  supplier_invoice_id uuid references supplier_invoices(id) on delete set null,
  status text not null default 'draft',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by text not null default '',
  received_by text not null default '',
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goods_receipts_status_check check (status in ('draft', 'processed', 'void'))
);

create index if not exists goods_receipts_purchase_order_idx on goods_receipts(purchase_order_id, created_at desc);
create index if not exists goods_receipts_supplier_invoice_idx on goods_receipts(supplier_invoice_id);
alter table goods_receipts enable row level security;

create table if not exists goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid not null references goods_receipts(id) on delete cascade,
  purchase_order_item_id uuid not null references purchase_order_items(id) on delete restrict,
  product_id text references products(id) on delete restrict,
  supplier_product_offer_id uuid references supplier_product_offers(id) on delete set null,
  supplier_code text not null default '',
  package_description text not null default '',
  received_cases numeric not null default 0,
  received_units numeric not null default 0,
  units_per_case numeric not null default 1,
  total_base_units numeric not null default 0,
  unit_cost_ex_vat numeric,
  vat_rate numeric,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint goods_receipt_items_units_check check (units_per_case > 0),
  constraint goods_receipt_items_quantity_check check (received_cases >= 0 and received_units >= 0 and total_base_units >= 0)
);

create index if not exists goods_receipt_items_receipt_idx on goods_receipt_items(goods_receipt_id);
create index if not exists goods_receipt_items_product_idx on goods_receipt_items(product_id);
alter table goods_receipt_items enable row level security;

create table if not exists purchase_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_product_offer_id uuid references supplier_product_offers(id) on delete set null,
  supplier_invoice_id uuid references supplier_invoices(id) on delete set null,
  goods_receipt_id uuid references goods_receipts(id) on delete set null,
  purchase_order_id uuid references purchase_orders(id) on delete set null,
  supplier_code text not null default '',
  package_description text not null default '',
  unit_cost_ex_vat numeric,
  case_cost_ex_vat numeric,
  vat_rate numeric,
  currency text not null default 'EUR',
  valid_from date not null default current_date,
  source text not null default 'goods_receipt',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists purchase_price_history_product_idx on purchase_price_history(product_id, created_at desc);
create index if not exists purchase_price_history_supplier_idx on purchase_price_history(supplier_id, supplier_code, created_at desc);
alter table purchase_price_history enable row level security;

alter table inventory_movements
  add column if not exists purchase_order_id uuid,
  add column if not exists supplier_invoice_id uuid,
  add column if not exists goods_receipt_id uuid,
  add column if not exists source_movement_id uuid,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_by text not null default '',
  add column if not exists resulting_quantity numeric;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inventory_movements_purchase_order_fk') then
    alter table inventory_movements
      add constraint inventory_movements_purchase_order_fk
      foreign key (purchase_order_id) references purchase_orders(id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inventory_movements_supplier_invoice_fk') then
    alter table inventory_movements
      add constraint inventory_movements_supplier_invoice_fk
      foreign key (supplier_invoice_id) references supplier_invoices(id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inventory_movements_goods_receipt_fk') then
    alter table inventory_movements
      add constraint inventory_movements_goods_receipt_fk
      foreign key (goods_receipt_id) references goods_receipts(id) on delete set null;
  end if;
end $$;

drop index if exists inventory_movements_goods_receipt_product_uidx;

create index if not exists inventory_movements_goods_receipt_product_idx
  on inventory_movements(goods_receipt_id, product_id)
  where goods_receipt_id is not null and movement_type = 'supplier_receipt';

create index if not exists inventory_movements_purchase_order_idx on inventory_movements(purchase_order_id, created_at desc);
create index if not exists inventory_movements_goods_receipt_idx on inventory_movements(goods_receipt_id, created_at desc);

revoke all on purchase_order_items from public, anon, authenticated;
revoke all on supplier_invoices from public, anon, authenticated;
revoke all on supplier_invoice_items from public, anon, authenticated;
revoke all on goods_receipts from public, anon, authenticated;
revoke all on goods_receipt_items from public, anon, authenticated;
revoke all on purchase_price_history from public, anon, authenticated;

grant all on purchase_order_items to service_role;
grant all on supplier_invoices to service_role;
grant all on supplier_invoice_items to service_role;
grant all on goods_receipts to service_role;
grant all on goods_receipt_items to service_role;
grant all on purchase_price_history to service_role;

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists purchase_order_items_touch_updated_at on purchase_order_items;
create trigger purchase_order_items_touch_updated_at
before update on purchase_order_items
for each row execute function touch_updated_at();

drop trigger if exists supplier_invoices_touch_updated_at on supplier_invoices;
create trigger supplier_invoices_touch_updated_at
before update on supplier_invoices
for each row execute function touch_updated_at();

drop trigger if exists goods_receipts_touch_updated_at on goods_receipts;
create trigger goods_receipts_touch_updated_at
before update on goods_receipts
for each row execute function touch_updated_at();

create or replace function process_goods_receipt_for_admin(
  p_goods_receipt_id uuid,
  p_actor text,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor text := trim(coalesce(p_actor, ''));
  v_receipt goods_receipts%rowtype;
  v_order purchase_orders%rowtype;
  v_item goods_receipt_items%rowtype;
  v_product products%rowtype;
  v_units numeric;
  v_next_stock numeric;
  v_movement_count integer := 0;
  v_total_units numeric := 0;
  v_all_ordered numeric;
  v_all_received numeric;
begin
  if length(v_actor) < 3 then
    raise exception 'actor_required';
  end if;

  if to_regclass('public.admin_audit_log') is null then
    raise exception 'admin_audit_log_missing';
  end if;

  select * into v_receipt
  from goods_receipts
  where id = p_goods_receipt_id
  for update;

  if not found then
    raise exception 'goods_receipt_not_found';
  end if;

  if v_receipt.status <> 'draft' then
    raise exception 'goods_receipt_not_draft';
  end if;

  if exists (
    select 1 from inventory_movements
    where goods_receipt_id = p_goods_receipt_id
      and movement_type = 'supplier_receipt'
  ) then
    raise exception 'goods_receipt_already_processed';
  end if;

  select * into v_order
  from purchase_orders
  where id = v_receipt.purchase_order_id
  for update;

  if not found then
    raise exception 'purchase_order_not_found';
  end if;

  for v_item in
    select * from goods_receipt_items
    where goods_receipt_id = p_goods_receipt_id
    order by created_at asc
    for update
  loop
    v_units := coalesce(nullif(v_item.total_base_units, 0), 0);
    if v_units <= 0 then
      v_units := (coalesce(v_item.received_cases, 0) * coalesce(nullif(v_item.units_per_case, 0), 1))
        + coalesce(v_item.received_units, 0);
    end if;

    if v_units <= 0 then
      raise exception 'invalid_received_quantity';
    end if;

    if v_item.product_id is null then
      raise exception 'goods_receipt_product_required';
    end if;

    select * into v_product
    from products
    where id = v_item.product_id
    for update;

    if not found then
      raise exception 'product_not_found';
    end if;

    v_next_stock := coalesce(v_product.stock_quantity, 0) + v_units;

    update products
    set stock_quantity = v_next_stock,
        updated_at = now()
    where id = v_product.id;

    update purchase_order_items
    set received_units = received_units + v_units,
        updated_at = now()
    where id = v_item.purchase_order_item_id;

    insert into inventory_movements (
      product_id,
      movement_type,
      quantity,
      reference,
      notes,
      purchase_order_id,
      supplier_invoice_id,
      goods_receipt_id,
      metadata,
      created_by,
      resulting_quantity
    )
    values (
      v_product.id,
      'supplier_receipt',
      v_units,
      'GOODS_RECEIPT:' || p_goods_receipt_id::text,
      coalesce(v_item.notes, ''),
      v_receipt.purchase_order_id,
      v_receipt.supplier_invoice_id,
      p_goods_receipt_id,
      jsonb_build_object(
        'purchase_order_item_id', v_item.purchase_order_item_id,
        'supplier_code', v_item.supplier_code,
        'received_cases', v_item.received_cases,
        'received_units', v_item.received_units,
        'units_per_case', v_item.units_per_case,
        'idempotency_key', p_idempotency_key
      ),
      v_actor,
      v_next_stock
    );

    insert into purchase_price_history (
      product_id,
      supplier_id,
      supplier_product_offer_id,
      supplier_invoice_id,
      goods_receipt_id,
      purchase_order_id,
      supplier_code,
      package_description,
      unit_cost_ex_vat,
      case_cost_ex_vat,
      vat_rate,
      currency,
      metadata
    )
    values (
      v_product.id,
      v_order.supplier_id,
      v_item.supplier_product_offer_id,
      v_receipt.supplier_invoice_id,
      p_goods_receipt_id,
      v_receipt.purchase_order_id,
      v_item.supplier_code,
      v_item.package_description,
      v_item.unit_cost_ex_vat,
      v_item.unit_cost_ex_vat * coalesce(nullif(v_item.units_per_case, 0), 1),
      v_item.vat_rate,
      coalesce(v_order.currency, 'EUR'),
      jsonb_build_object('source', 'confirmed_goods_receipt')
    );

    v_movement_count := v_movement_count + 1;
    v_total_units := v_total_units + v_units;
  end loop;

  if v_movement_count = 0 then
    raise exception 'goods_receipt_has_no_items';
  end if;

  update goods_receipts
  set status = 'processed',
      processed_at = now(),
      processed_by = v_actor,
      updated_at = now()
  where id = p_goods_receipt_id;

  if v_receipt.supplier_invoice_id is not null then
    update supplier_invoices
    set status = 'booked',
        reviewed_at = coalesce(reviewed_at, now()),
        reviewed_by = case when reviewed_by = '' then v_actor else reviewed_by end,
        updated_at = now()
    where id = v_receipt.supplier_invoice_id
      and status not in ('void', 'rejected');
  end if;

  select coalesce(sum(ordered_cases * units_per_case + ordered_units), 0),
         coalesce(sum(received_units), 0)
    into v_all_ordered, v_all_received
  from purchase_order_items
  where purchase_order_id = v_receipt.purchase_order_id;

  update purchase_orders
  set status = case when v_all_received >= v_all_ordered and v_all_ordered > 0 then 'received' else 'partially_received' end,
      received_at = case when v_all_received >= v_all_ordered and v_all_ordered > 0 then now() else received_at end,
      updated_at = now()
  where id = v_receipt.purchase_order_id;

  insert into admin_audit_log(admin_email, record_type, record_id, action, metadata)
  values (
    v_actor,
    'goods_receipt',
    p_goods_receipt_id::text,
    'process_goods_receipt',
    jsonb_build_object(
      'purchase_order_id', v_receipt.purchase_order_id,
      'supplier_invoice_id', v_receipt.supplier_invoice_id,
      'movement_count', v_movement_count,
      'total_units', v_total_units,
      'idempotency_key', p_idempotency_key
    )
  );

  return jsonb_build_object(
    'ok', true,
    'goodsReceiptId', p_goods_receipt_id,
    'purchaseOrderId', v_receipt.purchase_order_id,
    'movementCount', v_movement_count,
    'totalUnits', v_total_units
  );
end;
$$;

revoke all on function process_goods_receipt_for_admin(uuid, text, text) from public, anon, authenticated;
grant execute on function process_goods_receipt_for_admin(uuid, text, text) to service_role;
