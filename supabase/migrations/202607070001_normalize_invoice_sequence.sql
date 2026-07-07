do $$
declare
  v_sequence text;
  v_next_number bigint;
begin
  v_sequence := pg_get_serial_sequence('public.invoices', 'invoice_number');
  select greatest(coalesce(max(invoice_number), 0) + 1, 1) into v_next_number from public.invoices;
  if v_sequence is not null then
    perform setval(v_sequence, v_next_number, false);
  end if;
end;
$$;
