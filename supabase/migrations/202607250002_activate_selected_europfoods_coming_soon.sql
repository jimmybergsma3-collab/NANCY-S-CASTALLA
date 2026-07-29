-- Activate a controlled Europ Foods selection as visible coming-soon products.
-- Source: "price list dutch.pdf" from Europ Foods, internal PAG sections supplied by Nancy.
-- Products stay not orderable because prices, public sales unit and photos still need review.

create or replace function nancys_primary_category_for_europfoods(p_category_source text)
returns text
language sql
immutable
as $$
  select case
    when coalesce(p_category_source, '') ilike '%ONTBIJT%' then 'Breakfast products'
    when coalesce(p_category_source, '') ilike '%WORSTJES%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%SUNDAY%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%VLEES%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%HAMBURGERS%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%KEBAB%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%RUNDVLEES%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%VARKENSHAAS%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%LAM%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%FISH%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%VIS%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%PASTEIEN%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%HOOFDGERECHTEN%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%SNACKS%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%FINGERFOOD%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%BORRELHAPJES%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%KROKETTEN%' then 'Dutch products'
    when coalesce(p_category_source, '') ilike '%MEXICAANS%' then 'South American products'
    when coalesce(p_category_source, '') ilike '%INDIAAN%' then 'Asian & Indonesian products'
    when coalesce(p_category_source, '') ilike '%INDONESISCH%' then 'Asian & Indonesian products'
    when coalesce(p_category_source, '') ilike '%AZIATISCH%' then 'Asian & Indonesian products'
    when coalesce(p_category_source, '') ilike '%NEDERLANDS%' then 'Dutch products'
    when coalesce(p_category_source, '') ilike '%BELGISCH%' then 'Dutch products'
    when coalesce(p_category_source, '') ilike '%PANNEKOEN%' then 'Dutch products'
    when coalesce(p_category_source, '') ilike '%DUITSE%' then 'German products'
    when coalesce(p_category_source, '') ilike '%BROOD%' then 'Bread & bakery'
    when coalesce(p_category_source, '') ilike '%AARDAPPELEN%' then 'Frozen snacks'
    when coalesce(p_category_source, '') ilike '%GROENTEN%' then 'Vegan & vegetarian'
    when coalesce(p_category_source, '') ilike '%FRUIT%' then 'Vegan & vegetarian'
    when coalesce(p_category_source, '') ilike '%VEGAANS%' then 'Vegan & vegetarian'
    when coalesce(p_category_source, '') ilike '%VEGETARISCH%' then 'Vegan & vegetarian'
    when coalesce(p_category_source, '') ilike '%TAARTEN%' then 'Coffee & drinks'
    when coalesce(p_category_source, '') ilike '%NAARGERECHTEN%' then 'Coffee & drinks'
    when coalesce(p_category_source, '') ilike '%THEE TIJD%' then 'Coffee & drinks'
    when coalesce(p_category_source, '') ilike '%DEBIC%' then 'Breakfast products'
    when coalesce(p_category_source, '') ilike '%BOTERS%' then 'Breakfast products'
    when coalesce(p_category_source, '') ilike '%KAAS%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%ZUIVEL%' then 'Breakfast products'
    when coalesce(p_category_source, '') ilike '%KRUIDEN%' then 'Sauces & condiments'
    when coalesce(p_category_source, '') ilike '%SAUS%' then 'Sauces & condiments'
    when coalesce(p_category_source, '') ilike '%SAUZEN%' then 'Sauces & condiments'
    when coalesce(p_category_source, '') ilike '%ZAKJES%' then 'Sauces & condiments'
    when coalesce(p_category_source, '') ilike '%BLIKVOEDSEL%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%SUPERMAARKT%' then 'British & Irish products'
    when coalesce(p_category_source, '') ilike '%MOJITOS%' then 'Coffee & drinks'
    when coalesce(p_category_source, '') ilike '%DRANKJES%' then 'Coffee & drinks'
    when coalesce(p_category_source, '') ilike '%NON FOOD%' then 'Non-food & packaging'
    else 'British & Irish products'
  end;
