update products
set category = 'Asian & Indonesian products'
where category = 'Asian products';

update products
set categories = (
  select coalesce(
    jsonb_agg(
      case
        when category_name = 'Asian products' then 'Asian & Indonesian products'
        else category_name
      end
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements_text(categories) as category_values(category_name)
)
where categories ? 'Asian products';
