alter table invoices add column if not exists voided_at timestamptz;
alter table invoices add column if not exists voided_by text not null default '';
alter table invoices add column if not exists void_reason text not null default '';
alter table products add column if not exists ready_for_publish boolean not null default false;
alter table products add column if not exists sales_unit_confirmed boolean not null default false;
alter table products add column if not exists price_basis_confirmed boolean not null default false;

drop index if exists invoices_one_per_order_idx;
create unique index if not exists invoices_one_active_per_order_idx
  on invoices(order_id)
  where order_id is not null
    and coalesce(status, '') <> 'void'
    and voided_at is null;
create index if not exists inventory_movements_order_type_idx on inventory_movements(order_id, movement_type, created_at);

create or replace function replace_order_items_for_admin(
  p_order_id text,
  p_lines jsonb,
  p_subtotal_ex_vat numeric,
  p_vat_total numeric,
  p_total numeric,
  p_reason text,
  p_actor text,
  p_expected_updated_at timestamptz
)
returns setof orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_line jsonb;
  v_product products%rowtype;
  v_old_lines jsonb;
  v_new_lines jsonb;
  v_calc_subtotal numeric := 0;
  v_calc_vat numeric := 0;
  v_calc_total numeric := 0;
  v_line_ex numeric;
  v_line_vat numeric;
  v_line_total numeric;
  v_quantity numeric;
  v_package_label text;
  v_package_quantity numeric;
  v_package_price numeric;
  v_package_unit_price numeric;
  v_effective_units numeric;
  v_package_option jsonb;
  v_allowed_vat numeric[] := array[4, 10, 21];
