-- Ingredients review batch 05 for active products.
-- Checked on 2026-08-09 against manufacturer, wholesaler, or product-data sources.

update products
   set ingredients = 'Ready-to-drink spritz cocktail prepared with sparkling wine, bitter aperitif and soft drink/soda, with orange and grapefruit notes. Contains SULPHITES.',
       directions = 'Serve well chilled, preferably over ice with an orange slice.',
       conservation = 'Store in a cool, dry place away from direct sunlight. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.licorea.com/spritz-roll-en-p-4871.html')
 where id = 'NC-02328';

update products
   set ingredients = 'Agave wine cocktail made with 100% agave wine, volcanic water, real fruit juice and natural ingredients; lime margarita flavour.',
       directions = 'Chill and enjoy. Serve cold or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.prnewswire.com/news-releases/agave-boom-margaritas-get-ready-to-sip-serve-boomrepeat-302430802.html')
 where id = 'NC-02349';

update products
   set ingredients = 'Agave wine cocktail made with 100% agave wine, volcanic water, real fruit juice and natural ingredients; mango chamoy margarita flavour.',
       directions = 'Chill and enjoy. Serve cold or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://shopwinedirect.com/agave-boom-mango-chamoy-margarita-wine-cocktail-200ml.html')
 where id = 'NC-02350';

update products
   set ingredients = 'Agave wine cocktail made with 100% agave wine, volcanic water, real fruit juice and natural ingredients; passion fruit margarita flavour.',
       directions = 'Chill and enjoy. Serve cold or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.prnewswire.com/news-releases/agave-boom-margaritas-get-ready-to-sip-serve-boomrepeat-302430802.html')
 where id = 'NC-02351';

update products
   set ingredients = 'Agave wine cocktail made with 100% agave wine, volcanic water, real fruit juice and natural ingredients; strawberry margarita flavour.',
       directions = 'Chill and enjoy. Serve cold or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://shopwinedirect.com/agave-boom-strawberry-margarita-wine-cocktail-200ml.html')
 where id = 'NC-02352';

update products
   set ingredients = 'Sparkling alcoholic premix blending mixed fruit flavours with triple distilled vodka. Contains caffeine. Gluten free and suitable for vegans.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.tesco.ie/shop/en-IE/products/252638240')
 where id = 'NC-02353';

update products
   set ingredients = 'Rum and lime flavoured ready-to-drink alcoholic beverage with carbonated water, sugar/sweetener, acidity regulator and flavourings.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.e-fresh.gr/en/bacardi-breezer-lime-275-ml')
 where id = 'NC-02354';

update products
   set ingredients = 'Rum-based ready-to-drink alcoholic beverage with passion fruit and mango flavour, carbonated water, sugar/sweetener, acidity regulator and flavourings.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.bacardi.com/')
 where id = 'NC-02355';

update products
   set ingredients = 'Rum-based ready-to-drink alcoholic beverage with watermelon flavour, carbonated water, sugar/sweetener, acidity regulator and flavourings.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.bacardi.com/')
 where id = 'NC-02356';

update products
   set ingredients = 'Rum-based ready-to-drink alcoholic beverage with orange flavour, carbonated water, sugar/sweetener, acidity regulator and flavourings.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.bacardi.com/')
 where id = 'NC-02357';

update products
   set ingredients = 'Ready-to-drink cocktail made with BACARDI rum, lemon and lemonade flavours, carbonated water, sugar/sweetener, acidity regulator and flavourings.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.bacardi.com/')
 where id = 'NC-02358';

update products
   set ingredients = 'Ready-to-drink cocktail made with BACARDI Carta Blanca rum, lime, sugar and mint flavours.',
       directions = 'Best enjoyed chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.tesco.com/shop/en-GB/products/309170630')
 where id = 'NC-02359';

update products
   set ingredients = 'Carbonated water, sugars (glucose-fructose), vodka, citric acid, sodium citrate, natural and artificial flavours, acacia gum, potassium sorbate, coconut oil and/or palm kernel oil (medium-chain triglycerides), potassium metabisulphite. Contains SULPHITES.',
       directions = 'Serve chilled.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://spoonfulapp.com/products/smirnoff-ice/MDA4MjAwMDc2MzYwNA%3D%3D')
 where id = 'NC-02360';

update products
   set ingredients = 'Apple-cranberry wine (51%), water, sugar, carbon dioxide, acidity regulator: citric acid, cranberry, orange and lime flavourings, stabilisers: E414, E445, colour: E129, preservatives: potassium sorbate, potassium metabisulphite. Contains SULPHITES.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.marussiabeverages.de/shop/alkoholisches-getraenk/ready-to-drink/le-coq-cosmopolitan-12-er-box/')
 where id = 'NC-02362';

update products
   set ingredients = 'Water, fermented apple juice, sugar, carbon dioxide, acidity regulator: citric acid, flavourings, stabilisers: E445, E414, E415, preservatives: potassium sorbate, potassium metabisulphite. Contains SULPHITES.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://foodscan.ai/en/product/Cocktail-A.LE.COQ-Pina-Colada-47percent-033-l-bottle/4740098078197')
 where id = 'NC-02363';

update products
   set ingredients = 'Fermented fruit-wine based ready-to-drink cocktail with tequila, orange juice and grenadine syrup flavours. Contains SULPHITES.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://pintplease.com/en/beer/104892/t_quila_sunrise')
 where id = 'NC-02364';

update products
   set ingredients = 'Fermented fruit wine based ready-to-drink cocktail with orange, peach, cranberry and rum flavours. Contains SULPHITES.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://britishfood.es/en/alcohol/2278-le-coq-sex-on-the-beach-330ml-4740098090663.html')
 where id = 'NC-02365';

update products
   set ingredients = 'Apple-watermelon wine (51%), water, sugar, apple juice concentrate, carbon dioxide, acidity regulator: citric acid, carrot and safflower concentrates, watermelon, lime and rum flavours, stabilisers: E414, E445, preservatives: potassium sorbate, potassium metabisulphite. Contains SULPHITES.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.alecoq.ee/en/product/margarita/')
 where id = 'NC-02366';

update products
   set ingredients = 'Fruit wine (51%), water, sugar, carbon dioxide, acidity regulator: citric acid, coconut, pineapple and curacao flavours, stabilisers: E414, E445, colour: brilliant blue FCF, preservatives: potassium sorbate, potassium metabisulphite. Contains SULPHITES.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://shop.supervalu.ie/product/le-coq-blue-lagoon-4pack-330-ml-id-1742877000')
 where id = 'NC-02367';

update products
   set ingredients = 'Apple-lime wine (51%), water, sugar, carbon dioxide, acidity regulator: citric acid, lemon juice concentrate, lemon, mint and rum flavours, stabiliser: gum arabic, colours: quinoline yellow, patent blue V, preservatives: potassium sorbate, potassium metabisulphite. Contains SULPHITES.',
       directions = 'Serve chilled or over ice.',
       conservation = 'Store in a cool, dry place. Best before: see bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 05: bron https://www.alecoq.ee/en/product/mojito/')
 where id = 'NC-02368';

