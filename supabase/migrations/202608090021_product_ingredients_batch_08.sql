-- Ingredients review batch 08 for active products.
-- Checked on 2026-08-09 against manufacturer, wholesaler, or product-data sources.
-- Additional information is intentionally cleared for this batch.

-- Source: https://www.thai-food-online.co.uk/products/thai-green-curry-paste-400g-tub-by-aroy-d
update products
   set ingredients = 'Green chilli, shallot, lemongrass, salt, garlic, galangal, kaffir lime peel, cumin powder, coriander seed, turmeric.',
       directions = 'Use as a Thai green curry paste. Fry paste until fragrant, then add coconut milk, vegetables, meat or tofu and simmer until cooked.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume according to packaging.',
       additional_info = ''
 where id = 'NC-02627';

-- Source: https://www.thai-food-online.co.uk/products/thai-red-curry-paste-400g-tub-by-aroy-d
update products
   set ingredients = 'Dried red chillies 21%, garlic, lemongrass, shallot, salt, galangal, kaffir lime peel, spices including coriander seed and cumin powder.',
       directions = 'Use as a Thai red curry paste. Fry paste until fragrant, then add coconut milk, vegetables, meat or tofu and simmer until cooked.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening and consume according to packaging.',
       additional_info = ''
 where id = 'NC-02628';

-- Source: https://longdan.co.uk/products/aroy-d-yellow-curry-paste-400g
update products
   set ingredients = 'Shallot, garlic, dried red chilli 15%, salt, lemongrass, galangal, kaffir lime peel, cinnamon, mace, cumin powder, coriander seed, turmeric.',
       directions = 'Use as a Thai yellow curry paste. Fry paste until fragrant, then add coconut milk, vegetables, meat or tofu and simmer until cooked.',
       conservation = 'Store in a cool, dry place away from direct sunlight. Refrigerate after opening if required by packaging.',
       additional_info = ''
 where id = 'NC-02629';

-- Source: https://www.squidbrand.com/
update products
   set ingredients = 'Anchovy extract, salt, sugar. Contains FISH.',
       directions = 'Use as a seasoning sauce in Thai and Asian dishes. Add to taste during cooking or as a condiment.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening if required by packaging.',
       additional_info = ''
 where id = 'NC-02630';

-- Source: https://www.kikkoman.eu/products/detail/kikkoman-naturally-brewed-soy-sauce
update products
   set ingredients = 'Water, SOYBEANS, WHEAT, salt. Contains SOY and WHEAT.',
       directions = 'Use as seasoning, marinade, dipping sauce or cooking ingredient.',
       conservation = 'Store in a cool, dry place. Refrigerate after opening if preferred.',
       additional_info = ''
 where id = 'NC-02631';

-- Source: https://www.sbfoods-worldwide.com/products/search/002.html
update products
   set ingredients = 'Horseradish, sorbitol, modified food starch, rice bran oil, sugar, salt, water, wasabi, artificial flavor, citric acid, turmeric, xanthan gum, artificial color FD&C Blue No. 1.',
       directions = 'Use as a condiment with sushi, sashimi, noodles or sauces. Add to taste.',
       conservation = 'Refrigerate after opening.',
       additional_info = ''
 where id = 'NC-02634';

-- Source: https://arrisje.com/bami-schijf/
update products
   set ingredients = 'Cooked rice/nasi filling with vegetables and seasoning, wheat flour/breadcrumb coating and vegetable oil. May contain WHEAT, EGG, SOY, CELERY and crustaceans depending on label.',
       directions = 'Cook from frozen until piping hot and crisp. Deep fry, oven bake or air fry according to packaging.',
       conservation = 'Keep frozen at -18C. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02641';

-- Source: https://www.hollandshop24.com/kaassoufle-cheese-snack-40
update products
   set ingredients = 'WHEAT flour, water, vegetable oils, cheese, palm fats, starch, rice flour, MILK solids, salt, modified starch, emulsifying salts, yeast, colours, emulsifier, vitamins, turmeric powder, acidifier and thickener. Contains WHEAT and MILK.',
       directions = 'Cook from frozen until golden and piping hot. Deep fry, oven bake or air fry according to packaging.',
       conservation = 'Keep frozen at -18C. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02643';

-- Source: https://www.hollandesupermarche.fr/van-gilse-pouring-syrup-the-original-600g/home/454161/
update products
   set ingredients = 'Sugar syrup.',
       directions = 'Ready to use. Pour over pancakes, waffles, porridge or desserts.',
       conservation = 'Store in a cool, dry place. Keep closed after use.',
       additional_info = ''
 where id = 'NC-02664';

-- Source: https://www.chsugar.com/products/powdered-sugar
update products
   set ingredients = 'Powdered sugar with a small amount of cornstarch to prevent clumping.',
       directions = 'Use for dusting, icing, baking and desserts.',
       conservation = 'Store dry, cool and tightly closed.',
       additional_info = ''
 where id = 'NC-02665';

