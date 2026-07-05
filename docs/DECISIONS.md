# Technische beslissingen: Nancy's Castalla

**Formaat:** chronologisch Architecture Decision Log  
**Peildatum:** 5 juli 2026

Dit document legt belangrijke technische beslissingen en hun motivatie vast. Het beschrijft geen volledige codegeschiedenis; daarvoor dient `CHANGELOG.md`. Nieuwe besluiten worden onder de juiste datum toegevoegd. Wanneer een besluit wordt vervangen, blijft het oude besluit staan met een verwijzing naar het nieuwe besluit.

## 2026-06-23

### Next.js App Router, TypeScript en Tailwind als basis

**Besluit:** de applicatie wordt gebouwd met Next.js App Router, React, TypeScript en Tailwind CSS.

**Waarom:** één project kan publieke pagina's, servercomponenten en API-routes leveren en rechtstreeks op Vercel worden uitgerold. TypeScript ondersteunt het uitgebreide product- en prijsmodel. Tailwind maakt een consistente responsive interface mogelijk zonder zware UI-library.

### Lokale productdata als eerste bron en fallback

**Besluit:** starterproducten worden in een lokale TypeScriptdataset vastgelegd en het datamodel wordt centraal getypeerd.

**Waarom:** versie 1 moest zonder verplichte database kunnen starten en prijzen moesten eenvoudig aanpasbaar zijn. Na invoering van Supabase bleef de lokale lijst als fallback bestaan.

### Geen actieve Stripe-checkout

**Besluit:** alleen een betaalproviderstructuur voorbereiden; geen Stripe-package of checkout activeren.

**Waarom:** pre-orders worden handmatig bevestigd en betaling loopt eerst via Bizum, overschrijving of contant. Een abstractie maakt latere integratie mogelijk zonder de order-UI volledig te herbouwen.

## 2026-06-24 tot 2026-06-28

### Supabase als database en productopslag

**Besluit:** Supabase PostgreSQL wordt de primaire catalogus- en orderdatabase; Supabase Storage bewaart productafbeeldingen.

**Waarom:** grote leverancierscatalogi, productbeheer, afbeeldingen en latere accounts vereisen persistente gedeelde data. Supabase combineert database, Auth, Storage en RPC's.

### Eigen numerieke productcodes

**Besluit:** producten krijgen oplopende codes in formaat `NC-00001`.

**Waarom:** leverancierscodes zijn niet uniform of uniek. Een eigen code is stabiel voor URL's, zoeken, labels en orders.

### Productdetailroute gebruikt productcode

**Besluit:** publieke productdetailpagina's gebruiken de Nancy-productcode als routeparameter.

**Waarom:** een productnaam kan wijzigen en bevat taalafhankelijke tekens; de interne productcode blijft stabiel.

### Categorieoverzicht in plaats van één lange productpagina

**Besluit:** de hoofdproductpagina toont klikbare categorieën; producten worden per categorie gezocht en bekeken.

**Waarom:** leveranciersimports kunnen duizenden producten bevatten. Eén lange pagina is onoverzichtelijk en slecht voor performance.

### Meerdere categorieën per product

**Besluit:** naast de primaire categorie wordt een categorie-array ondersteund.

**Waarom:** internationale producten hebben vaak meerdere relevante ingangen, zoals land, cultuur, diepvries en vegan/vegetarisch.

### Klantverpakkingen als afzonderlijke opties

**Besluit:** producten kunnen meerdere regels met label, hoeveelheid en prijs hebben.

**Waarom:** leveranciersdozen worden vaak opgesplitst in kleinere verkoopeenheden. De klant moet een duidelijke verpakking kiezen en de server moet deze keuze kunnen valideren.

## 2026-07-02

### Modulaire backofficefoundation

**Besluit:** de admin wordt uitgebreid met modules voor dashboard, producten, categorieën, klanten, orders, voorraad, leveranciers, inkoop, facturatie, btw, rapportages, instellingen en integraties.

**Waarom:** catalogusbeheer alleen is onvoldoende voor de toekomstige bedrijfsvoering. De modules worden gefaseerd operationeel gemaakt, terwijl de navigatie en datamodellen al een samenhangend backoffice vormen.

### API-ready integratieregister

**Besluit:** toekomstige koppelingen worden als providerneutrale integraties geregistreerd zonder ze direct te activeren.

**Waarom:** POS, SumUp, boekhouding, verzending, WhatsApp Business en mobiele apps moeten later kunnen worden toegevoegd zonder bedrijfslogica in UI-componenten te hardcoderen.

