-- Ingredients review batch 01 for active products.
-- Checked on 2026-08-09 against manufacturer, wholesaler, or product-data sources.

update products
   set ingredients = 'Carbonated Water, Sugar, Acid (Citric Acid), Flavourings (including Caffeine, Ammonium Ferric Citrate & Quinine), Sweeteners (Aspartame, Acesulfame K), Preservative (E211), Colours (Sunset Yellow FCF, Ponceau 4R). Contains a source of Phenylalanine.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://irn-bru.co.uk/products/irn-bru')
 where id = 'NC-02209';

update products
   set ingredients = 'Carbonated Water, Acid (Citric Acid), Flavourings (including Caffeine, Ammonium Ferric Citrate & Quinine), Sweeteners (Acesulfame K, Aspartame), Preservative (E211), Colours (Sunset Yellow FCF, Ponceau 4R), Ammonium Ferric Citrate (0.002%). Contains a source of Phenylalanine.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.kitwaveretail.co.uk/product/3735/irn-bru-diet-can-330ml-24-pack')
 where id = 'NC-02210';

update products
   set ingredients = 'Carbonated Water, Sugar, Acid (Citric Acid), Flavourings (including Caffeine, Ammonium Ferric Citrate & Quinine), Sweeteners (Aspartame, Acesulfame K), Preservative (E211), Colours (Sunset Yellow FCF, Ponceau 4R). Contains a source of Phenylalanine.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://irn-bru.co.uk/products/irn-bru')
 where id = 'NC-02211';

update products
   set ingredients = 'Carbonated Water, Acid (Citric Acid), Flavourings, Sweeteners (Acesulfame K, Sucralose), Acidity Regulator (Trisodium Citrate), Preservative (Sodium Benzoate), Colour (Brilliant Blue).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://barrflavours.com/products/bubblegum')
 where id = 'NC-02212';

update products
   set ingredients = 'Carbonated Water, Flavourings, Acid (Citric Acid), Sweeteners (Acesulfame K, Sucralose, Aspartame), Preservative (Sodium Benzoate). Contains a source of Phenylalanine.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://barrflavours.com/products/american-cream-soda')
 where id = 'NC-02213';

update products
   set ingredients = 'Carbonated Water, Acid (Citric Acid), Flavourings, Colours (Anthocyanins, Plain Caramel E150a), Sweeteners (Acesulfame K, Sucralose), Preservative (Sodium Benzoate).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://barrflavours.com/products/cherryade')
 where id = 'NC-02214';

update products
   set ingredients = 'Carbonated Water, Sugar, Colour (E150d), Acid (Phosphoric Acid), Natural Flavourings, Caffeine Flavouring.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.tesco.com/shop/en-GB/products/281199121')
 where id = 'NC-02215';

update products
   set ingredients = 'Carbonated Water, Sugar, Colour (Caramel E150d), Phosphoric Acid, Natural Flavourings including Vanilla Extract, Caffeine and Sweeteners.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://yumsweetie.com/products/copy-of-coca-cola-coke-vanilla-330ml-uk')
 where id = 'NC-02216';

update products
   set ingredients = 'Water, Blackcurrant Juice from Concentrate (6%), Sugar, Acidity Regulator (Sodium Gluconate), Thickener (Polydextrose), Vitamin C, Acid (Citric Acid), Natural Blackcurrant Flavourings, Sweeteners (Acesulfame K, Sucralose).',
       directions = 'Consume on day of opening.',
       conservation = 'Store ambient. Drink on day of opening. Best before: see top of carton.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.bestwaywholesale.co.uk/product/322540-1')
 where id = 'NC-02217';

update products
   set ingredients = 'Water, Blackcurrant Juice from Concentrate (7%), Sugar, Thickener (Polydextrose), Acidity Regulator (Sodium Gluconate), Extract of Carrot and Hibiscus, Vitamin C, Natural Blackcurrant Flavourings, Acid (Citric Acid), Sweeteners (Acesulfame K, Sucralose).',
       directions = 'Best served chilled. Consume after opening according to packaging guidance.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume within the time shown on packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.amazon.co.uk/Ribena-Blackcurrant-Drink-500-Pack/dp/B0077PR2T8')
 where id = 'NC-02218';

update products
   set ingredients = 'Carbonated Water, Sugar, Mixed Fruit Juices from Concentrate 3% (Grape, Blackcurrant, Raspberry), Acid (Citric Acid), Vimto Flavouring (including Natural Extracts of Fruits, Herbs, BARLEY MALT and Spices), Colouring Food (Concentrates of Carrot, Hibiscus), Natural Flavouring, Preservatives (Potassium Sorbate, Sodium Benzoate), Antioxidant (Ascorbic Acid), Sweeteners (Sucralose, Acesulfame K). Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://us.britishessentials.com/products/vimto-fizzy-fruit-juice-6x330ml')
 where id = 'NC-02219';

update products
   set ingredients = 'Carbonated Water, Mixed Fruit Juices from Concentrate 3% (Grape, Blackcurrant, Raspberry), Acids (Citric Acid, Malic Acid), Vimto Flavouring (including Natural Extracts of Fruits, Herbs, BARLEY MALT and Spices), Colouring Food (Concentrates of Carrot, Hibiscus), Preservatives (Potassium Sorbate, Sodium Benzoate), Acidity Regulator (Sodium Citrate), Sweeteners (Sucralose, Acesulfame K), Antioxidant (Ascorbic Acid), Flavourings. Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.vimto.co.uk/vimto-range/product/vimto-original-no-added-sugar-fizzy-2/')
 where id = 'NC-02220';

