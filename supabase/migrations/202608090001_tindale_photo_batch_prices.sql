-- Corrected Tindale photo batch pricing, generated after live DB check on 2026-08-09.
-- Uses LIVE product id + supplier_code because the first SQL used old/import ids for most rows.
-- This updates prices and sales-unit metadata only; it does not change product_status or is_visible.
-- Quantity 1 in webshop/order means one full case/package.

update products
   set price = 35.00,
       sale_price_incl_vat = 35.00,
       unit = '24 x 250ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 34.82,
       profit_per_unit = 11.08,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Classic Combinations RRP GBP 1.25 x24, converted to EUR; webshop price is full package incl IVA.')
 where id = 'NC-02385' and supplier_code = '13538' and supplier ilike '%Tindale%';

update products
   set price = 20.25,
       sale_price_incl_vat = 20.25,
       unit = '6 x 700ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 44.97,
       profit_per_unit = 8.28,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: VK 70cl online GBP 2.89 x6, converted to EUR; webshop price is full package incl IVA.')
 where id = 'NC-02374' and supplier_code = '13540' and supplier ilike '%Tindale%';

update products
   set price = 20.25,
       sale_price_incl_vat = 20.25,
       unit = '6 x 700ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 44.97,
       profit_per_unit = 8.28,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: VK 70cl online GBP 2.89 x6, converted to EUR; webshop price is full package incl IVA.')
 where id = 'NC-02375' and supplier_code = '13541' and supplier ilike '%Tindale%';

update products
   set price = 89.70,
       sale_price_incl_vat = 89.70,
       unit = '6 x 1l',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 30.47,
       profit_per_unit = 24.85,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: 1L ready cocktail benchmark EUR 14.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02388' and supplier_code = '13546' and supplier ilike '%Tindale%';

update products
   set price = 89.70,
       sale_price_incl_vat = 89.70,
       unit = '6 x 1l',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 30.47,
       profit_per_unit = 24.85,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: 1L ready cocktail benchmark EUR 14.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02389' and supplier_code = '13548' and supplier ilike '%Tindale%';

update products
   set price = 95.70,
       sale_price_incl_vat = 95.70,
       unit = '6 x 1l',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 30.00,
       profit_per_unit = 26.10,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: 1L ready cocktail high-cost benchmark EUR 15.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02390' and supplier_code = '13549' and supplier ilike '%Tindale%';

update products
   set price = 89.70,
       sale_price_incl_vat = 89.70,
       unit = '6 x 1l',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 30.47,
       profit_per_unit = 24.85,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: 1L ready cocktail benchmark EUR 14.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02392' and supplier_code = '13550' and supplier ilike '%Tindale%';

update products
   set price = 89.70,
       sale_price_incl_vat = 89.70,
       unit = '6 x 1l',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 30.47,
       profit_per_unit = 24.85,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: 1L ready cocktail benchmark EUR 14.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02391' and supplier_code = '13551' and supplier ilike '%Tindale%';

update products
   set price = 89.70,
       sale_price_incl_vat = 89.70,
       unit = '6 x 1l',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 30.47,
       profit_per_unit = 24.85,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: 1L ready cocktail benchmark EUR 14.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02387' and supplier_code = '13552' and supplier ilike '%Tindale%';

update products
   set price = 89.70,
       sale_price_incl_vat = 89.70,
       unit = '6 x 1l',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 30.47,
       profit_per_unit = 24.85,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: 1L ready cocktail benchmark EUR 14.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02386' and supplier_code = '13553' and supplier ilike '%Tindale%';

update products
   set price = 39.30,
       sale_price_incl_vat = 39.30,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 14.91,
       profit_per_unit = 5.33,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Smirnoff Ice 24x275ml online case EUR 39.30 incl VAT; webshop price is full package incl IVA.')
 where id = 'NC-02360' and supplier_code = '12083' and supplier ilike '%Tindale%';

update products
   set price = 35.40,
       sale_price_incl_vat = 35.40,
       unit = '12 x 250ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 33.78,
       profit_per_unit = 10.87,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Bacardi Mojito Spain EUR 2.95 x12; webshop price is full package incl IVA.')
 where id = 'NC-02359' and supplier_code = '12243' and supplier ilike '%Tindale%';

