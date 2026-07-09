alter table orders add column if not exists payment_method text not null default 'pending';

create or replace function create_validated_order(
  p_order_id text, p_idempotency_key text, p_auth_user_id uuid,
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_fulfillment text, p_notes text, p_subtotal_ex_vat numeric,
  p_vat_total numeric, p_total numeric, p_lines jsonb,
  p_payment_method text default 'pending'
)
returns table(order_id text, order_number bigint, already_existed boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_number bigint;
  v_existing_id text;
  v_line jsonb;
  v_payment_method text;
begin
  v_payment_method := case
    when p_payment_method in ('bizum', 'bank-transfer', 'cash', 'card', 'pending') then p_payment_method
    else 'pending'
  end;

  select id, orders.order_number into v_existing_id, v_order_number from orders where idempotency_key = p_idempotency_key;
  if v_existing_id is not null then return query select v_existing_id, v_order_number, true; return; end if;

  insert into customers (auth_user_id, name, email, phone)
  values (p_auth_user_id, p_customer_name, lower(p_customer_email), coalesce(p_customer_phone, ''))
  on conflict (email) do update set
    auth_user_id = coalesce(excluded.auth_user_id, customers.auth_user_id), name = excluded.name,
    phone = case when excluded.phone <> '' then excluded.phone else customers.phone end, updated_at = now()
  returning id into v_customer_id;

  insert into orders (id, idempotency_key, customer_id, customer_name, customer_email, customer_phone,
    fulfillment, delivery_method, notes, subtotal_ex_vat, vat_total, total, status, payment_status, payment_method)
  values (p_order_id, p_idempotency_key, v_customer_id, p_customer_name, lower(p_customer_email), coalesce(p_customer_phone, ''),
    p_fulfillment, p_fulfillment, coalesce(p_notes, ''), p_subtotal_ex_vat, p_vat_total, p_total, 'new', 'pending', v_payment_method)
  returning orders.order_number into v_order_number;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    insert into order_items (order_id, product_id, product_name, quantity, unit, package_label, package_quantity,
      sale_price_incl_vat, vat_rate, line_total_incl_vat, line_total_ex_vat)
    values (p_order_id, v_line->>'productId', v_line->>'name', (v_line->>'quantity')::integer,
      v_line->>'unit', v_line->>'packageLabel', (v_line->>'packageQuantity')::numeric,
      (v_line->>'salePriceInclVat')::numeric, (v_line->>'vatRate')::numeric,
      (v_line->>'lineTotalInclVat')::numeric, (v_line->>'lineTotalExVat')::numeric);
  end loop;
  return query select p_order_id, v_order_number, false;
exception when unique_violation then
  select id, orders.order_number into v_existing_id, v_order_number from orders where idempotency_key = p_idempotency_key;
  return query select v_existing_id, v_order_number, true;
end;
$$;

create or replace function create_invoice_from_order(p_order_id text)
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

  insert into invoices (
    order_id, customer_id, status, total_ex_vat, total_vat, total_incl_vat, issued_at,
    customer_name, customer_email, customer_phone, billing_address, customer_language,
    order_number, payment_method
  ) values (
    v_order.id, v_order.customer_id, 'issued', v_order.subtotal_ex_vat, v_order.vat_total, v_order.total, now(),
    v_order.customer_name, v_order.customer_email, v_order.customer_phone, v_address,
    coalesce(nullif(v_customer.language, ''), 'en'), v_order.order_number, coalesce(nullif(v_order.payment_method, ''), 'pending')
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

revoke all on function create_validated_order(text, text, uuid, text, text, text, text, text, numeric, numeric, numeric, jsonb, text) from public, anon, authenticated;
grant execute on function create_validated_order(text, text, uuid, text, text, text, text, text, numeric, numeric, numeric, jsonb, text) to service_role;

revoke all on function create_invoice_from_order(text) from public, anon, authenticated;
grant execute on function create_invoice_from_order(text) to service_role;