$$;

create or replace function nancys_categories_for_europfoods(p_category_source text, p_storage_type text)
returns text[]
language plpgsql
immutable
as $$
declare
  v_primary text := nancys_primary_category_for_europfoods(p_category_source);
  v_categories text[] := array[v_primary];
begin
  if coalesce(p_storage_type, '') ilike '%diepvries%'
     and v_primary <> 'Frozen snacks' then
    v_categories := v_categories || array['Frozen snacks'];
  end if;

  if coalesce(p_category_source, '') ilike '%BROOD%'
     and v_primary <> 'Bread & bakery' then
    v_categories := v_categories || array['Bread & bakery'];
  end if;

  if coalesce(p_category_source, '') ilike '%ONTBIJT%'
     and v_primary <> 'Breakfast products' then
    v_categories := v_categories || array['Breakfast products'];
  end if;

  if coalesce(p_category_source, '') ilike '%NEDERLANDS%'
     and v_primary <> 'Dutch products' then
    v_categories := v_categories || array['Dutch products'];
  end if;

  if coalesce(p_category_source, '') ilike '%INDONESISCH%'
     and v_primary <> 'Asian & Indonesian products' then
    v_categories := v_categories || array['Asian & Indonesian products'];
  end if;

  return (select array_agg(distinct category) from unnest(v_categories) as category);
end;
$$;

do $$
declare
  v_affected integer;
begin
  with selected_offers as (
    select distinct on (o.product_id)
      o.product_id,
      o.category_source,
      o.storage_type
    from supplier_product_offers o
    where o.active = true
      and o.product_id is not null
      and o.source_batch like 'IMPORT_2026_LIVE_EUROPFOODS%'
      and (
        o.supplier_code = any(array[
          '0007', '0062', '0370', '0371', '0372', '0500', '0501', '0502',
          '0564', '1288', '3100', '3292', '3307', '3344', '6945', '6946',
          '7003', '7522', '7524', '7525', '7527', '7606', '7628', '7629',
          '7630', '7684', '7685', '7686', '7687', '7688', '7689', '7690',
          '7691', '7692', '7709', '7764', '7767', '7768', '7771', '7772',
          '7827', '7828', '7852', '8770', '8771', '8772', '8773', '8774'
        ])
        or substring(o.category_source from '^PAG[[:space:]]+([0-9]+)')::integer = any(array[
          6, 7, 9, 14, 16, 18, 19, 24, 26, 27, 30, 32, 36, 37, 38, 40,
          42, 44, 45, 46, 51, 52, 60, 61, 62, 76
        ])
      )
    order by o.product_id, o.category_source
  )
  update products p
     set product_status = 'active',
         is_visible = true,
         featured = false,
         is_new = false,
         description = 'Description coming soon.',
         price = 0,
         sale_price_incl_vat = 0,
         margin_percent = 0,
         profit_per_unit = 0,
         stock_status = 'coming-soon',
         category = nancys_primary_category_for_europfoods(s.category_source),
         categories = to_jsonb(nancys_categories_for_europfoods(s.category_source, s.storage_type)),
         needs_category_review = false,
         needs_tax_review = true,
         needs_package_review = true,
         needs_image_review = true,
         needs_translation_review = true,
         ready_for_publish = false,
         sales_unit_confirmed = false,
         price_basis_confirmed = false,
         image_url = '',
         images = '[]'::jsonb
    from selected_offers s
   where p.id = s.product_id
     and p.import_batch like 'IMPORT_2026_LIVE_EUROPFOODS%'
     and coalesce(p.product_status, '') <> 'archived';

  get diagnostics v_affected = row_count;
  raise notice 'Selected Europ Foods products activated as coming-soon: %', v_affected;
end $$;

revoke all on function nancys_primary_category_for_europfoods(text) from public, anon, authenticated;
revoke all on function nancys_categories_for_europfoods(text, text) from public, anon, authenticated;
grant execute on function nancys_primary_category_for_europfoods(text) to service_role;
grant execute on function nancys_categories_for_europfoods(text, text) to service_role;
