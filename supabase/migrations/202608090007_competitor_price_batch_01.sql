-- Competitor price review batch 01 for active Europ Foods no-price products.
-- Checked on 2026-08-09. GBP converted with ECB 2026-08-07 reference:
-- EUR 1 = GBP 0.85765, so GBP 1 is approximately EUR 1.167.

update products
   set price = 17.95,
       sale_price_incl_vat = 17.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 24.33,
       profit_per_unit = 3.97,
       additional_info = 'Concurrentieprijs review 2026-08-09: Amazon UK Santa Maria Chipotle Paste 750g; GBP 14.97 = ca. EUR 17.47; Nancy prijs EUR 17.95 incl IVA; https://www.amazon.co.uk/Santa-Maria-Chipotle-paste-750g/dp/B006B7J9IU'
 where id = 'NC-02580' and supplier_code = '3374' and supplier ilike '%Europ%';

update products
   set price = 14.50,
       sale_price_incl_vat = 14.50,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 51.06,
       profit_per_unit = 6.73,
       additional_info = 'Concurrentieprijs review 2026-08-09: Healthy Food Factory Tandoori Paste 300g; EUR 4.39 per 300g = EUR 14.63/kg; Nancy prijs EUR 14.50 incl IVA; https://www.healthyfoodfactory.eu/tandoori-paste-300g-ashoka-product-58284/'
 where id = 'NC-02602' and supplier_code = '7047' and supplier ilike '%Europ%';

update products
   set price = 11.95,
       sale_price_incl_vat = 11.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 36.46,
       profit_per_unit = 3.96,
       additional_info = 'Concurrentieprijs review 2026-08-09: Trolley UK Patak''s Tikka Masala Curry Spice Paste 283g; GBP 2.86 per 283g = ca. EUR 11.79/kg; Nancy prijs EUR 11.95 incl IVA; https://www.trolley.co.uk/product/pataks-tikka-masala-spice-paste/FDP791'
 where id = 'NC-02603' and supplier_code = '7048' and supplier ilike '%Europ%';

update products
   set price = 11.95,
       sale_price_incl_vat = 11.95,
       vat_rate = 10,
       sales_unit_confirmed = true,
       price_basis_confirmed = true,
       needs_package_review = false,
       ready_for_publish = true,
       margin_percent = 40.61,
       profit_per_unit = 4.41,
       additional_info = 'Concurrentieprijs review 2026-08-09: Trolley UK Patak''s Madras Curry Spice Paste 283g; GBP 2.88 per 283g = ca. EUR 11.88/kg; Nancy prijs EUR 11.95 incl IVA; https://www.trolley.co.uk/product/pataks-madras-spice-paste/ECU634'
 where id = 'NC-02604' and supplier_code = '7050' and supplier ilike '%Europ%';
