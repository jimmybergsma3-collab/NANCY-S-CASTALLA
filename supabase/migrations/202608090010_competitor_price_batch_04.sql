-- Competitor price review batch 04 for active Europ Foods no-price products.
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
       margin_percent = 30.39,
       profit_per_unit = 2.75,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 04: Eurocross Meadowvale Breaded Chicken Nuggets 1kg; GBP 8.50 = ca. EUR 9.92; Nancy prijs EUR 9.95 incl IVA; https://www.eurocross.co.uk/product/meadowvale-breaded-chicken-nuggets-1kg/'
 where id = 'NC-02881' and supplier_code = '1146' and supplier ilike '%Europ%';

update products
   set price = 15.95,
       sale_price_incl_vat = 15.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 31.72,
       profit_per_unit = 4.60,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 04: Dutch Expat Shop Jumbo Unsalted Cream Butter 250g; EUR 3.89 per 250g = EUR 15.56/kg; Nancy prijs EUR 15.95 incl IVA; https://www.dutchexpatshop.com/en/jumbo-unsalted-cream-butter-only-available-within-europe.html'
 where id = 'NC-02966' and supplier_code = '3902' and supplier ilike '%Europ%';

update products
   set price = 25.95,
       sale_price_incl_vat = 25.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 41.08,
       profit_per_unit = 9.69,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 04: Gourmet Versand Soignon goat cheese roll 1kg; EUR 25.77 per 1kg; Nancy prijs EUR 25.95 incl IVA; https://www.gourmet-versand.com/en/article3464/goats-cheese-in-roll-soignon-1-kg.html'
 where id = 'NC-02975' and supplier_code = '3961' and supplier ilike '%Europ%';

update products
   set price = 3.95,
       sale_price_incl_vat = 3.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 22.01,
       profit_per_unit = 0.79,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 04: Campbells Roquefort Cheese 100g; GBP 3.50 = ca. EUR 4.08 per 100g; Nancy prijs EUR 3.95 incl IVA; https://www.campbellsmeat.com/product/roquefort-cheese-100g.html'
 where id = 'NC-02976' and supplier_code = '3912' and supplier ilike '%Europ%';

update products
   set price = 15.95,
       sale_price_incl_vat = 15.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 32.41,
       profit_per_unit = 4.70,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 04: Walmart Maggi Season-Up Chicken Seasoning 430g; USD 17.99 = ca. EUR 15.60; Nancy prijs EUR 15.95 incl IVA; https://www.walmart.com/ip/Maggi-Season-Up-Chicken-Seasoning-430g-15-2-oz-Authentic-Jamaican-All-Purpose-Chicken-Seasoning-Blend-Caribbean-Flavor-Marinade-Cooking-Seasoning/18918822138'
 where id = 'NC-03003' and supplier_code = '7827' and supplier ilike '%Europ%';
