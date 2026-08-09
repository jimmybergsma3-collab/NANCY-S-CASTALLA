-- Ingredients review batch 02 for active products.
-- Checked on 2026-08-09 against manufacturer, wholesaler, or product-data sources.

update products
   set ingredients = 'Carbonated Water, Fruit Juices from Concentrate 2% (Lemon, Cranberry, Raspberry), Acid (Citric Acid), Acidity Regulator (Sodium Gluconate), Lemon Extract, Sweeteners (Aspartame, Acesulfame K), Flavourings, Preservative (Potassium Sorbate), Extracts of Sweet Potato, Apple, Radish and Cherry, Caffeine, Stabiliser (Locust Bean Gum), Niacin (Vitamin B3). Contains a source of Phenylalanine.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.thefood.app/uk/products/62677/lucozade-energy-zero-pink-lemonade-500ml')
 where id = 'NC-02229';

update products
   set ingredients = 'Water, Glucose Syrup, Acid (Citric Acid), Acidity Regulator (Sodium Citrate), Stabiliser (Acacia Gum), Preservative (Potassium Sorbate), Antioxidant (Ascorbic Acid), Sweeteners (Aspartame, Acesulfame K), Flavouring, Vitamins (Niacin, Pantothenic Acid, B6, B12), Colour (Beta Carotene).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.onestop.co.uk/wp-content/uploads/Lucozade-Sport-Orange-500ml-e-516740.pdf')
 where id = 'NC-02233';

update products
   set ingredients = 'Water, Glucose Syrup, Acid (Citric Acid), Acidity Regulator (Sodium Citrate), Extract of Black Carrot, Preservatives (Potassium Sorbate, Sodium Benzoate), Stabilisers (Acacia Gum, Glycerol Esters of Wood Rosins), Antioxidant (Ascorbic Acid), Sweeteners (Aspartame, Acesulfame K), Flavourings, Vitamins (Niacin, Pantothenic Acid, B6, B12).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.onestop.co.uk/wp-content/uploads/Lucozade-Sport-Drink-Raspberry-500ml-365653.pdf')
 where id = 'NC-02234';

update products
   set ingredients = 'Water, Sugar, Juice from Concentrate 3% (Orange 2.6%, Passion Fruit 0.2%, Peach 0.2%), Carbon Dioxide, Citrus Extract, Acidity Regulator (E330), Fruit and Vegetable Extracts (Sunflower, Carrot, Aronia, Elderberry, Lemon, Safflower), Natural Flavours, Stabilisers (E445, E414).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://fivestartrading-holland.eu/beverages/soft-drinks/fanta-exotic-24-x-033-liter-cans-dk-2/?lang=en')
 where id = 'NC-02235';

update products
   set ingredients = 'Carbonated Water, Sugar, Fruit Juices from Concentrate 4.4% (Orange 3.4%, Peach 0.5%, Apple 0.4%, Passion Fruit 0.1%), Vegetable and Plant Concentrates (Carrot, Safflower), Acids (Citric Acid, Malic Acid), Sweeteners (Acesulfame K, Aspartame), Preservative (Potassium Sorbate), Natural Flavouring, Stabilisers (Glycerol Esters of Wood Rosins, Guar Gum). Contains a source of Phenylalanine.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.coca-cola.com/gb/en/brands/fanta')
 where id = 'NC-02236';

update products
   set ingredients = 'Water, Sugar, Lemon Juice from Concentrate (3%), Carbon Dioxide, Natural Kiwi Flavour with Other Natural Flavours, Vegetable Concentrate (Carrot, Safflower), Acidity Regulator (E330), Stabilisers (E414, E445).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://fivestartrading-holland.eu/beverages/soft-drinks/fanta-strawberry-kiwi-24-x-033-liter-cans-dk-2/?lang=en')
 where id = 'NC-02237';

update products
   set ingredients = 'Carbonated Water, High Fructose Corn Syrup, Natural Flavours, Citric Acid, Sodium Citrate, Malic Acid, Potassium Sorbate and Sodium Benzoate (to protect taste), Blue 1 (E133).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://fivestartrading-holland.eu/beverages/usa-drinks/fanta-usa-berry-12-x-0355-liter-cans/?lang=en')
 where id = 'NC-02238';