update products
   set ingredients = 'Water, Fruit Juices from Concentrate 5% (Grape, Blackcurrant, Raspberry), Sugar, Acid (Citric Acid), Vimto Flavouring (including Natural Extracts of Fruits, Herbs, BARLEY MALT and Spices), Colouring Food (Concentrates of Carrot, Hibiscus), Preservatives (Potassium Sorbate, Sodium Benzoate), Natural Flavouring, Antioxidant (Ascorbic Acid), Sweeteners (Sucralose, Acesulfame K), Acidity Regulator (Sodium Citrate). Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.onestop.co.uk/wp-content/uploads/Vimto-500ml-375213.pdf')
 where id = 'NC-02221';

update products
   set ingredients = 'Water, Sugar, Mixed Fruit Juices from Concentrate 10% (Grape, Blackcurrant, Raspberry), Vimto Flavouring (including Natural Extracts of Fruits, Herbs, BARLEY MALT and Spices), Acid (Citric Acid), Colouring Food (Concentrates of Carrot, Hibiscus), Preservatives (Potassium Sorbate, Sodium Benzoate), Antioxidant (Ascorbic Acid). Contains BARLEY.',
       directions = 'Dilute to taste with water. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and use according to packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.amazon.com/Vimto-Original-Cordial-1L-Pack/dp/B011238J42')
 where id = 'NC-02222';

update products
   set ingredients = 'Water, Mixed Fruit Juices from Concentrate 10% (Grape, Blackcurrant, Raspberry), Acids (Citric Acid, Malic Acid), Vimto Flavouring (including Natural Extracts of Fruits, Herbs, BARLEY MALT and Spices), Colouring Food (Concentrates of Carrot, Hibiscus), Sweeteners (Sucralose, Acesulfame K), Preservatives (Potassium Sorbate, Sodium Benzoate), Vitamin C, Acidity Regulator (Sodium Citrate), Vitamin D. Contains BARLEY.',
       directions = 'Dilute to taste with water. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and use according to packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.vimto.co.uk/vimto-range/product/vimto-original-no-added-sugar-squash/')
 where id = 'NC-02223';

update products
   set ingredients = 'Water, Mixed Fruit Juices from Concentrate 10% (Apple, Orange, Passion Fruit, Raspberry), Acids (Citric Acid, Malic Acid), Flavourings, Sweeteners (Sucralose, Acesulfame K), Preservatives (Potassium Sorbate, Sodium Benzoate), Colouring Food (Concentrates of Sweet Potato, Apple, Radish, Cherry), Acidity Regulator (Sodium Citrate), Stabilisers (Acacia Gum, Glycerol Esters of Wood Rosins), Antioxidant (Ascorbic Acid), Vitamin D.',
       directions = 'Dilute to taste with water. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and use according to packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.asda.com/groceries/product/other-fruit-flavoured-squash/vimto-raspberry-orange-passionfruit-1-litre/5470185')
 where id = 'NC-02224';

update products
   set ingredients = 'Carbonated Water, Sugar, Mixed Fruit Juices from Concentrate 3% (Grape, Blackcurrant, Raspberry), Acid (Citric Acid), Vimto Flavouring (including Natural Extracts of Fruits, Herbs, BARLEY MALT and Spices), Colouring Food (Concentrates of Carrot, Hibiscus), Natural Flavouring, Preservatives (Potassium Sorbate, Sodium Benzoate), Antioxidant (Ascorbic Acid), Sweeteners (Sucralose, Acesulfame K). Contains BARLEY.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and use according to packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.asda.com/groceries/product/regular-flavoured-fizzy-drinks/vimto-2l/2584')
 where id = 'NC-02225';

update products
   set ingredients = 'Carbonated Water, Sugar, Colour (Caramel E150d), Acid (Phosphoric Acid), Sweeteners (Aspartame, Acesulfame K), Preservative (Potassium Sorbate), Flavourings including Caffeine.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see base of can.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.onestop.co.uk/wp-content/uploads/Dr-Pepper-330ml-384514.pdf')
 where id = 'NC-02226';

update products
   set ingredients = 'Carbonated Water, Glucose Syrup (11%), Orange Juice from Concentrate (6%), Acid (Citric Acid), Acidity Regulator (Sodium Gluconate), Sweeteners (Aspartame, Acesulfame K), Preservative (Potassium Sorbate), Stabiliser (Acacia Gum), Caffeine, Flavourings, Antioxidant (Ascorbic Acid), Niacin (Vitamin B3), Colour (Beta Carotene).',
       directions = 'Best served chilled.',
       conservation = 'Store ambient. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.onestop.co.uk/wp-content/uploads/Lucozade-Energy-Drink-Orange-500ml-350973.pdf')
 where id = 'NC-02227';

update products
   set ingredients = 'Carbonated Water, Glucose Syrup (13%), Acids (Citric Acid, Lactic Acid), Acidity Regulator (Sodium Citrate), Flavourings, Preservative (Potassium Sorbate), Sweeteners (Aspartame, Acesulfame K), Caffeine, Antioxidant (Ascorbic Acid), Colours (Sunset Yellow, Ponceau 4R), Niacin (Vitamin B3).',
       directions = 'Best served chilled.',
       conservation = 'Store ambient. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 01: bron https://www.onestop.co.uk/wp-content/uploads/Lucozade-Energy-Drink-Original-500ml-120961.pdf')
 where id = 'NC-02228';
