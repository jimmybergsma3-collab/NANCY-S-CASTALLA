-- Add customer-facing descriptions for the first 25 active webshop products
-- that still missed a usable public description. Additional information is not touched.
update public.products
set description = case id
  when 'NC-02328' then 'Spritz & Roll Original is een frisse, mousserende aperitiefcocktail met sinaasappel- en grapefruittonen. Verpakt per doos van 6 flessen van 75 cl, geschikt voor borrel, terras of feest.'
  when 'NC-02349' then 'Agave Boom Lime is een ready-to-drink margarita-stijl cocktail met agavewijn en frisse limoensmaak. Verpakt per doos van 12 flesjes van 200 ml.'
  when 'NC-02350' then 'Agave Boom Mango Chamoy is een ready-to-drink cocktail met agavewijn, mango en een kruidige chamoy-twist. Verpakt per doos van 12 flesjes van 200 ml.'
  when 'NC-02351' then 'Agave Boom Passion Fruit is een ready-to-drink margarita-stijl cocktail met agavewijn en tropische passievruchtsmaak. Verpakt per doos van 12 flesjes van 200 ml.'
  when 'NC-02352' then 'Agave Boom Strawberry is een ready-to-drink margarita-stijl cocktail met agavewijn en zoete aardbeiensmaak. Verpakt per doos van 12 flesjes van 200 ml.'
  when 'NC-02353' then 'WKD Blue is een sprankelende alcoholische mixdrank met fruitige smaak en vodka. Een bekende Britse alcopop, geleverd per doos van 24 flesjes van 275 ml.'
  when 'NC-02354' then 'Bacardi Breezer Lime is een lichte rum-mixdrank met frisse limoensmaak. Handig voor feestjes en gekoelde verkoop, geleverd per doos van 24 flesjes van 275 ml.'
  when 'NC-02355' then 'Bacardi Breezer Passion Fruit Mango combineert rum met tropische passievrucht- en mangosmaak. Geleverd per doos van 12 flesjes van 275 ml.'
  when 'NC-02356' then 'Bacardi Breezer Watermelon is een fruitige rum-mixdrank met watermeloensmaak. Een makkelijk gekoelde ready-to-drink keuze, geleverd per doos van 24 flesjes van 275 ml.'
  when 'NC-02357' then 'Bacardi Breezer Orange is een rum-mixdrank met frisse sinaasappelsmaak. Geleverd per doos van 24 flesjes van 275 ml voor bar, terras of thuisvoorraad.'
  when 'NC-02358' then 'Bacardi Limon & Lemonade is een ready-to-drink cocktail met Bacardi rum en citroenlimonade. Geleverd per doos van 12 blikjes van 250 ml.'
  when 'NC-02359' then 'Bacardi Mojito is een kant-en-klare cocktail met rum, limoen, suiker en muntaroma. Geleverd per doos van 12 blikjes van 250 ml.'
  when 'NC-02360' then 'Smirnoff Ice is een sprankelende vodka-mixdrank met frisse citrussmaak. Een klassieker onder de alcopops, geleverd per doos van 24 flesjes van 275 ml.'
  when 'NC-02362' then 'Le Coq Cosmopolitan is een ready-to-drink cocktail met cranberry-, sinaasappel- en limoensmaak. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-02363' then 'Le Coq Pina Colada is een ready-to-drink cocktail met tropische kokos- en ananassmaak. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-02364' then 'Le Coq T-Quila Sunrise is een ready-to-drink cocktail met tequila-, sinaasappel- en grenadinesmaak. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-02365' then 'Le Coq Sex on the Beach is een ready-to-drink cocktail met sinaasappel, perzik, cranberry en rumaroma. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-02366' then 'Le Coq Margarita is een ready-to-drink cocktail met limoen, watermeloen en rumaroma. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-02367' then 'Le Coq Blue Lagoon is een ready-to-drink cocktail met curacao-, kokos- en ananassmaak. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-02368' then 'Le Coq Mojito Classic is een ready-to-drink cocktail met limoen, munt en rumaroma. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-02369' then 'Bombay Sapphire & Tonic is een kant-en-klare gin-tonic met de herkenbare Bombay Sapphire botanicals en tonic. Geleverd per doos van 12 blikjes van 25 cl.'
  when 'NC-02370' then 'VK Blue is een sprankelende vodka-mixdrank met zoete fruitsmaak. Populair als gekoelde party drink, geleverd per doos van 24 flesjes van 275 ml.'
  when 'NC-02371' then 'VK Ice is een sprankelende vodka-mixdrank met frisse citroensmaak. Geleverd per doos van 24 flesjes van 275 ml.'
  when 'NC-02372' then 'VK Orange & Passionfruit is een fruitige vodka-mixdrank met sinaasappel- en passievruchtsmaak. Geleverd per doos van 24 flesjes van 275 ml.'
  when 'NC-02373' then 'VK Strawberry & Lime is een sprankelende vodka-mixdrank met aardbei en limoen. Geleverd per doos van 24 flesjes van 275 ml.'
  else description
end
where id in (
  'NC-02328',
  'NC-02349',
  'NC-02350',
  'NC-02351',
  'NC-02352',
  'NC-02353',
  'NC-02354',
  'NC-02355',
  'NC-02356',
  'NC-02357',
  'NC-02358',
  'NC-02359',
  'NC-02360',
  'NC-02362',
  'NC-02363',
  'NC-02364',
  'NC-02365',
  'NC-02366',
  'NC-02367',
  'NC-02368',
  'NC-02369',
  'NC-02370',
  'NC-02371',
  'NC-02372',
  'NC-02373'
);