begin
  if length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'correction_reason_required'; end if;
  if length(trim(coalesce(p_actor, ''))) < 3 then raise exception 'correction_actor_required'; end if;
  if p_expected_updated_at is null then raise exception 'expected_updated_at_required'; end if;
  if to_regclass('public.admin_audit_log') is null then raise exception 'admin_audit_log_required'; end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if abs(extract(epoch from (coalesce(v_order.updated_at, v_order.created_at) - p_expected_updated_at))) > 0.001 then
    raise exception 'order_changed';
  end if;
  if v_order.status in ('cancelled', 'delivered') then raise exception 'order_locked_status'; end if;
  if coalesce(v_order.inventory_committed, false) then raise exception 'order_inventory_committed'; end if;
  if v_order.payment_status = 'paid' then raise exception 'order_payment_locked'; end if;
  if exists (
    select 1
      from invoices
     where order_id = p_order_id
       and coalesce(status, '') <> 'void'
       and voided_at is null
  ) then
    raise exception 'active_invoice_exists';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then raise exception 'order_lines_required'; end if;

  select coalesce(jsonb_agg(to_jsonb(oi) order by oi.id), '[]'::jsonb)
    into v_old_lines
    from order_items oi
   where oi.order_id = p_order_id;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    if coalesce(v_line->>'productId', '') = '' then raise exception 'line_product_required'; end if;
    v_quantity := coalesce((v_line->>'quantity')::numeric, 0);
    if v_quantity <= 0 then raise exception 'line_quantity_required'; end if;

    select * into v_product from products where id = v_line->>'productId';
    if not found then raise exception 'product_not_found'; end if;
    if coalesce(v_product.product_status, '') <> 'active' then raise exception 'product_not_active'; end if;
    if not coalesce(v_product.is_visible, false) then raise exception 'product_not_visible'; end if;
    if not coalesce(v_product.ready_for_publish, false) then raise exception 'product_not_ready_for_publish'; end if;
    if coalesce(v_product.sale_price_incl_vat, 0) <= 0 then raise exception 'product_price_required'; end if;
    if v_product.vat_rate is null or not (v_product.vat_rate = any(v_allowed_vat)) then raise exception 'product_invalid_vat'; end if;
    if coalesce(v_product.sales_unit_confirmed, false) is not true then raise exception 'product_sales_unit_unconfirmed'; end if;
    if coalesce(v_product.import_batch, '') like 'IMPORT_2026_LIVE_%'
       and coalesce(v_product.price_basis_confirmed, false) is not true then
      raise exception 'product_price_basis_unconfirmed';
    end if;

    v_package_label := coalesce(nullif(v_line->>'packageLabel', ''), nullif(v_line->>'unit', ''), v_product.unit, '');
    v_package_quantity := coalesce((v_line->>'packageQuantity')::numeric, 1);
    if v_package_quantity <= 0 then raise exception 'line_package_quantity_required'; end if;

    v_package_option := null;
    if jsonb_typeof(coalesce(v_product.package_options, '[]'::jsonb)) = 'array'
       and jsonb_array_length(coalesce(v_product.package_options, '[]'::jsonb)) > 0 then
      select option_value
        into v_package_option
        from jsonb_array_elements(v_product.package_options) as option_value
       where option_value->>'label' = v_package_label
         and round((option_value->>'quantity')::numeric, 4) = round(v_package_quantity, 4)
       limit 1;

      if v_package_option is null then raise exception 'line_package_unavailable'; end if;
      v_package_price := round((v_package_option->>'salePriceInclVat')::numeric, 2);
    else
      if round(v_package_quantity, 4) <> 1 then raise exception 'line_package_unavailable'; end if;
      v_package_price := round(v_product.sale_price_incl_vat, 2);
      v_package_label := coalesce(nullif(v_package_label, ''), v_product.unit, '');
    end if;

    if coalesce(v_package_price, 0) <= 0 then raise exception 'line_price_mismatch'; end if;
    if round((v_line->>'salePriceInclVat')::numeric, 2) <> v_package_price then raise exception 'line_price_mismatch'; end if;
    if round((v_line->>'vatRate')::numeric, 2) <> round(v_product.vat_rate, 2) then raise exception 'line_vat_mismatch'; end if;

    v_effective_units := v_quantity * v_package_quantity;
    v_package_unit_price := v_package_price / v_package_quantity;
    v_line_total := round((v_effective_units * v_package_unit_price)::numeric, 2);
    v_line_ex := round((v_line_total / (1 + v_product.vat_rate / 100))::numeric, 2);
    v_line_vat := round((v_line_total - v_line_ex)::numeric, 2);

    if round((v_line->>'lineTotalInclVat')::numeric, 2) <> v_line_total then raise exception 'line_total_mismatch'; end if;
    if round((v_line->>'lineTotalExVat')::numeric, 2) <> v_line_ex then raise exception 'line_ex_vat_mismatch'; end if;

    v_calc_subtotal := v_calc_subtotal + v_line_ex;
    v_calc_vat := v_calc_vat + v_line_vat;
    v_calc_total := v_calc_total + v_line_total;
  end loop;

  v_calc_subtotal := round(v_calc_subtotal, 2);
  v_calc_vat := round(v_calc_vat, 2);
  v_calc_total := round(v_calc_total, 2);

  if round(p_subtotal_ex_vat, 2) <> v_calc_subtotal then raise exception 'subtotal_mismatch'; end if;
  if round(p_vat_total, 2) <> v_calc_vat then raise exception 'vat_total_mismatch'; end if;
  if round(p_total, 2) <> v_calc_total then raise exception 'total_mismatch'; end if;

  delete from order_items where order_id = p_order_id;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    insert into order_items (
      order_id, product_id, product_name, quantity, unit, package_label, package_quantity,
      sale_price_incl_vat, vat_rate, line_total_incl_vat, line_total_ex_vat
    )
    values (
      p_order_id,
      v_line->>'productId',
      v_line->>'name',
      (v_line->>'quantity')::integer,
      coalesce(v_line->>'unit', v_line->>'packageLabel', ''),
      coalesce(v_line->>'packageLabel', v_line->>'unit', ''),
      coalesce((v_line->>'packageQuantity')::numeric, 1),
      (v_line->>'salePriceInclVat')::numeric,
      (v_line->>'vatRate')::numeric,
      (v_line->>'lineTotalInclVat')::numeric,
      (v_line->>'lineTotalExVat')::numeric
    );
  end loop;

  update orders
     set subtotal_ex_vat = v_calc_subtotal,
         vat_total = v_calc_vat,
         total = v_calc_total,
         updated_at = now()
   where id = p_order_id;

  select coalesce(jsonb_agg(to_jsonb(oi) order by oi.id), '[]'::jsonb)
    into v_new_lines
    from order_items oi
   where oi.order_id = p_order_id;

  insert into admin_audit_log(admin_email, record_type, record_id, action, metadata)
  values (
    trim(p_actor),
    'order',
    p_order_id,
    'replace_order_items_for_correction',
    jsonb_build_object(
      'actor', trim(p_actor),
      'reason', trim(p_reason),
      'changedAt', now(),
      'oldLines', v_old_lines,
      'newLines', v_new_lines,
      'oldSubtotalExVat', v_order.subtotal_ex_vat,
      'oldVatTotal', v_order.vat_total,
      'oldTotal', v_order.total,
      'newSubtotalExVat', v_calc_subtotal,
      'newVatTotal', v_calc_vat,
      'newTotal', v_calc_total
    )
  );

  return query select * from orders where id = p_order_id;