update products
   set ingredients = 'Carbonated Water, High Fructose Corn Syrup, Natural Flavours, Tartaric Acid, Potassium Sorbate and Sodium Benzoate (to protect taste), Citric Acid, Red 40, Blue 1.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.upcitemdb.com/upc/49000014242')
 where id = 'NC-02239';

update products
   set ingredients = 'Carbonated Water, High Fructose Corn Syrup, Natural Flavours, Citric Acid, Sodium Benzoate (to protect taste), Yellow 6, Red 40.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.billigkaffee.eu/eng/Fanta-USA-Peach-12-x-0-355-Liter-Cans/049000033939')
 where id = 'NC-02240';

update products
   set ingredients = 'Carbonated Water, High Fructose Corn Syrup, Citric Acid, Natural Flavours, Modified Food Starch, Potassium Sorbate and Sodium Benzoate (to protect taste), Sodium Citrate, Medium Chain Triglycerides, Salt, Sucrose Acetate Isobutyrate, Yellow 5 (E102), Yellow 6 (E110).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://fivestartrading-holland.eu/beverages/usa-drinks/fanta-usa-pineapple-12-x-0355-liter-cans/?lang=en')
 where id = 'NC-02241';

update products
   set ingredients = 'Carbonated Water, High Fructose Corn Syrup, Natural Flavours, Citric Acid, Sodium Benzoate (to protect taste), Red 40.',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://tools.myfooddata.com/nutrition-facts/769054/wt1')
 where id = 'NC-02242';

update products
   set ingredients = 'Carbonated Water, Sugar, Glucose-Fructose Syrup, Acid (Citric Acid), Taurine (0.4%), Flavourings, Caffeine (0.03%), Sweeteners (Aspartame, Acesulfame K), Colours (Sulphite Ammonia Caramel, Riboflavin), Acidity Regulator (Sodium Citrate), Inositol, Preservative (Sodium Benzoate), Vitamins (Niacin, Pantothenic Acid, Vitamin B6, Vitamin B12).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://shop.coop.co.uk/product/boost-energy-original-250ml--5056079900272')
 where id = 'NC-02243';

update products
   set ingredients = 'Carbonated Water, Sugar, Glucose-Fructose Syrup, Acid (Citric Acid), Taurine (0.4%), Flavourings, Caffeine (0.03%), Sweeteners (Aspartame, Acesulfame K), Colours (Sulphite Ammonia Caramel, Riboflavin), Acidity Regulator (Sodium Citrate), Inositol, Preservative (Sodium Benzoate), Vitamins (Niacin, Pantothenic Acid, Vitamin B6, Vitamin B12).',
       directions = 'Best served chilled.',
       conservation = 'Store in a cool, dry place. Best before: see packaging.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.onestop.co.uk/product/boost-energy-original-1-litre/')
 where id = 'NC-02244';

update products
   set ingredients = 'Carbonated Water, Acid (Citric Acid), Flavouring, Preservatives (Sodium Benzoate), Sweeteners (Aspartame, Sodium Cyclamate, Sodium Saccharin), Acidity Regulator (Sodium Citrate). Aspartame contains a source of Phenylalanine.',
       directions = 'Ready to drink. Open with care, holding away from face and covering cap.',
       conservation = 'Store in a cool, dry place away from direct sunlight. Once opened keep refrigerated and consume within 3 days.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.yareshipping.co.uk/en/product/data-pdf/zodiac-diet-lemonade-bottle-large-31099/')
 where id = 'NC-02246';

update products
   set ingredients = 'Carbonated Water, Sugar, Acid (Citric Acid), Flavouring, Sweeteners (Aspartame, Acesulfame K, Sodium Saccharin), Preservative (Sodium Benzoate). Contains a source of Phenylalanine.',
       directions = 'Ready to drink. Open with care.',
       conservation = 'Store in a cool, dry place away from direct sunlight. Once opened keep refrigerated and consume within 3 days.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.totalfoodservice.co.uk/product/67229/zodiac-lemonade-bottles-2ltr-6-pack')
 where id = 'NC-02247';