update products
   set price = 35.40,
       sale_price_incl_vat = 35.40,
       unit = '12 x 250ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 33.78,
       profit_per_unit = 10.87,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Bacardi Mojito/Limonada benchmark EUR 2.95 x12; webshop price is full package incl IVA.')
 where id = 'NC-02358' and supplier_code = '12244' and supplier ilike '%Tindale%';

update products
   set price = 52.80,
       sale_price_incl_vat = 52.80,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.00,
       profit_per_unit = 16.80,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: WKD/Breezer alcopop benchmark EUR 2.20 x24; webshop price is full package incl IVA.')
 where id = 'NC-02353' and supplier_code = '13502' and supplier ilike '%Tindale%';

update products
   set price = 52.80,
       sale_price_incl_vat = 52.80,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 18.92,
       profit_per_unit = 9.08,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: WKD/Breezer alcopop benchmark EUR 2.20 x24; webshop price is full package incl IVA.')
 where id = 'NC-02357' and supplier_code = '13503' and supplier ilike '%Tindale%';

update products
   set price = 52.80,
       sale_price_incl_vat = 52.80,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 18.92,
       profit_per_unit = 9.08,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: WKD/Breezer alcopop benchmark EUR 2.20 x24; webshop price is full package incl IVA.')
 where id = 'NC-02356' and supplier_code = '13504' and supplier ilike '%Tindale%';

update products
   set price = 52.80,
       sale_price_incl_vat = 52.80,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 18.92,
       profit_per_unit = 9.08,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: WKD/Breezer alcopop benchmark EUR 2.20 x24; webshop price is full package incl IVA.')
 where id = 'NC-02354' and supplier_code = '13505' and supplier ilike '%Tindale%';

update products
   set price = 45.00,
       sale_price_incl_vat = 45.00,
       unit = '12 x 25cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 23.44,
       profit_per_unit = 9.59,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Bombay Sapphire and Tonic premium RTD benchmark EUR 3.75 x12; webshop price is full package incl IVA.')
 where id = 'NC-02369' and supplier_code = '13506' and supplier ilike '%Tindale%';

update products
   set price = 26.40,
       sale_price_incl_vat = 26.40,
       unit = '12 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 18.92,
       profit_per_unit = 4.54,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Breezer benchmark EUR 2.20 x12; webshop price is full package incl IVA.')
 where id = 'NC-02355' and supplier_code = '13539' and supplier ilike '%Tindale%';

update products
   set price = 56.40,
       sale_price_incl_vat = 56.40,
       unit = '24 x 33cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.99,
       profit_per_unit = 18.45,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Le Coq Spain/Europe price EUR 2.35 x24; webshop price is full package incl IVA.')
 where id = 'NC-02362' and supplier_code = '810130' and supplier ilike '%Tindale%';

update products
   set price = 56.40,
       sale_price_incl_vat = 56.40,
       unit = '24 x 33cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.99,
       profit_per_unit = 18.45,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Le Coq Spain/Europe price EUR 2.35 x24; webshop price is full package incl IVA.')
 where id = 'NC-02363' and supplier_code = '810131' and supplier ilike '%Tindale%';

update products
   set price = 56.40,
       sale_price_incl_vat = 56.40,
       unit = '24 x 33cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.99,
       profit_per_unit = 18.45,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Le Coq Spain/Europe price EUR 2.35 x24; webshop price is full package incl IVA.')
 where id = 'NC-02365' and supplier_code = '810133' and supplier ilike '%Tindale%';

update products
   set price = 56.40,
       sale_price_incl_vat = 56.40,
       unit = '24 x 33cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.99,
       profit_per_unit = 18.45,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Le Coq Spain/Europe price EUR 2.35 x24; webshop price is full package incl IVA.')
 where id = 'NC-02366' and supplier_code = '810134' and supplier ilike '%Tindale%';

update products
   set price = 56.40,
       sale_price_incl_vat = 56.40,
       unit = '24 x 33cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.99,
       profit_per_unit = 18.45,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Le Coq Spain/Europe price EUR 2.35 x24; webshop price is full package incl IVA.')
 where id = 'NC-02367' and supplier_code = '810135' and supplier ilike '%Tindale%';

update products
   set price = 56.40,
       sale_price_incl_vat = 56.40,
       unit = '24 x 33cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.99,
       profit_per_unit = 18.45,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Le Coq Spain/Europe price EUR 2.35 x24; webshop price is full package incl IVA.')
 where id = 'NC-02368' and supplier_code = '810136' and supplier ilike '%Tindale%';

