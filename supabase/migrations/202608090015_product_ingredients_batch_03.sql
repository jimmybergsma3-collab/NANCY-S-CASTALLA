-- Ingredients review batch 03 for active products.
-- Checked on 2026-08-09 against manufacturer, wholesaler, or product-data sources.

update products
   set ingredients = 'Black tea-based drink (Water, Sugar, Concentrated Juice: Lemon 1.9%, Pineapple 1%, Passion Fruit 0.5%, Concentrated Natural Safflower Extract, Camellia Sinensis Black Tea 0.03%), Mango Juice Pearls 10% (Water, Sugar, Calcium Lactate, Sodium Alginate, Mango Juice from Concentrate 1%, Acidity Regulators: Lactic Acid, Citric Acid, Thickeners: Guar Gum, Xanthan Gum, Preservatives: Potassium Sorbate, Sodium Benzoate), Flavourings, Colours: Red Iron Oxide, Curcumin.',
       directions = 'Ready to drink with included straw. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume promptly.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.coffeefriend.eu/p/bubble-tea-bob-tropical-mix-360-ml/')
 where id = 'NC-02256';

update products
   set ingredients = 'Black tea-based drink (Water, Sugar, Natural Flavourings, Camellia Sinensis Black Tea 0.01%, Concentrated Natural Potato and Carrot Extract, Acidity Regulator: Citric Acid), Vanilla-flavoured Pearls (Water, Sugar, Calcium Lactate, Sodium Alginate, Acidity Regulators: Lactic Acid, Citric Acid, Thickeners: Guar Gum, Xanthan Gum, Preservatives: Potassium Sorbate, Sodium Benzoate), Natural Flavourings, Colour: Curcumin.',
       directions = 'Ready to drink with included straw. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume promptly.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.coffeefriend.eu/p/bubble-tea-bob-marshmallow-360-ml/')
 where id = 'NC-02257';

update products
   set ingredients = 'Water, Aloe Vera Pulp & Juice (20%), Grape Juice (10%), Fructose, Sugar, Citric Acid, Grape Flavouring, Gellan Gum, Sodium Citrate, Calcium Lactate, Vitamin C, Sucralose, Steviol Glycosides, Potassium Sorbate.',
       directions = 'Shake well. Best served chilled.',
       conservation = 'Refrigerate after opening and consume within 3 days.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.simplyheavenlyfoods.co.uk/just-drink-premium-natural-aloe-drink-12-x-500ml')
 where id = 'NC-02258';

update products
   set ingredients = 'Purified Water, Aloe Vera Pulps (Aloe Juice 30%), Mango Juice (10%), Fructose Syrup, Citric Acid, Calcium Lactate, Sodium Citrate, Vitamin C, Sucralose, Gellan Gum, Beta-Carotene, Mango Flavour.',
       directions = 'Shake well. Best served chilled.',
       conservation = 'Refrigerate after opening and consume within 3 days.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.worldfoodshop.com/products/just-drink-mango-premium-aloe-vera-500ml')
 where id = 'NC-02260';

update products
   set ingredients = 'Water, Aloe Vera Pulp & Juice (20%), Lychee Juice (10%), Fructose, Sugar, Citric Acid, Lychee Flavouring, Gellan Gum, Sodium Citrate, Calcium Lactate, Vitamin C, Sucralose, Steviol Glycosides, Potassium Sorbate.',
       directions = 'Shake well. Best served chilled.',
       conservation = 'Refrigerate after opening and consume within 3 days.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://freshcart.ae/products/6-x-just-drink-aloe-lychee-500ml-delicious-tasty-and-twisty-treat-gift-hamper-for-all-occasions-enjoyed-with-family-and-friends-403770078')
 where id = 'NC-02261';

update products
   set ingredients = 'Carbonated Water, Sugar, Flavourings, Acid (Citric Acid), Concentrates (Black Carrot, Blackcurrant), Sweeteners (Acesulfame K, Sucralose).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.tesco.com/shop/en-GB/products/275351480')
 where id = 'NC-02262';

