-- Competitor price review batch 02 for active Europ Foods no-price products.
-- Checked on 2026-08-09. GBP converted with ECB 2026-08-07 reference:
-- EUR 1 = GBP 0.85765, so GBP 1 is approximately EUR 1.167.

update products
   set price = 24.95,
       sale_price_incl_vat = 24.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 31.66,
       profit_per_unit = 7.18,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 02: Karadarshop Weisswurst sausages 4 x 60g; EUR 5.15 per 4 x 60g = EUR 25.75 per 20; Nancy prijs EUR 24.95 incl IVA; https://karadarshop.com/en/sustainable-authentic/weisswurst-sausages-from-munich4x60g-pramstrahler'
 where id = 'NC-02683' and supplier_code = '5711' and supplier ilike '%Europ%';

update products
   set price = 17.50,
       sale_price_incl_vat = 17.50,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 39.66,
       profit_per_unit = 6.31,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 02: Brakes Lamb Weston Sweet Potato Fries 2.5kg; GBP 15.04 = ca. EUR 17.55; Nancy prijs EUR 17.50 incl IVA; https://www.brake.co.uk/frozen-produce-accompaniments/chips-fries/alternative-chips-fries/sweet-potato/lamb-weston-sweet-potato-fries-2500g/p/461503'
 where id = 'NC-02733' and supplier_code = '4536' and supplier ilike '%Europ%';

update products
   set price = 15.95,
       sale_price_incl_vat = 15.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 24.83,
       profit_per_unit = 3.60,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 02: Brakes Lamb Weston Sweet Potato Fries 2.5kg; GBP 15.04 = ca. EUR 17.55 for 2.5kg, ca. EUR 15.94 for 2.27kg; Nancy prijs EUR 15.95 incl IVA; https://www.brake.co.uk/frozen-produce-accompaniments/chips-fries/alternative-chips-fries/sweet-potato/lamb-weston-sweet-potato-fries-2500g/p/461503'
 where id = 'NC-02751' and supplier_code = '4519' and supplier ilike '%Europ%';