end;
$$;

revoke all on function replace_order_items_for_admin(text, jsonb, numeric, numeric, numeric, text, text, timestamptz) from public, anon, authenticated;
grant execute on function replace_order_items_for_admin(text, jsonb, numeric, numeric, numeric, text, text, timestamptz) to service_role;

create or replace function reset_invoice_for_order_correction(
  p_order_id text,
  p_reason text,
  p_actor text
)
returns setof orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_invoice record;
  v_invoice_snapshot jsonb;
begin
  if length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'correction_reason_required'; end if;
  if length(trim(coalesce(p_actor, ''))) < 3 then raise exception 'correction_actor_required'; end if;
  if to_regclass('public.admin_audit_log') is null then raise exception 'admin_audit_log_required'; end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if v_order.status in ('cancelled', 'delivered') then raise exception 'order_locked_status'; end if;
  if coalesce(v_order.inventory_committed, false) then raise exception 'order_inventory_committed'; end if;
  if v_order.payment_status = 'paid' then raise exception 'order_payment_locked'; end if;

  select * into v_invoice
    from invoices
   where order_id = p_order_id
     and coalesce(status, '') <> 'void'
     and voided_at is null
   order by created_at desc
   limit 1
   for update;

  if not found then raise exception 'active_invoice_not_found'; end if;
  if v_invoice.email_sent_at is not null then raise exception 'invoice_already_emailed'; end if;
  if coalesce(v_invoice.status, '') in ('paid', 'cancelled', 'credited', 'exported') then raise exception 'invoice_locked_status'; end if;

  select jsonb_build_object(
    'invoice', to_jsonb(v_invoice),
    'items', coalesce(jsonb_agg(to_jsonb(ii) order by ii.id), '[]'::jsonb)
  )
    into v_invoice_snapshot
    from invoice_items ii
   where ii.invoice_id = v_invoice.id;

  update invoices
     set status = 'void',
         voided_at = now(),
         voided_by = trim(p_actor),
         void_reason = trim(p_reason),
         updated_at = now()
   where id = v_invoice.id;

  insert into admin_audit_log(admin_email, record_type, record_id, action, metadata)
  values (
    trim(p_actor),
    'order',
    p_order_id,
    'void_invoice_for_order_correction',
    jsonb_build_object(
      'actor', trim(p_actor),
      'reason', trim(p_reason),
      'changedAt', now(),
      'invoiceId', v_invoice.id,
      'invoiceNumber', v_invoice.invoice_number,
      'invoiceSeries', coalesce(v_invoice.invoice_series, ''),
      'invoiceSeriesYear', v_invoice.invoice_series_year,
      'invoiceSeriesNumber', v_invoice.invoice_series_number,
      'invoiceSnapshot', v_invoice_snapshot
    )
  );

  return query select * from orders where id = p_order_id;
end;
$$;

revoke all on function reset_invoice_for_order_correction(text, text, text) from public, anon, authenticated;
grant execute on function reset_invoice_for_order_correction(text, text, text) to service_role;

create or replace function void_invoice_and_release_inventory_for_order_correction(
  p_order_id text,
  p_reason text,
  p_actor text
)
returns setof orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_invoice record;
  v_invoice_snapshot jsonb;
  v_original_movements jsonb;
  v_correction_movements jsonb := '[]'::jsonb;
  v_expected_product_count integer := 0;
  v_movement_product_count integer := 0;
  v_row record;
  v_product products%rowtype;
  v_inserted_movement inventory_movements%rowtype;
