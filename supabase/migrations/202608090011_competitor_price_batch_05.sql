-- Competitor price review batch 05 for active Europ Foods no-price products.
-- Checked on 2026-08-09. Currency conversions:
-- GBP: ECB 2026-08-07 EUR 1 = GBP 0.85765, so GBP 1 is approximately EUR 1.167.
-- USD: ECB 2026-08-07 EUR 1 = USD 1.1535, so USD 1 is approximately EUR 0.867.

update products
   set price = 9.95,
       sale_price_incl_vat = 9.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 70.17,
       profit_per_unit = 6.35,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 05: Amazon Belgium Remia Like! Mayo Chipotle 800ml; EUR 17.65; Nancy prijs EUR 9.95 incl IVA; https://www.amazon.com.be/-/en/Remia-Like-Mayo-Chipotle-800ml/dp/B0CB5KC2WK'
 where id = 'NC-03097' and supplier_code = '7764' and supplier ilike '%Europ%';

update products
   set price = 6.29,
       sale_price_incl_vat = 6.29,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 26.57,
       profit_per_unit = 1.52,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 05: ComplimentXL Remia Garlic Sriracha Mayonnaise 800ml; EUR 6.29 incl IVA; Nancy prijs EUR 6.29 incl IVA; https://www.complimentxl.eu/product/remia-legendary-real-tasty-mayonaise-garlic-sriracha-800-ml/'
 where id = 'NC-03098' and supplier_code = '7768' and supplier ilike '%Europ%';

update products
   set price = 44.95,
       sale_price_incl_vat = 44.95,
       vat_rate = 21,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 21.27,
       profit_per_unit = 7.90,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 05: DrinkSupermarket Rekorderlig Strawberry & Lime 15 x 500ml; GBP 37.99 = ca. EUR 44.34; Nancy prijs EUR 44.95 incl IVA; marge gecontroleerd met 21% IVA; https://www.drinksupermarket.com/rekorderlig-strawberry-lime-premium-swedish-cider-15x500ml-nrb-glass-bottle-case'
 where id = 'NC-03178' and supplier_code = '8788' and supplier ilike '%Europ%';

update products
   set price = 2.75,
       sale_price_incl_vat = 2.75,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 24.00,
       profit_per_unit = 0.60,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 05: Dawfood Spain Distilled Vinegar 700ml PFO; EUR 2.60 incl IVA; Nancy prijs EUR 2.75 incl IVA; https://dawfoodspain.es/gb/oil-vinager/1714116-distilled-vinegar-700ml-pfo-8858935387008.html'
 where id = 'NC-03221' and supplier_code = '0564' and supplier ilike '%Europ%';

update products
   set price = 5.25,
       sale_price_incl_vat = 5.25,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 47.59,
       profit_per_unit = 2.27,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 05: Produce City Swiss Tomato Ketchup 750ml; USD 5.99 = ca. EUR 5.19; Nancy prijs EUR 5.25 incl IVA; https://producecitymarket.com/products/swiss-tomato-ketchup-750ml'
 where id = 'NC-03231' and supplier_code = '7606' and supplier ilike '%Europ%';

update products
   set price = 8.95,
       sale_price_incl_vat = 8.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 53.93,
       profit_per_unit = 4.39,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 05: Worldwide Holland Remia Satay Sauce Ready Made 800ml; EUR 9.04 incl IVA; Nancy prijs EUR 8.95 incl IVA; https://www.worldwideholland.com/food/sauces-herbs/dutch-hot-sauces/remia/remia-satay-sauce-ready-made-800ml'
 where id = 'NC-03273' and supplier_code = '7692' and supplier ilike '%Europ%';

update products
   set price = 9.95,
       sale_price_incl_vat = 9.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 23.76,
       profit_per_unit = 2.15,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 05: Shop Belgium Vandemoortele Samurai Sauce 1L / Eurodrop Risso Samurai 1L; EUR 13.06 / EUR 8.48; Nancy prijs EUR 9.95 incl IVA; https://www.shopbelgium.net/en/vandemoortele/1227-vandemoortele-samurai-sauce-1-l-8945127332769.html'
 where id = 'NC-03412' and supplier_code = '7687' and supplier ilike '%Europ%';