update products
   set price = 53.70,
       sale_price_incl_vat = 53.70,
       unit = '6 x 75cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 6,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 57.28,
       profit_per_unit = 25.42,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Spritz 75cl benchmark EUR 8.95 x6; webshop price is full package incl IVA.')
 where id = 'NC-02328' and supplier_code = '121071' and supplier ilike '%Tindale%';

update products
   set price = 37.90,
       sale_price_incl_vat = 37.90,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 36.53,
       profit_per_unit = 12.58,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: VK 24x275ml online multipack benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02371' and supplier_code = '12231' and supplier ilike '%Tindale%';

update products
   set price = 37.90,
       sale_price_incl_vat = 37.90,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 36.53,
       profit_per_unit = 12.58,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: VK 24x275ml online multipack benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02370' and supplier_code = '12233' and supplier ilike '%Tindale%';

update products
   set price = 37.90,
       sale_price_incl_vat = 37.90,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 36.53,
       profit_per_unit = 12.58,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: VK 24x275ml online multipack benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02372' and supplier_code = '12234' and supplier ilike '%Tindale%';

update products
   set price = 45.00,
       sale_price_incl_vat = 45.00,
       unit = '12 x 200ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 15.19,
       profit_per_unit = 5.65,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Agave Boom 200ml premium RTD benchmark EUR 3.75 x12; webshop price is full package incl IVA.')
 where id = 'NC-02351' and supplier_code = '13449' and supplier ilike '%Tindale%';

update products
   set price = 45.00,
       sale_price_incl_vat = 45.00,
       unit = '12 x 200ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 15.19,
       profit_per_unit = 5.65,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Agave Boom 200ml premium RTD benchmark EUR 3.75 x12; webshop price is full package incl IVA.')
 where id = 'NC-02350' and supplier_code = '13450' and supplier ilike '%Tindale%';

update products
   set price = 45.00,
       sale_price_incl_vat = 45.00,
       unit = '12 x 200ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 15.19,
       profit_per_unit = 5.65,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Agave Boom 200ml premium RTD benchmark EUR 3.75 x12; webshop price is full package incl IVA.')
 where id = 'NC-02352' and supplier_code = '13451' and supplier ilike '%Tindale%';

update products
   set price = 45.00,
       sale_price_incl_vat = 45.00,
       unit = '12 x 200ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 15.19,
       profit_per_unit = 5.65,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Agave Boom 200ml premium RTD benchmark EUR 3.75 x12; webshop price is full package incl IVA.')
 where id = 'NC-02349' and supplier_code = '13452' and supplier ilike '%Tindale%';

update products
   set price = 37.90,
       sale_price_incl_vat = 37.90,
       unit = '24 x 275ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 36.53,
       profit_per_unit = 12.58,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: VK 24x275ml online multipack benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02373' and supplier_code = '13520' and supplier ilike '%Tindale%';

update products
   set price = 23.40,
       sale_price_incl_vat = 23.40,
       unit = '12 x 250ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.69,
       profit_per_unit = 7.59,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: All Shook Up benchmark EUR 1.95 x12; webshop price is full package incl IVA.')
 where id = 'NC-02378' and supplier_code = '13521' and supplier ilike '%Tindale%';

update products
   set price = 23.40,
       sale_price_incl_vat = 23.40,
       unit = '12 x 250ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.69,
       profit_per_unit = 7.59,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: All Shook Up benchmark EUR 1.95 x12; webshop price is full package incl IVA.')
 where id = 'NC-02376' and supplier_code = '13522' and supplier ilike '%Tindale%';

update products
   set price = 23.40,
       sale_price_incl_vat = 23.40,
       unit = '12 x 250ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.69,
       profit_per_unit = 7.59,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: All Shook Up benchmark EUR 1.95 x12; webshop price is full package incl IVA.')
 where id = 'NC-02379' and supplier_code = '13524' and supplier ilike '%Tindale%';

update products
   set price = 23.40,
       sale_price_incl_vat = 23.40,
       unit = '12 x 250ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.69,
       profit_per_unit = 7.59,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: All Shook Up benchmark EUR 1.95 x12; webshop price is full package incl IVA.')
 where id = 'NC-02377' and supplier_code = '13542' and supplier ilike '%Tindale%';

