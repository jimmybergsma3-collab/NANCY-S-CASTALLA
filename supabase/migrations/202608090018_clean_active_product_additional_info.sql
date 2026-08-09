-- Remove internal review notes from customer-facing additional_info for active visible products.
-- Requested on 2026-08-09: Additional information must not contain admin review notes.

update products
   set additional_info = ''
 where product_status = 'active'
   and is_visible = true
   and (additional_info ilike '%Price review%'
        or additional_info ilike '%price review%'
        or additional_info ilike '%Ingredienten review%'
        or additional_info ilike '%Ingredi?nten review%');