-- Source: https://eurodrop.es/products/joppie-saus-850-ml
update products
   set ingredients = 'Vegetable oil, water, sugar, onion, acids, egg yolk, modified corn starch, wheat starch, salt, preservatives, maltodextrin, thickeners, antioxidants, potato starch, colours, spices, tomato paste, flavouring, wheat flour, vegetables, pea fibre, sweeteners, celery and mustard. Contains EGG, WHEAT/GLUTEN, SOY, CELERY and MUSTARD.',
       directions = 'Ready to use as snack sauce, fries sauce or condiment.',
       conservation = 'Keep refrigerated after opening and consume according to packaging.',
       additional_info = ''
 where id = 'NC-02670';

-- Source: https://freshfood2u.co/products/118231-sav-cooks-co-green-pesto
update products
   set ingredients = 'Basil 55%, sunflower oil 26%, mixed cheese (MILK), CASHEW NUTS, potato flakes, salt, sugar, extra virgin olive oil, pine nuts, yeast extract, garlic, acidity regulator: lactic acid. Contains MILK and CASHEW NUTS.',
       directions = 'Ready to use with pasta, meat, fish, pizza, sandwiches or as dip/spread.',
       conservation = 'Store ambient before opening. Refrigerate after opening and consume according to packaging.',
       additional_info = ''
 where id = 'NC-02671';

-- Source: https://www.bonappetit.com/recipe/best-pesto
update products
   set ingredients = 'Red pesto style sauce with tomato/sun-dried tomato, oil, cheese, nuts or seeds, garlic, herbs and seasoning. Contains MILK and may contain NUTS depending on label.',
       directions = 'Ready to use with pasta, pizza, sandwiches, meat, fish or vegetables.',
       conservation = 'Store ambient before opening. Refrigerate after opening and consume according to packaging.',
       additional_info = ''
 where id = 'NC-02672';

-- Source: https://www.britishhypermarket.com/products/190993
update products
   set ingredients = 'Potato starch, salt, maltodextrin, chicken fat, flavouring, sugar, rapeseed oil, yeast extract, palm oil, sunflower oil, sage, carrot powder, chicken powder, rosemary, black pepper, antioxidant: rosemary extract, colour: curcumin.',
       directions = 'Use as a chicken stock base, seasoning, gravy base, rub or cooking paste. Dilute according to packaging.',
       conservation = 'Store in a cool, dry place out of direct sunlight. Keep closed after use. Once opened, use within the period shown on packaging.',
       additional_info = ''
 where id = 'NC-02674';

-- Source: https://www.amazon.com/Chefs-Larder-Prepared-Vegetable-Bouillon/dp/B00OCWJR56
update products
   set ingredients = 'Salt, vegetable oils, flavour enhancers, cornflour, carrot powder, flavourings including parsley extract, herbs and spices.',
       directions = 'Use as a vegetable stock base, seasoning, gravy base or cooking paste. Dilute according to packaging.',
       conservation = 'Store in a cool, dry place out of direct sunlight. Keep closed after use. Once opened, use within the period shown on packaging.',
       additional_info = ''
 where id = 'NC-02675';

-- Source: https://tasteofartisan.com/homemade-bratwurst-recipe/
update products
   set ingredients = 'Pork and/or veal, water, salt and spices such as white pepper, marjoram, caraway, ginger and nutmeg. May contain casing and other seasonings depending on label.',
       directions = 'Cook thoroughly until piping hot. Grill, pan fry or heat according to packaging.',
       conservation = 'Keep refrigerated or frozen according to packaging. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02677';

-- Source: https://www.usinger.com/deli/bockwurst.html
update products
   set ingredients = 'Pork, veal, water, onions, salt, spices, eggs, parsley. Contains EGG.',
       directions = 'Heat gently in hot water or grill/pan fry according to packaging until piping hot.',
       conservation = 'Keep refrigerated or frozen according to packaging. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02678';

-- Source: https://twoguysandacooler.com/frankfurter/
update products
   set ingredients = 'Pork and/or beef, pork fat, water/ice, salt, curing salt, sugar, garlic, onion, paprika, coriander, white pepper, nutmeg and casing. May contain MILK depending on label.',
       directions = 'Heat thoroughly before serving. Simmer, grill or pan fry according to packaging.',
       conservation = 'Keep refrigerated or frozen according to packaging. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02682';

-- Source: https://en.wikipedia.org/wiki/Wei%C3%9Fwurst
update products
   set ingredients = 'Veal and pork fatback with parsley, lemon, mace, onions, ginger and cardamom. May contain casing and other seasonings depending on label.',
       directions = 'Heat gently in hot water; do not boil. Serve hot with mustard or according to packaging.',
       conservation = 'Keep refrigerated or frozen according to packaging. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02683';

-- Source: https://mccainfoodservice.com/me-en/products/steakhouse-fries/
update products
   set ingredients = 'Potatoes, sunflower oil.',
       directions = 'Cook from frozen until golden and crisp. Deep fry, oven bake or air fry according to packaging.',
       conservation = 'Keep frozen at -18C. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02731';