begin
  if length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'correction_reason_required'; end if;
  if length(trim(coalesce(p_actor, ''))) < 3 then raise exception 'correction_actor_required'; end if;
  if to_regclass('public.admin_audit_log') is null then raise exception 'admin_audit_log_required'; end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if v_order.status in ('cancelled', 'delivered') then raise exception 'order_locked_status'; end if;
  if v_order.payment_status = 'paid' then raise exception 'order_payment_locked'; end if;
  if coalesce(v_order.inventory_committed, false) is not true then raise exception 'inventory_not_committed'; end if;

  select * into v_invoice
    from invoices
   where order_id = p_order_id
     and coalesce(status, '') <> 'void'
     and voided_at is null
   order by created_at desc
   limit 1
   for update;

  if not found then raise exception 'active_invoice_not_found'; end if;
  if v_invoice.email_sent_at is not null then raise exception 'invoice_already_emailed'; end if;
  if coalesce(v_invoice.status, '') in ('paid', 'cancelled', 'credited', 'exported') then raise exception 'invoice_locked_status'; end if;

  if exists (
    select 1 from inventory_movements
     where order_id = p_order_id
       and movement_type = 'correction_release'
  ) then
    raise exception 'inventory_already_released';
  end if;

  perform 1 from order_items where order_id = p_order_id for update;
  perform 1 from inventory_movements where order_id = p_order_id for update;

  select count(*) into v_expected_product_count
    from (
      select oi.product_id
        from order_items oi
        join products p on p.id = oi.product_id
       where oi.order_id = p_order_id
         and p.track_inventory is true
       group by oi.product_id
    ) expected;

  select count(*) into v_movement_product_count
    from (
      select product_id
        from inventory_movements
       where order_id = p_order_id
         and movement_type = 'sale'
         and quantity < 0
       group by product_id
    ) moved;

  if v_expected_product_count = 0 then raise exception 'no_tracked_order_items'; end if;
  if v_movement_product_count = 0 then raise exception 'inventory_commit_missing_movements'; end if;
  if v_expected_product_count <> v_movement_product_count then raise exception 'inventory_commit_mismatch'; end if;

  select coalesce(jsonb_agg(to_jsonb(im) order by im.created_at, im.id), '[]'::jsonb)
    into v_original_movements
    from inventory_movements im
   where im.order_id = p_order_id
     and im.movement_type = 'sale'
     and im.quantity < 0;

  for v_row in
    with expected as (
      select oi.product_id, sum(oi.quantity * coalesce(oi.package_quantity, 1))::numeric as expected_units
        from order_items oi
        join products p on p.id = oi.product_id
       where oi.order_id = p_order_id
         and p.track_inventory is true
       group by oi.product_id
    ), moved as (
      select product_id, abs(sum(quantity))::numeric as committed_units
        from inventory_movements
       where order_id = p_order_id
         and movement_type = 'sale'
         and quantity < 0
       group by product_id
    )
    select expected.product_id, expected.expected_units, moved.committed_units
      from expected
      join moved on moved.product_id = expected.product_id
  loop
    if v_row.expected_units <> v_row.committed_units then raise exception 'inventory_commit_mismatch'; end if;

    select * into v_product from products where id = v_row.product_id for update;
    if not found then raise exception 'product_not_found'; end if;
    if coalesce(v_product.track_inventory, false) is not true then raise exception 'product_not_inventory_tracked'; end if;
    if v_product.stock_quantity + v_row.committed_units < 0 then raise exception 'inventory_negative_after_release'; end if;

    update products
       set stock_quantity = stock_quantity + v_row.committed_units
     where id = v_row.product_id;

    insert into inventory_movements(product_id, order_id, movement_type, quantity, reference, notes)
    values (
      v_row.product_id,
      p_order_id,
      'correction_release',
      v_row.committed_units,
      'Order correction release ' || coalesce(v_order.order_number::text, p_order_id),
      'Reverses committed sale movements for order correction. Actor: ' || trim(p_actor) || '. Reason: ' || trim(p_reason)
    )
    returning * into v_inserted_movement;

    v_correction_movements := v_correction_movements || jsonb_build_array(to_jsonb(v_inserted_movement));
  end loop;

  select jsonb_build_object(
    'invoice', to_jsonb(v_invoice),
    'items', coalesce(jsonb_agg(to_jsonb(ii) order by ii.id), '[]'::jsonb)
  )
    into v_invoice_snapshot
    from invoice_items ii
   where ii.invoice_id = v_invoice.id;

  update invoices
     set status = 'void',
         voided_at = now(),
         voided_by = trim(p_actor),
         void_reason = trim(p_reason),
         updated_at = now()
   where id = v_invoice.id;

  update orders
     set inventory_committed = false,
         updated_at = now()
   where id = p_order_id;

  insert into admin_audit_log(admin_email, record_type, record_id, action, metadata)
  values (
    trim(p_actor),
    'order',
    p_order_id,
    'void_invoice_and_release_inventory_for_order_correction',
    jsonb_build_object(
      'actor', trim(p_actor),
      'reason', trim(p_reason),
      'changedAt', now(),
      'invoiceId', v_invoice.id,
      'invoiceNumber', v_invoice.invoice_number,
      'invoiceSeries', coalesce(v_invoice.invoice_series, ''),
      'invoiceSeriesYear', v_invoice.invoice_series_year,
      'invoiceSeriesNumber', v_invoice.invoice_series_number,
      'invoiceSnapshot', v_invoice_snapshot,
      'originalInventoryMovements', v_original_movements,
      'correctionInventoryMovements', v_correction_movements,
      'inventoryCommittedBefore', true,
      'inventoryCommittedAfter', false
    )
  );

  return query select * from orders where id = p_order_id;