update products
   set ingredients = 'Carbonated Water, Sugar, Acid (Citric Acid), Flavourings, Concentrates (Black Carrot, Blackcurrant), Acidity Regulator (Trisodium Citrate), Sweeteners (Acesulfame K, Sucralose), Preservative (Sodium Benzoate), Stabiliser (Gum Arabic, Glycerol Esters of Wood Rosins), Colour (Anthocyanins).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://spoonfulapp.com/products/ka-sparkling-fruit-punch-330ml-can/NTAwMDM4MjAzNDkxOQ%3D%3D')
 where id = 'NC-02263';

update products
   set ingredients = 'Carbonated Water, Sugar, Acid (Citric Acid), Flavourings, Stabilisers (Gum Arabic, Sucrose Acetate Isobutyrate), Safflower Extract, Sweeteners (Acesulfame K, Sucralose), Preservative (Sodium Benzoate).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.asda.com/groceries/product/regular-flavoured-fizzy-drinks/ka-pineapple-flavoured-fizzy-drink-330ml-can/4088423')
 where id = 'NC-02264';

update products
   set ingredients = 'Water, Malted BARLEY, BARLEY, Roasted BARLEY, Fructose, Natural Flavourings, Hops, Yeast. Contains BARLEY.',
       directions = 'Serve chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.guinness.com/en/beers/guinness-zero')
 where id = 'NC-02265';

update products
   set ingredients = 'Water, BARLEY, Hops, Yeast. Contains BARLEY.',
       directions = 'Serve chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.guinness-storehouse.com/en/guinness-ingredients-experience')
 where id = 'NC-02266';

update products
   set ingredients = 'Water, BARLEY Malt, BARLEY, WHEAT, Glucose Syrup, Hops. Contains BARLEY and WHEAT.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool place. Best before: see base of can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.gopuff.com/gb/p/carling-original-lager-18-x-440ml/p106933')
 where id = 'NC-02267';

update products
   set ingredients = 'Water, Malted BARLEY, Glucose Syrup, BARLEY, Hops, Hop Extract, Nitrogen. Contains BARLEY.',
       directions = 'Serve cool.',
       conservation = 'Store ambient. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.onestop.co.uk/wp-content/uploads/J11160-One-Stop-Deliveroo-Product-Info-John-Smiths-Extra-Smooth-440ml-4-pack.pdf')
 where id = 'NC-02268';

update products
   set ingredients = 'Water, Pale BARLEY Malt, Crystal BARLEY Malt, Hops (Pilgrim, First Gold, Goldings), Yeast. Contains BARLEY.',
       directions = 'Serve cool.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.greeneking.co.uk/our-beers/old-speckled-hen/old-speckled-hen')
 where id = 'NC-02269';

update products
   set ingredients = 'Water, Malted BARLEY, Glucose Syrup, Sugar, Hop Extract, Acidity Regulator: Citric Acid, Natural Flavouring (contains Agave Spirit 0.1%). Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.desperados.com/global/en/products/original/')
 where id = 'NC-02270';

update products
   set ingredients = 'Water, Malted BARLEY, Glucose Syrup, Sugar, Hop Extract, Acidity Regulator: Citric Acid, Natural Flavouring (contains Agave Spirit 0.1%). Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.desperados.com/global/en/products/original/')
 where id = 'NC-02271';

update products
   set ingredients = 'Water, BARLEY Malt, Rice, Hops, Yeast. Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://us.budweiser.com/budweiser')
 where id = 'NC-02272';

update products
   set ingredients = 'Water, BARLEY Malt, Hop Extract, Lager Yeast, Corn Syrup. Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.coorslight.com/en-US/our-beer')
 where id = 'NC-02273';

update products
   set ingredients = 'Water, BARLEY Malt, Hop Extract, Lager Yeast, Corn Syrup. Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.coorslight.com/en-US/our-beer')
 where id = 'NC-02274';

update products
   set ingredients = 'Water, BARLEY Malt, Non-Malted Cereals, Hops. Contains BARLEY.',
       directions = 'Serve chilled, traditionally with lime.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.coronausa.com/pages/corona-extra')
 where id = 'NC-02275';

update products
   set ingredients = 'Water, Pale BARLEY Malt, Crystal BARLEY Malt, Black BARLEY Malt, English Hops (Pilgrim, Challenger, First Gold), Yeast. Contains BARLEY.',
       directions = 'Serve cool.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 03: bron https://www.greeneking.co.uk/our-beers/greene-king/greene-king-ipa')
 where id = 'NC-02276';