update products
   set ingredients = 'Carbonated Water, Acid (Citric Acid), Flavourings (including Quinine Hydrochloride), Acidity Regulator (Sodium Citrates), Preservative (Potassium Sorbate), Sweeteners (Acesulfame K, Sucralose).',
       directions = 'Best served chilled.',
       conservation = 'Keep cool and out of direct sunlight. Once opened refrigerate and use within 3 days. Best before end: see neck of bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.onestop.co.uk/product/carters-low-calorie-royal-indian-tonic-water-1-litre/')
 where id = 'NC-02248';

update products
   set ingredients = 'Carbonated Water, Sugar, Acid (Citric Acid), Flavourings (including Quinine Hydrochloride), Acidity Regulator (Sodium Citrates), Preservative (Potassium Sorbate).',
       directions = 'Best served chilled.',
       conservation = 'Keep cool and out of direct sunlight. Once opened refrigerate and use within 3 days. Best before end: see neck of bottle.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.wegetanystock.com/products/carters-royal-indian-tonic-water-1-litre')
 where id = 'NC-02250';

update products
   set ingredients = 'Green tea-based drink (Water, Sugar, Lemon Juice from Concentrate, Apple Juice from Concentrate, Natural Concentrated Safflower Extract, Green Tea Camellia Sinensis), Lime Juice Pearls (Water, Sugar, Calcium Lactate, Sodium Alginate, Lime Juice from Concentrate, Acidity Regulators: Lactic Acid, Citric Acid, Thickeners: Guar Gum, Xanthan Gum, Preservatives: Potassium Sorbate, Sodium Benzoate), Flavourings, Natural Flavourings, Colours: Curcumin, Chlorophyll, Brilliant Blue.',
       directions = 'Ready to drink with included straw. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume promptly.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.lolipop.ch/products/bob-bubble-tea-blue-lime-360ml')
 where id = 'NC-02253';

update products
   set ingredients = 'Black tea-based drink (Water, Sugar, Juices from Concentrate: Strawberry 1.2%, Lemon 0.8%, Raspberry 0.5%, Natural Concentrated Carrot Extract, Black Tea Camellia Sinensis 0.03%), Blueberry Juice Pearls 10% (Water, Sugar, Calcium Lactate, Sodium Alginate, Blueberry Juice from Concentrate 1%, Acidity Regulators: Lactic Acid, Citric Acid, Thickeners: Guar Gum, Xanthan Gum, Preservatives: Potassium Sorbate, Sodium Benzoate), Flavourings, Colour: Vegetable Carbon.',
       directions = 'Ready to drink with included straw. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume promptly.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://americanuncleshop.fr/products/bob-bubble-tea-fruit-berry-360ml')
 where id = 'NC-02254';

update products
   set ingredients = 'Green tea-based drink (Water, Sugar, Lemon Juice from Concentrate 1%, Peach Juice from Concentrate 0.6%, Lychee Juice from Concentrate 0.5%, Concentrated Natural Potato and Carrot Extract, Camellia Sinensis Green Tea 0.02%), Grape Juice Pearls 10% (Water, Sugar, Calcium Lactate, Sodium Alginate, Concentrated Grape Juice 0.5%, Acidity Regulators: Lactic Acid, Citric Acid, Thickeners: Guar Gum, Xanthan Gum, Preservatives: Potassium Sorbate, Sodium Benzoate), Flavourings, Natural Flavourings, Colours: Red Iron Oxide, Vegetable Charcoal.',
       directions = 'Ready to drink with included straw. Best served chilled.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume promptly.',
       additional_info = concat_ws(E'\n', nullif(additional_info, ''), 'Ingredienten review 2026-08-09 batch 02: bron https://www.coffeefriend.eu/p/bubble-tea-bob-sakura-peach-360-ml/')
 where id = 'NC-02255';