update products
   set price = 21.20,
       sale_price_incl_vat = 21.20,
       unit = '12 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 28.50,
       profit_per_unit = 5.49,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: White Claw Spain 12-pack EUR 21.20; webshop price is full package incl IVA.')
 where id = 'NC-02382' and supplier_code = '13554' and supplier ilike '%Tindale%';

update products
   set price = 56.40,
       sale_price_incl_vat = 56.40,
       unit = '24 x 33cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.99,
       profit_per_unit = 18.45,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Le Coq Spain/Europe price EUR 2.35 x24; webshop price is full package incl IVA.')
 where id = 'NC-02364' and supplier_code = '810132' and supplier ilike '%Tindale%';

update products
   set price = 54.00,
       sale_price_incl_vat = 54.00,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 23.59,
       profit_per_unit = 10.53,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: UK ale/imported 500ml benchmark EUR 2.25 x24; webshop price is full package incl IVA.')
 where id = 'NC-02277' and supplier_code = '120101' and supplier ilike '%Tindale%';

update products
   set price = 32.00,
       sale_price_incl_vat = 32.00,
       unit = '24 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 24.56,
       profit_per_unit = 6.50,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Coors 330ml case benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02274' and supplier_code = '120116' and supplier ilike '%Tindale%';

update products
   set price = 49.20,
       sale_price_incl_vat = 49.20,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 25.63,
       profit_per_unit = 10.42,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Coors 500ml case benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02273' and supplier_code = '120117' and supplier ilike '%Tindale%';

update products
   set price = 42.00,
       sale_price_incl_vat = 42.00,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 31.55,
       profit_per_unit = 10.95,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Carling 500ml case benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02267' and supplier_code = '120120' and supplier ilike '%Tindale%';

update products
   set price = 39.95,
       sale_price_incl_vat = 39.95,
       unit = '24 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 36.03,
       profit_per_unit = 11.90,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Desperados 24x330ml Spain/retail case benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02270' and supplier_code = '12079' and supplier ilike '%Tindale%';

update products
   set price = 36.95,
       sale_price_incl_vat = 36.95,
       unit = '24 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 34.08,
       profit_per_unit = 10.41,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Budweiser 24x330ml retail case benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02272' and supplier_code = '12080' and supplier ilike '%Tindale%';

update products
   set price = 49.95,
       sale_price_incl_vat = 49.95,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 44.77,
       profit_per_unit = 18.48,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Desperados 24x500ml benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02271' and supplier_code = '12260' and supplier ilike '%Tindale%';

update products
   set price = 36.95,
       sale_price_incl_vat = 36.95,
       unit = '24 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 35.55,
       profit_per_unit = 10.86,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Corona 24x330ml retail case benchmark; webshop price is full package incl IVA.')
 where id = 'NC-02275' and supplier_code = '12273' and supplier ilike '%Tindale%';

update products
   set price = 47.40,
       sale_price_incl_vat = 47.40,
       unit = '12 x 100cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 36.10,
       profit_per_unit = 14.14,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Faxe 1L strong beer benchmark EUR 3.95 x12; webshop price is full package incl IVA.')
 where id = 'NC-02283' and supplier_code = '12277' and supplier ilike '%Tindale%';

update products
   set price = 54.00,
       sale_price_incl_vat = 54.00,
       unit = '12 x 100cl',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 43.91,
       profit_per_unit = 19.60,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Faxe 1L extra strong benchmark EUR 4.50 x12; webshop price is full package incl IVA.')
 where id = 'NC-02282' and supplier_code = '12278' and supplier ilike '%Tindale%';

update products
   set price = 21.20,
       sale_price_incl_vat = 21.20,
       unit = '12 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 28.50,
       profit_per_unit = 5.49,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: White Claw Spain 12-pack EUR 21.20; webshop price is full package incl IVA.')
 where id = 'NC-02380' and supplier_code = '13533' and supplier ilike '%Tindale%';

update products
   set price = 21.20,
       sale_price_incl_vat = 21.20,
       unit = '12 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 28.50,
       profit_per_unit = 5.49,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: White Claw Spain 12-pack EUR 21.20; webshop price is full package incl IVA.')
 where id = 'NC-02381' and supplier_code = '13534' and supplier ilike '%Tindale%';

