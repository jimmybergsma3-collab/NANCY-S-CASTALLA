alter table customers add column if not exists archived_at timestamptz;
alter table customers add column if not exists is_test boolean not null default false;
alter table customers add column if not exists test_reason text not null default '';

alter table orders add column if not exists archived_at timestamptz;
alter table orders add column if not exists is_test boolean not null default false;
alter table orders add column if not exists test_reason text not null default '';

alter table invoices add column if not exists archived_at timestamptz;
alter table invoices add column if not exists is_test boolean not null default false;
alter table invoices add column if not exists invoice_series text;
alter table invoices add column if not exists invoice_series_year integer;
alter table invoices add column if not exists invoice_series_number bigint;

create table if not exists invoice_series_counters (
  series text not null,
  year integer not null,
  next_number bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (series, year)
);

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null default '',
  record_type text not null,
  record_id text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customers_archived_test_idx on customers(archived_at, is_test);
create index if not exists orders_archived_test_idx on orders(archived_at, is_test);
create index if not exists invoices_series_idx on invoices(invoice_series, invoice_series_year, invoice_series_number);
create unique index if not exists invoices_series_unique_idx on invoices(invoice_series, invoice_series_year, invoice_series_number) where invoice_series is not null and invoice_series_number is not null;
create index if not exists admin_audit_log_record_idx on admin_audit_log(record_type, record_id, created_at desc);

create or replace function next_invoice_series_number(p_series text, p_year integer)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next bigint;
begin
  insert into invoice_series_counters(series, year, next_number)
  values (upper(trim(p_series)), p_year, 2)
  on conflict (series, year) do update
    set next_number = invoice_series_counters.next_number + 1,
        updated_at = now()
  returning next_number - 1 into v_next;
  return v_next;
end;
$$;

create or replace function create_invoice_from_order(
  p_order_id text,
  p_invoice_series text default 'NC',
  p_is_test boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_customer customers%rowtype;
  v_invoice_id uuid;
  v_address text;
  v_series text;
  v_year integer;
  v_series_number bigint;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if v_order.status not in ('confirmed', 'ready_for_collection', 'delivered') and v_order.payment_status <> 'paid' then
    raise exception 'invoice_not_allowed';
  end if;
  if not exists (select 1 from order_items where order_id = p_order_id) then
    raise exception 'order_has_no_items';
  end if;

  select * into v_customer from customers where id = v_order.customer_id;
  v_address := coalesce(nullif(v_customer.address, ''), substring(v_order.notes from '(?im)^(?:Address|Adres|Adresse|Dirección|Adress):\s*(.+)$'), '');
  v_series := case when p_is_test or v_order.is_test then 'TEST' else upper(coalesce(nullif(trim(p_invoice_series), ''), 'NC')) end;
  v_year := extract(year from now() at time zone 'utc')::integer;
  v_series_number := next_invoice_series_number(v_series, v_year);

  insert into invoices (
    order_id, customer_id, status, total_ex_vat, total_vat, total_incl_vat, issued_at,
    customer_name, customer_email, customer_phone, billing_address, customer_language,
    order_number, payment_method, invoice_series, invoice_series_year, invoice_series_number, is_test
  ) values (
    v_order.id, v_order.customer_id, 'issued', v_order.subtotal_ex_vat, v_order.vat_total, v_order.total, now(),
    v_order.customer_name, v_order.customer_email, v_order.customer_phone, v_address,
    coalesce(nullif(v_customer.language, ''), 'en'), v_order.order_number, coalesce(nullif(v_order.payment_method, ''), 'pending'),
    v_series, v_year, v_series_number, p_is_test or v_order.is_test
  )
  on conflict (order_id) where order_id is not null do nothing
  returning id into v_invoice_id;

  if v_invoice_id is null then
    select id into v_invoice_id from invoices where order_id = p_order_id;
    return v_invoice_id;
  end if;

  insert into invoice_items (
    invoice_id, product_id, product_name, package_label, quantity, unit_price_incl_vat,
    vat_rate, line_total_ex_vat, line_vat, line_total_incl_vat
  )
  select v_invoice_id, product_id, product_name, coalesce(nullif(package_label, ''), unit), quantity,
    sale_price_incl_vat, vat_rate, line_total_ex_vat,
    line_total_incl_vat - line_total_ex_vat, line_total_incl_vat
  from order_items where order_id = p_order_id order by id;

  return v_invoice_id;
end;
$$;

create or replace function safe_delete_test_order(p_order_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if not v_order.is_test then raise exception 'not_test_order'; end if;
  if coalesce(v_order.inventory_committed, false) then raise exception 'inventory_committed'; end if;
  if exists (select 1 from inventory_movements where order_id = p_order_id) then raise exception 'inventory_movements_exist'; end if;
  if exists (select 1 from invoices where order_id = p_order_id and coalesce(is_test, false) = false and invoice_series = 'NC') then
    raise exception 'official_invoice_exists';
  end if;
  delete from invoice_items where invoice_id in (select id from invoices where order_id = p_order_id and coalesce(is_test, false) = true);
  delete from invoices where order_id = p_order_id and coalesce(is_test, false) = true;
  delete from order_items where order_id = p_order_id;
  delete from orders where id = p_order_id;
end;
$$;

revoke all on function next_invoice_series_number(text, integer) from public, anon, authenticated;
grant execute on function next_invoice_series_number(text, integer) to service_role;

revoke all on function create_invoice_from_order(text, text, boolean) from public, anon, authenticated;
grant execute on function create_invoice_from_order(text, text, boolean) to service_role;

revoke all on function safe_delete_test_order(text) from public, anon, authenticated;
grant execute on function safe_delete_test_order(text) to service_role;