end;
$$;

revoke all on function void_invoice_and_release_inventory_for_order_correction(text, text, text) from public, anon, authenticated;
grant execute on function void_invoice_and_release_inventory_for_order_correction(text, text, text) to service_role;

create or replace function reset_inventory_commit_flag_without_movement(
  p_order_id text,
  p_reason text,
  p_actor text
)
returns setof orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_invoice record;
  v_order_lines jsonb;
  v_stock_snapshot jsonb;
  v_movement_count integer := 0;
begin
  if length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'correction_reason_required'; end if;
  if length(trim(coalesce(p_actor, ''))) < 3 then raise exception 'correction_actor_required'; end if;
  if to_regclass('public.admin_audit_log') is null then raise exception 'admin_audit_log_required'; end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if v_order.status in ('cancelled', 'delivered') then raise exception 'order_locked_status'; end if;
  if v_order.payment_status = 'paid' then raise exception 'order_payment_locked'; end if;
  if coalesce(v_order.inventory_committed, false) is not true then raise exception 'inventory_not_committed'; end if;

  select * into v_invoice
    from invoices
   where order_id = p_order_id
     and coalesce(status, '') <> 'void'
     and voided_at is null
   order by created_at desc
   limit 1
   for update;

  if not found then raise exception 'active_invoice_not_found'; end if;
  if v_invoice.email_sent_at is not null then raise exception 'invoice_already_emailed'; end if;
  if coalesce(v_invoice.status, '') in ('paid', 'cancelled', 'credited', 'exported') then raise exception 'invoice_locked_status'; end if;

  perform 1 from order_items where order_id = p_order_id for update;
  perform 1 from inventory_movements where order_id = p_order_id for update;

  select count(*) into v_movement_count
    from inventory_movements
   where order_id = p_order_id;

  if v_movement_count <> 0 then raise exception 'inventory_movements_exist'; end if;

  select coalesce(jsonb_agg(to_jsonb(oi) order by oi.id), '[]'::jsonb)
    into v_order_lines
    from order_items oi
   where oi.order_id = p_order_id;

  perform 1
    from products p
   where p.id in (select product_id from order_items where order_id = p_order_id)
   for share;

  select coalesce(jsonb_agg(jsonb_build_object(
    'productId', p.id,
    'name', p.name,
    'stockQuantity', p.stock_quantity,
    'trackInventory', p.track_inventory
  ) order by p.id), '[]'::jsonb)
    into v_stock_snapshot
    from products p
   where p.id in (select product_id from order_items where order_id = p_order_id);

  update orders
     set inventory_committed = false,
         updated_at = now()
   where id = p_order_id;

  insert into admin_audit_log(admin_email, record_type, record_id, action, metadata)
  values (
    trim(p_actor),
    'order',
    p_order_id,
    'reset_inventory_commit_flag_without_movement',
    jsonb_build_object(
      'actor', trim(p_actor),
      'reason', trim(p_reason),
      'changedAt', now(),
      'orderId', p_order_id,
      'invoiceId', v_invoice.id,
      'invoiceNumber', v_invoice.invoice_number,
      'invoiceSeries', coalesce(v_invoice.invoice_series, ''),
      'invoiceSeriesYear', v_invoice.invoice_series_year,
      'invoiceSeriesNumber', v_invoice.invoice_series_number,
      'movementCount', v_movement_count,
      'orderLines', v_order_lines,
      'stockSnapshot', v_stock_snapshot,
      'inventoryCommittedBefore', true,
      'inventoryCommittedAfter', false,
      'inventoryMutationPerformed', false
    )
  );

  return query select * from orders where id = p_order_id;
end;
$$;

revoke all on function reset_inventory_commit_flag_without_movement(text, text, text) from public, anon, authenticated;
grant execute on function reset_inventory_commit_flag_without_movement(text, text, text) to service_role;

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
  if exists (
    select 1 from invoices
     where order_id = p_order_id
       and coalesce(status, '') <> 'void'
       and voided_at is null
  ) then
    raise exception 'active_invoice_exists';
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
  returning id into v_invoice_id;

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

revoke all on function create_invoice_from_order(text, text, boolean) from public, anon, authenticated;
grant execute on function create_invoice_from_order(text, text, boolean) to service_role;
