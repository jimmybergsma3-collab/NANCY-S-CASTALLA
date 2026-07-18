create or replace function create_validated_order(
  p_order_id text, p_idempotency_key text, p_auth_user_id uuid,
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_fulfillment text, p_notes text, p_subtotal_ex_vat numeric,
  p_vat_total numeric, p_total numeric, p_lines jsonb
)
returns table(order_id text, order_number bigint, already_existed boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_number bigint;
  v_existing_id text;
  v_line jsonb;
begin
  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'idempotency_key_required';
  end if;

  select o.id, o.order_number into v_existing_id, v_order_number
  from orders o
  where o.idempotency_key = p_idempotency_key
  limit 1;
  if v_existing_id is not null and v_order_number is not null then
    return query select v_existing_id, v_order_number, true;
    return;
  end if;

  insert into customers (auth_user_id, name, email, phone)
  values (p_auth_user_id, p_customer_name, lower(p_customer_email), coalesce(p_customer_phone, ''))
  on conflict (email) do update set
    auth_user_id = coalesce(excluded.auth_user_id, customers.auth_user_id),
    name = excluded.name,
    phone = case when excluded.phone <> '' then excluded.phone else customers.phone end,
    updated_at = now()
  returning id into v_customer_id;

  insert into orders (id, idempotency_key, customer_id, customer_name, customer_email, customer_phone,
    fulfillment, delivery_method, notes, subtotal_ex_vat, vat_total, total, status, payment_status)
  values (p_order_id, p_idempotency_key, v_customer_id, p_customer_name, lower(p_customer_email), coalesce(p_customer_phone, ''),
    p_fulfillment, p_fulfillment, coalesce(p_notes, ''), p_subtotal_ex_vat, p_vat_total, p_total, 'new', 'pending')
  returning orders.order_number into v_order_number;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    insert into order_items (order_id, product_id, product_name, quantity, unit, package_label, package_quantity,
      sale_price_incl_vat, vat_rate, line_total_incl_vat, line_total_ex_vat)
    values (p_order_id, v_line->>'productId', v_line->>'name', (v_line->>'quantity')::integer,
      v_line->>'unit', v_line->>'packageLabel', (v_line->>'packageQuantity')::numeric,
      (v_line->>'salePriceInclVat')::numeric, (v_line->>'vatRate')::numeric,
      (v_line->>'lineTotalInclVat')::numeric, (v_line->>'lineTotalExVat')::numeric);
  end loop;

  if v_order_number is null then
    raise exception 'order_storage_unconfirmed';
  end if;

  return query select p_order_id, v_order_number, false;
exception when unique_violation then
  select o.id, o.order_number into v_existing_id, v_order_number
  from orders o
  where o.idempotency_key = p_idempotency_key
  limit 1;

  if v_existing_id is not null and v_order_number is not null then
    return query select v_existing_id, v_order_number, true;
    return;
  end if;

  raise;
end;
$$;

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
  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'idempotency_key_required';
  end if;

  v_payment_method := case
    when p_payment_method in ('bizum', 'bank-transfer', 'pending') then p_payment_method
    else 'pending'
  end;

  select o.id, o.order_number into v_existing_id, v_order_number
  from orders o
  where o.idempotency_key = p_idempotency_key
  limit 1;
  if v_existing_id is not null and v_order_number is not null then
    return query select v_existing_id, v_order_number, true;
    return;
  end if;

  insert into customers (auth_user_id, name, email, phone)
  values (p_auth_user_id, p_customer_name, lower(p_customer_email), coalesce(p_customer_phone, ''))
  on conflict (email) do update set
    auth_user_id = coalesce(excluded.auth_user_id, customers.auth_user_id),
    name = excluded.name,
    phone = case when excluded.phone <> '' then excluded.phone else customers.phone end,
    updated_at = now()
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

  if v_order_number is null then
    raise exception 'order_storage_unconfirmed';
  end if;

  return query select p_order_id, v_order_number, false;
exception when unique_violation then
  select o.id, o.order_number into v_existing_id, v_order_number
  from orders o
  where o.idempotency_key = p_idempotency_key
  limit 1;

  if v_existing_id is not null and v_order_number is not null then
    return query select v_existing_id, v_order_number, true;
    return;
  end if;

  raise;
end;
$$;

revoke all on function create_validated_order(text, text, uuid, text, text, text, text, text, numeric, numeric, numeric, jsonb) from public, anon, authenticated;
grant execute on function create_validated_order(text, text, uuid, text, text, text, text, text, numeric, numeric, numeric, jsonb) to service_role;

revoke all on function create_validated_order(text, text, uuid, text, text, text, text, text, numeric, numeric, numeric, jsonb, text) from public, anon, authenticated;
grant execute on function create_validated_order(text, text, uuid, text, text, text, text, text, numeric, numeric, numeric, jsonb, text) to service_role;
