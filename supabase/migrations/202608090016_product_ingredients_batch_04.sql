-- Ingredients review batch 04 for active products.
-- Checked on 2026-08-09 against manufacturer, wholesaler, or product-data sources.

update products
   set ingredients = 'Water, BARLEY malt (pale and amber malts), hops (Challenger, First Gold, Fuggle), yeast. Contains BARLEY.',
       directions = 'Serve cool or chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.greeneking.co.uk/our-beers/greene-king/abbot-ale')
 where id = 'NC-02277';

update products
   set ingredients = 'Water, Malted BARLEY, Hops, Yeast. Contains BARLEY.',
       directions = 'Serve cool or chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.carlsbergmarstons.co.uk/products/hobgoblin/hobgoblin-ruby/')
 where id = 'NC-02278';

update products
   set ingredients = 'Water, Malted BARLEY, WHEAT, Hops, Yeast. Contains BARLEY and WHEAT.',
       directions = 'Serve cool or chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://hobgoblinbeer.co.uk/shop/hobgoblin-gold/')
 where id = 'NC-02279';

update products
   set ingredients = 'Water, Malted BARLEY, Hops, Yeast. Contains BARLEY.',
       directions = 'Serve cool or chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.carlsbergmarstons.co.uk/products/hobgoblin/hobgoblin-ipa/')
 where id = 'NC-02280';

update products
   set ingredients = 'Water, Malted BARLEY, Hops, Yeast. Contains BARLEY.',
       directions = 'Serve cool or chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.ironmaidenbeer.com/beers/')
 where id = 'NC-02281';

update products
   set ingredients = 'Water, Malted BARLEY, Glucose Syrup, Maize, Hops. Contains BARLEY.',
       directions = 'Serve chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.faxe.com/10')
 where id = 'NC-02282';

update products
   set ingredients = 'Water, Malted BARLEY, Hops. Contains BARLEY.',
       directions = 'Serve chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.faxe.com/premium')
 where id = 'NC-02283';

update products
   set ingredients = 'Water, BARLEY malt, maize, hops, yeast. Contains BARLEY.',
       directions = 'Serve chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.birraperoni.it/le-nostre-birre/materie-prime/')
 where id = 'NC-02284';

update products
   set ingredients = 'Water, Malted BARLEY, Maize, Hops. Contains BARLEY.',
       directions = 'Serve chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.instacart.com/products/186296-stella-artois-lager-14-9-fl-oz')
 where id = 'NC-02285';

update products
   set ingredients = 'Hard cider, Water, Sugar, Malic Acid, Colour and Sulphite. Contains SULPHITES.',
       directions = 'Best served chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.strongbow.com/us/en/apple-ciders/original-dry/')
 where id = 'NC-02287';

update products
   set ingredients = 'Hard apple cider, Carbonated Water, Sugar, Juice (Elderberry, Strawberry & Lime), Flavour, Acid: Citric Acid, Preservative: Potassium Sorbate, Sulphites. Contains SULPHITES.',
       directions = 'Best served chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see base of can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://kopparberg.us/our-products/kopparberg-strawberry-lime/')
 where id = 'NC-02288';

update products
   set ingredients = 'Carbonated Water, Fermented Apples, Juice (Apple, Blackcurrant, Elderberry, Raspberry), Sugar, Acid: Citric Acid, Flavouring, Preservative: Potassium Sorbate, Antioxidant: E224/Sulphites. Contains SULPHITES.',
       directions = 'Best served chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see base of can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.grapevinewineservices.co.uk/kopparberg-mixed-fruit-bottles/')
 where id = 'NC-02289';

update products
   set ingredients = 'Carbonated water, fermented apples, fruit juice including apple and wild berry juices, sugar, flavouring, acidifier: citric acid, preservative: potassium sorbate, antioxidant: sulphites. Contains SULPHITES.',
       directions = 'Best served chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see base of can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://kopparberg.com/our-products/kopparberg-wildberries/')
 where id = 'NC-02290';

update products
   set ingredients = 'Hard pear cider, Carbonated Water, Sugar, Acid: Citric Acid, Preservative: Potassium Sorbate, Sulphites. Contains SULPHITES.',
       directions = 'Best served chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see base of can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://kopparberg.us/our-products/kopparberg-pear/')
 where id = 'NC-02291';

update products
   set ingredients = 'Fermented Apple Juice, Blackcurrant Juice, Sugar, Natural Flavourings, Sulphites (Sulphur Dioxide). Contains SULPHITES.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://m.joybuy.co.uk/dp/thatchers-apple-blackcurrant-cider-10-x/10035939')
 where id = 'NC-02292';

update products
   set ingredients = 'Fermented Apple Juice, Water, Sugar, Blood Orange Juice from Concentrate (2%), Acid: Malic Acid, Colour: Anthocyanins, Antioxidant: Sodium Metabisulphite, Natural Flavouring. Contains SULPHITES.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://everydaydirect.co.uk/products/thatchers-raspberry-4x440ml')
 where id = 'NC-02293';

update products
   set ingredients = 'Cider with lemon juice from concentrate (1%) and natural flavours. Contains SULPHITES.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.waitrose.com/ecom/products/thatchers-cloudy-lemon/402792-786020-786021')
 where id = 'NC-02294';

update products
   set ingredients = 'Apple cider crafted from a blend of apples. Contains SULPHITES for freshness.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.thatcherscider.co.uk/cider/gold/')
 where id = 'NC-02295';

update products
   set ingredients = 'Apple cider crafted from Katy, Gala and Jonagold apples. Contains SULPHITES for freshness.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.asda.com/groceries/product/apple-cider/thatchers-haze-apple-cider-10-x-440ml/5755254')
 where id = 'NC-02296';

update products
   set ingredients = 'Apple cider made with sun-drenched apples. Contains SULPHITES for freshness.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 04: bron https://www.thatcherscider.co.uk/product/thatchers-juicy-apple/')
 where id = 'NC-02297';

