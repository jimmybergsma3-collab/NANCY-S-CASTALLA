-- Add customer-facing descriptions for the second batch of 25 active webshop products.
-- Additional information is intentionally not touched.
update public.products
set description = case id
  when 'NC-02374' then 'VK Ice 700 ml is een grotere fles sprankelende vodka-mix met frisse citroensmaak. Geleverd per doos van 6 flessen van 700 ml, ideaal om gekoeld te serveren.'
  when 'NC-02375' then 'VK Orange Passion Fruit 700 ml is een sprankelende vodka-mix met sinaasappel- en passievruchtsmaak. Geleverd per doos van 6 flessen van 700 ml.'
  when 'NC-02376' then 'All Shook Up Strawberry Daiquiri is een kant-en-klare rumcocktail met aardbei en limoen. Geleverd per doos van 12 blikjes van 250 ml.'
  when 'NC-02377' then 'All Shook Up Mojito is een kant-en-klare rumcocktail met limoen en munt. Geleverd per doos van 12 blikjes van 250 ml.'
  when 'NC-02378' then 'All Shook Up Passion Fruit Martini is een ready-to-drink cocktail met vodka en passievrucht. Geleverd per doos van 12 blikjes van 250 ml.'
  when 'NC-02379' then 'All Shook Up Pina Colada is een kant-en-klare tropische cocktail met ananas, kokos en rum. Geleverd per doos van 12 blikjes van 250 ml.'
  when 'NC-02380' then 'White Claw Natural Lime is een lichte hard seltzer met natuurlijke limoensmaak. Geleverd per doos van 12 blikjes van 330 ml.'
  when 'NC-02381' then 'White Claw Raspberry is een lichte hard seltzer met frambozensmaak. Geleverd per doos van 12 blikjes van 330 ml.'
  when 'NC-02382' then 'White Claw Green Apple is een lichte hard seltzer met frisse groene-appelsmaak. Geleverd per doos van 12 blikjes van 330 ml.'
  when 'NC-02383' then 'White Claw Mango is een lichte hard seltzer met tropische mangosmaak. Geleverd per doos van 12 blikjes van 330 ml.'
  when 'NC-02385' then 'Rhubarb & Ginger Classic Combinations is een ready-to-drink cocktail met rabarber en gember. Geleverd per doos van 24 blikjes van 250 ml.'
  when 'NC-02386' then 'Amaretto Sour Cocktail is een kant-en-klare cocktail met amaretto- en frisse citrustonen. Geleverd per doos van 6 flessen van 1 liter.'
  when 'NC-02387' then 'Espresso Martini Cocktail is een kant-en-klare cocktail met vodka, koffie en een volle espresso-smaak. Geleverd per doos van 6 flessen van 1 liter.'
  when 'NC-02388' then 'Mai Tai Cocktail is een kant-en-klare tropische cocktail met rum, citrus en amandelachtige tonen. Geleverd per doos van 6 flessen van 1 liter.'
  when 'NC-02389' then 'Mojito Cocktail is een kant-en-klare cocktail met witte rum, limoen en munt. Geleverd per doos van 6 flessen van 1 liter.'
  when 'NC-02390' then 'Pina Colada Cocktail is een kant-en-klare cocktail met rum, kokos en ananas. Geleverd per doos van 6 flessen van 1 liter.'
  when 'NC-02391' then 'Pornstar Martini Cocktail is een kant-en-klare cocktail met vodka, passievrucht en vanilletonen. Geleverd per doos van 6 flessen van 1 liter.'
  when 'NC-02392' then 'Sex on the Beach Cocktail is een kant-en-klare cocktail met vodka, perzik, sinaasappel en cranberry. Geleverd per doos van 6 flessen van 1 liter.'
  when 'NC-02523' then 'Verse back bacon van varkenslende, ideaal voor een Engels ontbijt, broodjes of brunchgerechten. Verpakt per 750 gram.'
  when 'NC-02580' then 'Chipotle pasta is een rokerige, pittige smaakpasta met chipotle, tomaat, ui en knoflook. Handig als basis voor marinades, sauzen, chili en Tex-Mex gerechten. Verpakt per 750 gram.'
  when 'NC-02602' then 'Tandoori pasta is een kruidige Indiase smaakpasta voor marinades, kip, groente en curry’s. Verpakt per pot van 1 kg.'
  when 'NC-02603' then 'Tikka pasta is een milde tot kruidige Indiase smaakpasta voor tikka masala, marinades en sauzen. Verpakt per pot van 1 kg.'
  when 'NC-02604' then 'Madras pasta is een pittige currybasis met warme specerijen zoals koriander, kurkuma, komijn en peper. Verpakt per pot van 1 kg.'
  when 'NC-02622' then 'Gepelde sojabonen zijn handig voor Aziatische gerechten, salades, stoofgerechten en vegetarische bereidingen. Verpakt per 500 gram.'
  when 'NC-02625' then 'Bamboestrips zijn knapperige bamboescheuten voor roerbakgerechten, curry’s, soepen en Aziatische maaltijden. Verpakt per 400 gram.'
  else description
end
where id in (
  'NC-02374',
  'NC-02375',
  'NC-02376',
  'NC-02377',
  'NC-02378',
  'NC-02379',
  'NC-02380',
  'NC-02381',
  'NC-02382',
  'NC-02383',
  'NC-02385',
  'NC-02386',
  'NC-02387',
  'NC-02388',
  'NC-02389',
  'NC-02390',
  'NC-02391',
  'NC-02392',
  'NC-02523',
  'NC-02580',
  'NC-02602',
  'NC-02603',
  'NC-02604',
  'NC-02622',
  'NC-02625'
);