## 2026-07-04

### Klantauth via Supabase Auth

**Besluit:** registratie, login, logout en wachtwoordherstel gebruiken Supabase Auth; bedrijfsprofielen staan in `customers`.

**Waarom:** Supabase beheert wachtwoordhashes, tokenvernieuwing en bevestigingsflows. Een aparte klanttabel maakt bedrijfsvelden en orderrelaties mogelijk zonder het Auth-schema te misbruiken.

### Auth-users automatisch koppelen aan customers

**Besluit:** een databasetrigger upsert een customer wanneer een Auth-user wordt aangemaakt of gewijzigd.

**Waarom:** hiermee blijft de koppeling betrouwbaar, ook wanneer een user via Supabase wordt aangemaakt en niet via één specifieke applicatieroute.

### Adminauth blijft voorlopig afzonderlijk

**Besluit:** adminlogin gebruikt `ADMIN_EMAIL` en `ADMIN_PASSWORD` plus een HttpOnly HMAC-cookie, niet Supabase Auth.

**Waarom:** voor één beheerder was dit de kleinste veilige stap om de backoffice af te schermen. Het besluit is tijdelijk; individuele adminaccounts, rollen en MFA staan op de roadmap.

### Browserprijzen zijn niet vertrouwd

**Besluit:** de orderserver haalt producten, prijzen, btw en verpakkingen opnieuw uit Supabase en berekent totalen zelf.

**Waarom:** browserdata kan worden gewijzigd. Server-authoritatieve berekening voorkomt prijsmanipulatie en inconsistente btw.

### Idempotente ordercreatie

**Besluit:** iedere bestelpoging gebruikt een idempotency key met unieke database-index en een RPC die bestaande orders teruggeeft.

**Waarom:** netwerkretries en dubbel klikken mogen geen dubbele orders veroorzaken.

### Voorraad muteren bij bevestiging, niet bij aanvraag

**Besluit:** een order met status `new` reserveert niets; voorraad wordt atomisch afgeboekt bij `confirmed` en teruggezet bij `cancelled`.

**Waarom:** in de pre-orderfase moet Nancy eerst beschikbaarheid controleren. De transactionele RPC met row locks voorkomt dubbele afboeking. Open orders kunnen nog wel concurreren om dezelfde voorraad; reserveringen staan daarom op de roadmap.

### E-mail mag ordercreatie niet terugdraaien

**Besluit:** de order wordt opgeslagen voordat Resend wordt aangeroepen. E-mail gebruikt idempotency en verzendtijdstempels.

**Waarom:** een tijdelijke e-mailstoring mag geen orderverlies of dubbele order veroorzaken.

## 2026-07-05

### Resend voor eigen account- en ordermail

**Besluit:** ordermail gebruikt de Resend API vanaf `orders@nancys.es`; Supabase Auth gebruikt Resend Custom SMTP vanaf `account@nancys.es`.

**Waarom:** accountmails moeten het Nancy's Castalla-merk dragen en niet als generieke Supabase-mail overkomen. Gescheiden afzenders verduidelijken het type communicatie.

### Productiedomein als auth-redirect

**Besluit:** registratie en herstel bouwen redirects op basis van het actuele domein en `NEXT_PUBLIC_SITE_URL`; Supabase moet `https://www.nancys.es` als Site URL/redirect toestaan.

**Waarom:** bevestigingslinks mogen op mobiele apparaten niet naar `localhost` verwijzen.

### Ingelogde klantgegevens vooraf invullen

**Besluit:** het bestelcomponent leest de Supabase-sessie en het customerprofiel en vult naam, e-mail, telefoon en adres vooraf in.

**Waarom:** een ingelogde klant hoort gegevens niet opnieuw te hoeven typen en orders moeten correct aan het account gekoppeld worden.

### Centrale professionele documentatieset

**Besluit:** actuele techniek, zakelijke motivatie, roadmap, technische besluiten en wijzigingsgeschiedenis worden gescheiden bijgehouden in `/docs`.

**Waarom:** code en documentatie moeten synchroon blijven. Een nieuw team of een nieuwe ChatGPT-sessie moet de projectstatus kunnen begrijpen zonder eerst de volledige broncode te analyseren.

## Beslisregel voor toekomstige wijzigingen

Leg een besluit hier vast wanneer het een architectuurgrens, datamodel, beveiligingsmodel, externe provider, kernworkflow of blijvende ontwikkelconventie verandert. Vermeld altijd datum, besluit, motivatie, gevolgen en eventueel het vervangen besluit.
