-- Add customer-facing descriptions for the final 19 active webshop products.
-- Additional information is intentionally not touched.
update public.products
set description = case id
  when 'NC-03180' then 'Kopparberg Wildberries is een fruitige cider met wilde bessensmaak. Fris, zoet en ideaal gekoeld te serveren. Geleverd per doos van 24 blikken of flessen van 500 ml.'
  when 'NC-03181' then 'Kopparberg Mixed Fruit is een populaire fruitcider met gemengde fruitsmaak. Fris en zoet, geleverd per doos van 24 blikken of flessen van 500 ml.'
  when 'NC-03182' then 'Kopparberg Strawberry & Lime is een frisse fruitcider met aardbei en limoen. Ideaal gekoeld te serveren, geleverd per doos van 24 blikken of flessen van 500 ml.'
  when 'NC-03189' then 'Zwarte bes geconcentreerd is een aanmaakdrank met volle bessensmaak. Meng met water naar smaak voor limonade of gebruik als basis voor drankjes. Verpakt per fles van 1,5 liter.'
  when 'NC-03190' then 'Limoen geconcentreerd is een frisse aanmaakdrank met limoensmaak. Meng met water naar smaak of gebruik als basis voor cocktails en mocktails. Verpakt per fles van 1,5 liter.'
  when 'NC-03191' then 'Geconcentreerde sinaasappeldrank is een praktische aanmaakdrank met sinaasappelsmaak. Meng met water naar smaak voor een frisse drank. Verpakt per fles van 1,5 liter.'
  when 'NC-03192' then 'Fruit Shoot Blackcurrant is een fruitdrank met zwarte bessensmaak in handige flesjes. Ideaal voor kinderen, lunchboxen of onderweg. Geleverd per doos van 12 flesjes van 275 ml.'
  when 'NC-03193' then 'Fruit Shoot Orange is een fruitdrank met sinaasappelsmaak in handige flesjes. Ideaal voor kinderen, lunchboxen of onderweg. Geleverd per doos van 12 flesjes van 275 ml.'
  when 'NC-03194' then 'Fruit Shoot Summer Fruits is een fruitdrank met zomerse fruitsmaak in handige flesjes. Ideaal voor kinderen, lunchboxen of onderweg. Geleverd per doos van 12 flesjes van 275 ml.'
  when 'NC-03195' then 'Vimto 33 cl is een sprankelende Britse fruitdrank met herkenbare mix van fruit, kruiden en specerijen. Geleverd per doos van 24 blikjes van 33 cl.'
  when 'NC-03221' then 'Gedestilleerde azijn is een klassieke Britse malt vinegar, geschikt voor friet, vis, marinades en dressings. Verpakt per fles van 700 ml.'
  when 'NC-03231' then 'Tomaten ketchup in fles, geschikt voor friet, burgers, snacks, sauzen en dagelijks gebruik. Verpakt per fles van 750 ml.'
  when 'NC-03264' then 'Streaky bacon is gezouten buikspek in Britse stijl, ideaal voor ontbijt, burgers, broodjes en hartige gerechten. Verpakt per 454 gram.'
  when 'NC-03272' then 'Vegan Like! Mayonaise is een romige vegan saus zonder ei, geschikt voor friet, broodjes, salades en snacks. Verpakt per fles van 800 ml.'
  when 'NC-03273' then 'Sate saus is een pindasaus met hartige, licht zoete en kruidige smaak. Lekker bij kip, rijstgerechten, friet, snacks en barbecue. Verpakt per fles van 800 ml.'
  when 'NC-03297' then 'Kopparberg Tropical is een fruitige cider met tropische smaken zoals passievrucht, ananas en mango. Geleverd per doos van 24 blikken of flessen van 500 ml.'
  when 'NC-03412' then 'Samurai saus is een pittige romige saus met sambal en kruiden. Lekker bij friet, burgers, kebab, snacks en gegrilde gerechten. Verpakt per fles van 1 liter.'
  when 'NC-03418' then 'Knoflooksaus is een romige saus met duidelijke knoflooksmaak. Lekker bij shoarma, kebab, friet, burgers, wraps en snacks. Verpakt per fles van 800 ml.'
  when 'NC-03424' then 'Zoetzure chilisaus is een milde tot licht pittige saus met chili en knoflook. Lekker bij loempia’s, kip, rijstgerechten, snacks en barbecue. Verpakt per fles van 840 ml.'
  else description
end
where id in (
  'NC-03180',
  'NC-03181',
  'NC-03182',
  'NC-03189',
  'NC-03190',
  'NC-03191',
  'NC-03192',
  'NC-03193',
  'NC-03194',
  'NC-03195',
  'NC-03221',
  'NC-03231',
  'NC-03264',
  'NC-03272',
  'NC-03273',
  'NC-03297',
  'NC-03412',
  'NC-03418',
  'NC-03424'
);