update products
   set price = 21.20,
       sale_price_incl_vat = 21.20,
       unit = '12 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 12,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 28.50,
       profit_per_unit = 5.49,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: White Claw Spain 12-pack EUR 21.20; webshop price is full package incl IVA.')
 where id = 'NC-02383' and supplier_code = '13535' and supplier ilike '%Tindale%';

update products
   set price = 51.60,
       sale_price_incl_vat = 51.60,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 46.37,
       profit_per_unit = 19.77,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: British Food Imports John Smiths EUR 2.15 x24; webshop price is full package incl IVA.')
 where id = 'NC-02268' and supplier_code = '12006' and supplier ilike '%Tindale%';

update products
   set price = 54.00,
       sale_price_incl_vat = 54.00,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 28.32,
       profit_per_unit = 12.64,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Greene King IPA imported benchmark EUR 2.25 x24; webshop price is full package incl IVA.')
 where id = 'NC-02276' and supplier_code = '120100' and supplier ilike '%Tindale%';

update products
   set price = 54.00,
       sale_price_incl_vat = 54.00,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 23.59,
       profit_per_unit = 10.53,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Old Speckled Hen Spain EUR 2.25 x24; webshop price is full package incl IVA.')
 where id = 'NC-02269' and supplier_code = '120103' and supplier ilike '%Tindale%';

update products
   set price = 52.80,
       sale_price_incl_vat = 52.80,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 19.75,
       profit_per_unit = 8.62,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Hobgoblin Ruby Europe EUR 2.20 x24; webshop price is full package incl IVA.')
 where id = 'NC-02278' and supplier_code = '120104' and supplier ilike '%Tindale%';

update products
   set price = 71.40,
       sale_price_incl_vat = 71.40,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 34.13,
       profit_per_unit = 20.14,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Trooper Morrisons GBP 2.55 x24, converted to EUR; webshop price is full package incl IVA.')
 where id = 'NC-02281' and supplier_code = '120106' and supplier ilike '%Tindale%';

update products
   set price = 52.80,
       sale_price_incl_vat = 52.80,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 14.84,
       profit_per_unit = 6.48,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Hobgoblin Gold Europe EUR 2.20 x24; webshop price is full package incl IVA.')
 where id = 'NC-02279' and supplier_code = '120124' and supplier ilike '%Tindale%';

update products
   set price = 55.20,
       sale_price_incl_vat = 55.20,
       unit = '24 x 500ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 10.10,
       profit_per_unit = 4.61,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Hobgoblin IPA Europe EUR 2.30 x24; webshop price is full package incl IVA.')
 where id = 'NC-02280' and supplier_code = '120125' and supplier ilike '%Tindale%';

update products
   set price = 41.60,
       sale_price_incl_vat = 41.60,
       unit = '24 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 39.53,
       profit_per_unit = 13.59,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Peroni Tesco 18-pack unit price x24, converted to EUR; webshop price is full package incl IVA.')
 where id = 'NC-02284' and supplier_code = '120130' and supplier ilike '%Tindale%';

update products
   set price = 39.60,
       sale_price_incl_vat = 39.60,
       unit = '24 x 330ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 38.22,
       profit_per_unit = 12.51,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: British Food Imports Stella EUR 1.65 x24; webshop price is full package incl IVA.')
 where id = 'NC-02285' and supplier_code = '120131' and supplier ilike '%Tindale%';

update products
   set price = 46.90,
       sale_price_incl_vat = 46.90,
       unit = '24 x 440ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 14.55,
       profit_per_unit = 5.64,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Guinness 0.0 Tesco 10-pack unit price x24, converted to EUR; webshop price is full package incl IVA.')
 where id = 'NC-02265' and supplier_code = '120200' and supplier ilike '%Tindale%';

update products
   set price = 47.05,
       sale_price_incl_vat = 47.05,
       unit = '24 x 440ml',
       sales_unit_type = 'case',
       sales_unit_quantity = 24,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 16.06,
       profit_per_unit = 6.24,
       package_options = '[]'::jsonb,
       additional_info = concat(coalesce(additional_info, ''), '\nPrice review 2026-08-09 corrected: Guinness 24-pack retail benchmark, converted to EUR; webshop price is full package incl IVA.')
 where id = 'NC-02266' and supplier_code = '12033' and supplier ilike '%Tindale%';

