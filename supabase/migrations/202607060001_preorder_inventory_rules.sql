create or replace function transition_order_status(p_order_id text, p_status text, p_payment_status text)
returns setof orders
language plpgsql security definer set search_path = public
as $$
declare v_order orders%rowtype; v_item record; v_product products%rowtype; v_units numeric;
begin
  if p_status not in ('new','confirmed','processing','ready_for_collection','shipped','delivered','cancelled') then raise exception 'INVALID_STATUS'; end if;
  if p_payment_status not in ('pending','paid','failed','refunded','cancelled') then raise exception 'INVALID_PAYMENT_STATUS'; end if;
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;

  if p_status = 'confirmed' and not v_order.inventory_committed then
    for v_item in select * from order_items where order_id = p_order_id loop
      select * into v_product from products where id = v_item.product_id for update;
      v_units := v_item.quantity * coalesce(v_item.package_quantity, 1);
      if v_product.stock_status = 'available' and v_product.track_inventory and v_product.stock_quantity < v_units then
        raise exception 'INSUFFICIENT_STOCK:% (available %, required %)', v_product.name, v_product.stock_quantity, v_units;
      end if;
      if v_product.stock_status = 'available' and v_product.track_inventory then
        update products set stock_quantity = stock_quantity - v_units where id = v_product.id;
        insert into inventory_movements(product_id, order_id, movement_type, quantity, reference)
        values(v_product.id, p_order_id, 'sale', -v_units, 'Order ' || coalesce(v_order.order_number::text, p_order_id));
      end if;
    end loop;
    v_order.inventory_committed := true;
  elsif p_status = 'cancelled' and v_order.inventory_committed then
    for v_item in select * from order_items where order_id = p_order_id loop
      select * into v_product from products where id = v_item.product_id for update;
      v_units := v_item.quantity * coalesce(v_item.package_quantity, 1);
      if exists (
        select 1 from inventory_movements
        where product_id = v_product.id and order_id = p_order_id and movement_type = 'sale'
      ) then
        update products set stock_quantity = stock_quantity + v_units where id = v_product.id;
        insert into inventory_movements(product_id, order_id, movement_type, quantity, reference)
        values(v_product.id, p_order_id, 'cancellation', v_units, 'Cancelled order ' || coalesce(v_order.order_number::text, p_order_id));
      end if;
    end loop;
    v_order.inventory_committed := false;
  end if;

  update orders set status=p_status, payment_status=p_payment_status, inventory_committed=v_order.inventory_committed, updated_at=now() where id=p_order_id;
  return query select * from orders where id=p_order_id;
end;
$$;
