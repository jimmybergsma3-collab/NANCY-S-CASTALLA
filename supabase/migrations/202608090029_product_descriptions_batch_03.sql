-- Add customer-facing descriptions for the third batch of 25 active webshop products.
-- Additional information is intentionally not touched.
update public.products
set description = case id
  when 'NC-02626' then 'Snelkokende tarwenoedels voor roerbakgerechten, soepen en Aziatische maaltijden. Koken snel gaar en zijn handig als basis voor doordeweekse gerechten. Verpakt per 500 gram.'
  when 'NC-02641' then 'Nasi schijven zijn hartige rijstsnacks met gekruide vulling en krokante paneerlaag. Ideaal voor frituur, borrelplank of snelle snackservice. Verpakt per 18 stuks van 135 gram.'
  when 'NC-02671' then 'Groene pesto in grootverpakking met basilicum, olie, kaas en noten. Lekker door pasta, op brood, bij salades of als smaakmaker in warme gerechten. Verpakt per 1,2 kg.'
  when 'NC-02672' then 'Rode pesto met tomaat, kruiden en hartige Italiaanse smaak. Geschikt voor pasta, broodjes, tapas, sauzen en marinades. Verpakt per 1,12 kg.'
  when 'NC-02677' then 'Duitse bratwurst in portieverpakking, geschikt voor grill, pan of barbecue. Lekker met brood, zuurkool, aardappelsalade of mosterd. Verpakt per 13 worsten van 120 gram.'
  when 'NC-02683' then 'Weisswurst is een zachte Duitse worst met milde kruiding, traditioneel geserveerd met mosterd en brood. Verpakt per 20 stuks van 60 gram.'
  when 'NC-02733' then 'Zoete aardappelfriet met krokante coating, geschikt voor oven of frituur. Lekker als bijgerecht, snack of alternatief voor gewone friet. Verpakt per 2,5 kg.'
  when 'NC-02751' then 'Signature zoete aardappelfriet met extra krokante coating. Geschikt voor horeca, oven of frituur en lekker bij burgers, bowls en snacks. Verpakt per 2,27 kg.'
  when 'NC-02754' then 'Aardappelgratin dauphinoise in porties, romig en makkelijk te bereiden als bijgerecht bij vlees, vis of groente. Verpakt per 10 stuks van 100 gram.'
  when 'NC-02879' then 'Kipvleugels voor grill, oven, barbecue of frituur. Geschikt om naturel te kruiden of te marineren met je eigen saus. Verkocht per kilo.'
  when 'NC-02880' then 'Barbecue kippenvleugels met hartige BBQ-smaak, geschikt voor oven, grill of snackservice. Verpakt per zak van 2 kg.'
  when 'NC-02881' then 'Amerikaanse stijl kipnuggets met krokante coating. Handig voor snelle snacks, kindermenu’s of borrelhapjes. Verpakt per 1 kg.'
  when 'NC-02966' then 'Ongezouten boter in grootverpakking voor bakken, koken, sauzen en patisserie. Neutrale smaak en flexibel in gebruik. Verpakt per 1 kg.'
  when 'NC-02975' then 'Geitenkaasrol met zachte, romige smaak. Lekker in salades, op brood, bij tapas of warm uit de oven. Verpakt per rol van 1 kg.'
  when 'NC-02976' then 'Roquefort is een krachtige blauwaderkaas van schapenmelk. Lekker bij kaasplanken, sauzen, salades of brood. Verpakt per 100 gram.'
  when 'NC-03003' then 'Kruidenmix voor kip met zout, geschikt voor marinades, rubs, sauzen en het op smaak brengen van kipgerechten. Verpakt per 430 gram.'
  when 'NC-03097' then 'Remia Chipotle Mayonaise is een romige mayonaise met rokerige chipotle-smaak. Lekker bij friet, burgers, wraps, kip en snacks. Verpakt per fles van 800 ml.'
  when 'NC-03098' then 'Remia Sriracha Mayonaise combineert romige mayonaise met pittige sriracha. Lekker bij friet, sushi bowls, burgers, kip en snacks. Verpakt per fles van 800 ml.'
  when 'NC-03171' then 'Stella Artois is een bekende Belgische pils met frisse, licht bittere smaak. Geleverd per tray van 24 blikjes of flesjes van 330 ml.'
  when 'NC-03172' then 'Tennent’s Lager in fles is een Schots bier met frisse pilsstijl en zachte mouttonen. Geleverd per doos van 24 flessen van 330 ml.'
  when 'NC-03173' then 'Tennent’s Lager in blik is een Schots bier met frisse pilsstijl, ideaal gekoeld te serveren. Geleverd per tray van 24 blikken van 500 ml.'
  when 'NC-03174' then 'Magners Dark Fruit is een fruitige cider met appel, zwarte bes en braam. Geleverd per tray van 24 blikken van 440 ml.'
  when 'NC-03176' then 'Corona Extra is een licht Mexicaans bier, bekend om de frisse smaak en vaak geserveerd met limoen. Geleverd per doos van 24 flessen van 35 cl.'
  when 'NC-03177' then 'Peroni Nastro Azzurro is een Italiaanse premium pils met frisse, droge afdronk. Geleverd per doos van 24 flessen van 33 cl.'
  when 'NC-03178' then 'Rekorderlig Strawberry-Lime is een Zweedse fruitcider met aardbei en limoen. Fris en zoet, ideaal gekoeld te serveren. Geleverd per doos van 15 blikken of flessen van 500 ml.'
  else description
end
where id in (
  'NC-02626',
  'NC-02641',
  'NC-02671',
  'NC-02672',
  'NC-02677',
  'NC-02683',
  'NC-02733',
  'NC-02751',
  'NC-02754',
  'NC-02879',
  'NC-02880',
  'NC-02881',
  'NC-02966',
  'NC-02975',
  'NC-02976',
  'NC-03003',
  'NC-03097',
  'NC-03098',
  'NC-03171',
  'NC-03172',
  'NC-03173',
  'NC-03174',
  'NC-03176',
  'NC-03177',
  'NC-03178'
);
