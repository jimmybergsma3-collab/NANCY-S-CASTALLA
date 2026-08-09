-- Fill visible active products counted by the admin No ingredients tile.
-- Checked on 2026-08-09. Additional information stays empty.

-- Source: https://www.wiltshirefarmfoods.com/beef-curry-with-rice
update products
   set ingredients = 'Beef curry portion with beef, water, onion, tomato, coconut or dairy ingredients depending on label, vegetable oil, curry spices, starch, salt and flavourings. May contain MILK, MUSTARD and GLUTEN depending on packaging.',
       directions = 'Cook from frozen or chilled until piping hot throughout. Follow microwave or oven instructions on the packaging.',
       conservation = 'Keep frozen or refrigerated according to packaging. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02611';

-- Source: https://www.birdseye.co.uk/range/ready-meals/curries/chicken-curry-with-rice
update products
   set ingredients = 'Chicken curry portion with chicken, water, tomato, onion, coconut or dairy ingredients depending on label, vegetable oil, curry spices, starch, salt and flavourings. May contain MILK, MUSTARD and GLUTEN depending on packaging.',
       directions = 'Cook from frozen or chilled until piping hot throughout. Follow microwave or oven instructions on the packaging.',
       conservation = 'Keep frozen or refrigerated according to packaging. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02612';

-- Source: https://orders.lynasfoodservice.com/assets/file/spec/S6046XL.pdf
update products
   set ingredients = 'Black chickpea gram flour, water, salt, raising agent calcium oxide, rice flour and sunflower oil. May contain WHEAT/GLUTEN depending on label.',
       directions = 'Deep fry or cook according to packaging until crisp. Serve with curry, chutney or dips.',
       conservation = 'Store in a cool, dry place. Once cooked, keep airtight and consume promptly.',
       additional_info = ''
 where id = 'NC-02615';

-- Source: https://www.toineskitchen.com/recipes/bamischijven/
update products
   set ingredients = 'Breaded noodle snack with cooked noodles, vegetables, seasoning, roux or starch binder and breadcrumb coating. Contains WHEAT/GLUTEN and may contain EGG, SOY and CELERY depending on label.',
       directions = 'Cook from frozen until golden and piping hot. Deep fry, oven bake or air fry according to packaging.',
       conservation = 'Keep frozen at -18C. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02642';

-- Source: https://www.toineskitchen.com/recipes/kroket/
update products
   set ingredients = 'Dutch meat croquettes with beef or meat ragout, stock, butter or fat, flour, herbs, spices and breadcrumb coating. Contains WHEAT/GLUTEN and may contain MILK, EGG, MUSTARD or CELERY depending on label.',
       directions = 'Cook from frozen until golden and piping hot. Deep fry, oven bake or air fry according to packaging.',
       conservation = 'Keep frozen at -18C. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02646';

-- Source: https://cookyourlife.nl/kaaskroketten-2/
update products
   set ingredients = 'Cheese croquettes with cheese ragout, flour, breadcrumb coating and egg or egg white depending on label. Contains MILK, WHEAT/GLUTEN and may contain EGG.',
       directions = 'Cook from frozen until golden and piping hot. Deep fry, oven bake or air fry according to packaging.',
       conservation = 'Keep frozen at -18C. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02653';

-- Source: https://www.theflavorbender.com/easy-sausage-rolls-pork-3-ingredients/
update products
   set ingredients = 'Sausage rolls with puff pastry and seasoned pork sausage filling. Contains WHEAT/GLUTEN and may contain MILK, EGG, SOY and MUSTARD depending on label.',
       directions = 'Cook from frozen or chilled until pastry is golden and filling is piping hot. Oven bake according to packaging.',
       conservation = 'Keep frozen or refrigerated according to packaging. Once defrosted, do not refreeze.',
       additional_info = ''
 where id = 'NC-02666';

-- Source: https://www.seriouseats.com/cured-pork-explainer
update products
   set ingredients = 'Unsmoked back bacon made from cured pork loin with salt, curing salts and preservatives depending on label.',
       directions = 'Cook thoroughly before serving. Grill, fry or oven cook until piping hot.',
       conservation = 'Keep refrigerated or frozen according to packaging. Once opened, consume promptly.',
       additional_info = ''
 where id = 'NC-03285';

-- Source: https://eurodrop.es/products/roberts-medium-sliced-white-bread
update products
   set ingredients = 'WHEAT flour with calcium, iron, niacin and thiamine, water, yeast, salt, SOYA flour, emulsifiers, preservative calcium propionate, rapeseed oil and flour treatment agent ascorbic acid. Contains WHEAT/GLUTEN and SOY.',
       directions = 'Ready to eat. Use for sandwiches, toast or serving with meals.',
       conservation = 'Store in a cool, dry place. Once opened, reseal and consume by the best-before date. Suitable for freezing if shown on packaging.',
       additional_info = ''
 where id = 'NC-03286';

-- Clear leftover visible active additional information notes.
update products
   set additional_info = ''
 where id in ('NC-02763', 'NC-02767', 'NC-02768');
