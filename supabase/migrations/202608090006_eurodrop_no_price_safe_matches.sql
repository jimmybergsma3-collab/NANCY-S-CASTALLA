-- Eurodrop + EUR 0.20 price updates for safe matches from 100 active Europ Foods no-price products.
-- Source: https://eurodrop.es/products.json checked on 2026-08-09.

update products
   set price = 6.78,
       sale_price_incl_vat = 6.78,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 15.58,
       profit_per_unit = 0.96,
       additional_info = 'Eurodrop price review 2026-08-09: Streaky Bacon (454g); Eurodrop EUR 6.58 + EUR 0.20 = EUR 6.78; https://eurodrop.es/products/streaky-bacon-454-gr'
 where id = 'NC-03264' and supplier_code = '6946' and supplier ilike '%Europ%';

update products
   set price = 4.88,
       sale_price_incl_vat = 4.88,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 12.17,
       profit_per_unit = 0.54,
       additional_info = 'Eurodrop price review 2026-08-09: Like! Mayo Vegan Mayonnaise; Eurodrop EUR 4.68 + EUR 0.20 = EUR 4.88; https://eurodrop.es/products/like-vegan-mayonnaise'
 where id = 'NC-03272' and supplier_code = '7685' and supplier ilike '%Europ%';

update products
   set price = 3.87,
       sale_price_incl_vat = 3.87,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 17.62,
       profit_per_unit = 0.62,
       additional_info = 'Eurodrop price review 2026-08-09: Knoflooksaus (750ml)  Remia; Eurodrop EUR 3.67 + EUR 0.20 = EUR 3.87; https://eurodrop.es/products/remia-knoflooksaus'
 where id = 'NC-03418' and supplier_code = '7772' and supplier ilike '%Europ%';

