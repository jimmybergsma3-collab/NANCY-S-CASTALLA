alter table products
add column if not exists categories jsonb not null default '[]'::jsonb;

update products
set categories = case
  when origin = 'Dutch' and category <> 'Dutch products' then jsonb_build_array(category, 'Dutch products')
  when origin in ('British', 'Irish') and category <> 'British & Irish products' then jsonb_build_array(category, 'British & Irish products')
  when origin = 'German' and category <> 'German products' then jsonb_build_array(category, 'German products')
  when origin = 'Asian' and category <> 'Asian products' then jsonb_build_array(category, 'Asian products')
  when origin = 'South American' and category <> 'South American products' then jsonb_build_array(category, 'South American products')
  else jsonb_build_array(category)
end
where categories = '[]'::jsonb;
