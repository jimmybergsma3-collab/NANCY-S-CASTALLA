-- Keep admin "Online" aligned with the public webshop product filter.
-- Ten Europ Foods products were visibly active, priced and ready, but missed the
-- sales-unit type required by the public safety check.
update public.products
set
  sales_unit_type = 'single',
  sales_unit_quantity = 1,
  sales_unit_confirmed = true,
  price_basis_confirmed = true,
  is_visible = true,
  ready_for_publish = true,
  product_status = 'active',
  profit_per_unit = round(((sale_price_incl_vat / (1 + (vat_rate / 100.0))) - coalesce(nullif(unit_cost, 0), cost_price_ex_vat))::numeric, 2),
  margin_percent = case
    when sale_price_incl_vat > 0 then round(((((sale_price_incl_vat / (1 + (vat_rate / 100.0))) - coalesce(nullif(unit_cost, 0), cost_price_ex_vat)) / (sale_price_incl_vat / (1 + (vat_rate / 100.0)))) * 100)::numeric)
    else 0
  end
where id in (
  'NC-02623',
  'NC-02627',
  'NC-02628',
  'NC-02629',
  'NC-02630',
  'NC-02631',
  'NC-02634',
  'NC-03022',
  'NC-03446',
  'NC-03452'
);

-- Honey Roast Parsnips was marked visible but its selling price was below cost,
-- so it must stay out of the webshop until the selling price is reviewed.
update public.products
set is_visible = false
where id = 'NC-02773';
