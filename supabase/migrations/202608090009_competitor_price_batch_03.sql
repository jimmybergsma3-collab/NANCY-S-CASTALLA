-- Competitor price review batch 03 for active Europ Foods no-price products.
-- Checked on 2026-08-09. GBP converted with ECB 2026-08-07 reference:
-- EUR 1 = GBP 0.85765, so GBP 1 is approximately EUR 1.167.

update products
   set price = 9.95,
       sale_price_incl_vat = 9.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 34.81,
       profit_per_unit = 3.15,
       additional_info = 'Concurrentieprijs review 2026-08-09 batch 03: Brakes Individual Potato Gratin Dauphinoise 10 x 120g; GBP 9.57 = ca. EUR 11.17, scaled to 10 x 100g ca. EUR 9.31; Nancy prijs EUR 9.95 incl IVA; https://www.brake.co.uk/frozen-produce-accompaniments/frozen-potatoes/speciality-potatoes/speciality-potatoes/brakes-individual-potato-gratin-dauphinoise/p/33174'
 where id = 'NC-02754' and supplier_code = '4563' and supplier ilike '%Europ%';
