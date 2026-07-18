# Technische beslissingen: Nancy's Castalla

**Formaat:** chronologisch Architecture Decision Log  
**Peildatum:** 18 juli 2026

Dit document legt belangrijke technische beslissingen en hun motivatie vast. Het beschrijft geen volledige codegeschiedenis; daarvoor dient `CHANGELOG.md`. Nieuwe besluiten worden onder de juiste datum toegevoegd. Wanneer een besluit wordt vervangen, blijft het oude besluit staan met een verwijzing naar het nieuwe besluit.

## 2026-07-18

### Admin-ordercorrectie vóór definitieve factuur

**Besluit:** orders mogen in de backoffice worden gecorrigeerd zolang er geen definitieve factuur bestaat, betaling niet `paid` is, voorraad niet is gecommit en de order niet geleverd/geannuleerd is. De admin stuurt alleen productcode, verpakking en aantal; de server haalt actuele productdata op, valideert bestelbaarheid en rekent prijs, IVA en totaal opnieuw uit.

**Waarom:** Nancy's Castalla werkt met pre-orders en leveranciersbeschikbaarheid. Een order is eerst een aanvraag; pas na controle kan de juiste verpakking of vervanging worden vastgelegd. Dit voorkomt dat klanten of admins officiële facturen maken op basis van producten die niet leverbaar blijken.

### Beperkte invoice-voiding voor ordercorrecties

**Besluit:** een nog niet verzonden/onbetaalde/onverwerkte factuur mag via een expliciete adminactie op status `void` worden gezet voor correctie. De factuur en regels blijven bestaan, voidreden/actor/datum staan op de factuur, een audit-snapshot bewaart de oorspronkelijke toestand en een nieuwe factuur moet daarna opnieuw worden gemaakt met een nieuw nummer.

**Waarom:** de eerste echte orders kunnen operationele correcties vragen voordat er sprake is van fiscale verzending of betaling. Zodra een factuur verzonden, betaald, geëxporteerd, gecrediteerd, geannuleerd of gekoppeld aan voorraad/levering is, hoort correctie via een formele creditnota/correctieworkflow te gebeuren.

### Gescheiden voorraadcorrectie bij ordercorrectie

**Besluit:** gecommitte voorraad mag alleen worden vrijgegeven wanneer de bestaande negatieve `sale`-movements exact overeenkomen met de huidige tracked orderregels; de release schrijft positieve `correction_release`-movements. Als een legacy/bug-order wel `inventory_committed=true` heeft maar nul `inventory_movements`, is er een aparte actie die uitsluitend de vlag reset en geen voorraadmutatie maakt.

**Waarom:** factuur 10/order 22 liet zien dat een oude inconsistente status kan bestaan. Het systeem mag dan geen fictieve voorraadbewegingen creëren. Door normale terugboeking en legacy-vlagherstel strikt te scheiden blijft de audit betrouwbaar.

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

### Compacte AI-context in de repositoryroot

**Besluit:** `AI_CONTEXT.md` vormt de eerste briefing voor iedere toekomstige AI-assistent en verwijst voor verdieping naar `/docs`.

**Waarom:** een compacte, praktische context verkleint de kans dat een nieuwe assistent bestaande mobiele, order-, voorraad- of beveiligingskeuzes per ongeluk doorbreekt. De rootlocatie maakt het bestand direct vindbaar.

### Klantprofieltaal als leidende voorkeur

**Besluit:** `customers.language` is voor ingelogde klanten de bron van waarheid buiten adminroutes. Taalkeuze synchroniseert profiel, URL, cookie en localStorage.

**Waarom:** een accounttaal die alleen als databaseveld wordt opgeslagen verandert de werkelijke gebruikerservaring niet. De gecombineerde aanpak werkt voor volgende bezoeken, handmatige taalwissels en directe links, terwijl adminroutes stabiel blijven.

### Next.js 16 proxy voor automatische localedetectie

**Besluit:** locale-routing voor routes zonder taalprefix draait in `src/proxy.ts` en gebruikt cookie, `Accept-Language`, optionele landcode en Engelse fallback.

**Waarom:** Next.js 16 gebruikt de proxyconventie. Het eerdere rootbestand `middleware.ts` werd in de huidige `src`-structuur niet uitgevoerd, waardoor hardcoded `/en`-redirectpagina's onbedoeld de taal bepaalden.

### Canonieke productdata blijft onvertaald

**Besluit:** UI-teksten en categorielabels worden vertaald, maar productnamen en leveranciersinhoud blijven voorlopig canonieke databasewaarden.

**Waarom:** er bestaat nog geen betrouwbaar productvertalingsmodel. Automatisch vertalen zou voedsel-, merk- en allergeneninformatie kunnen vervormen.

## 2026-07-06

### Interne factuursnapshot is leidend

**Besluit:** een factuur wordt éénmaal transactioneel uit een factureerbare order gemaakt en bewaart daarna eigen klant-, adres-, orderregel-, prijs- en btw-snapshots. Een unieke index op `order_id` voorkomt een tweede normale factuur.

**Waarom:** een factuur moet historisch gelijk blijven wanneer een klantprofiel, productnaam, verpakking of prijs later wijzigt. Correcties horen later via creditnota's te lopen, niet door een bestaande factuur te overschrijven.

## 2026-07-11

### Gescheiden test- en productiefactuurseries

**Besluit:** nieuwe facturen krijgen serievelden naast het bestaande factuurnummer. In `prelaunch` gebruikt de applicatie `TEST-{jaar}-{zes cijfers}`; in `live` gebruikt de applicatie `NC-{jaar}-{zes cijfers}`. Bestaande facturen worden niet automatisch hernummerd en factuurnummers worden niet hergebruikt.

**Waarom:** Nancy's Castalla heeft testorders en testfacturen nodig vóór livegang, maar de officiële productieserie moet schoon en oplopend kunnen starten. Historische facturen mogen voor administratie en audit niet stil worden overschreven of gerecycled.

### Veilig opschonen in plaats van vrij verwijderen

**Besluit:** klanten, orders en facturen krijgen test- en archiefvelden. Echte klanten met Auth-account, orders of facturen kunnen niet worden verwijderd vanuit admin; archiveren is de veilige actie. Alleen expliciet gemarkeerde testorders zonder geboekte voorraadmutatie en zonder officiële livefactuur mogen via een server-side databasefunctie worden verwijderd. Alle cleanupacties worden in `admin_audit_log` vastgelegd.

**Waarom:** een webshop mag geen echte klant-, order- of factuurhistorie verliezen door een beheerklik. Testdata moet wel beheersbaar blijven in de prelaunchfase, maar uitsluitend met harde databasechecks en auditspoor.

### Oude prijslijstcatalogus archiveren voor livegang

**Besluit:** de prelaunch-catalogus wordt niet verwijderd of geleegd. Producten krijgen een aparte lifecycle-status (`active`, `archived`, `disabled`, `draft`) en importbatch. De bulkactie `Archive current catalogue` zet bestaande producten op `archived`, maakt ze publiek onzichtbaar en labelt ze met `IMPORT_2026_PRELAUNCH`. Nieuwe imports mogen archived productcodes niet automatisch wijzigen of heractiveren; herstel kan alleen bewust per product.

**Waarom:** de oude circa 1580 producten komen uit verouderde prijslijsten, maar productcodes, afbeeldingen, categorieën, voorraadgeschiedenis en relaties mogen niet verloren gaan. Archiveren houdt de dagelijkse omgeving schoon voor livegang terwijl audit en terugzoekbaarheid behouden blijven.

### PDF-generatie blijft server-side en providerneutraal

**Besluit:** `pdf-lib` genereert de factuur uit interne data; Resend is alleen het verzendkanaal en niet de factuurbron.

**Waarom:** download en administratie blijven werken wanneer e-mail uitstaat of faalt. Adminroutes gebruiken de adminsessie; klantdownloads vereisen Supabase Auth plus eigendomscontrole.

### Persistente winkelmand vervangt het inline orderpaneel

**Besluit:** productkaarten voegen een gekozen verpakking toe aan een locale-onafhankelijke, lokaal opgeslagen winkelmand. Checkout staat op `/{locale}/cart`.

**Waarom:** klanten moeten aantallen kunnen beheren zonder terug te scrollen en hun selectie moet navigatie en reload overleven. WhatsApp blijft een supportkanaal en is niet de primaire databasecheckout.

### Eén beschikbaarheidsregel voor cart en order

**Besluit:** `evaluateProductAvailability` bepaalt zowel in de UI als op de server dat `coming-soon` geblokkeerd is, `preorder` altijd bestelbaar is en alleen `available` plus `track_inventory` fysieke voorraad vereist.

**Waarom:** verschillende regels in productkaart, winkelmand, order-API en database veroorzaakten tegenstrijdige uitkomsten. De order-API valideert alles opnieuw en blijft de uiteindelijke bron van waarheid.

### Pre-orders boeken geen fysieke voorraad af

**Besluit:** de orderstatus-RPC boekt bij bevestiging alleen `available`-producten met voorraadtracking af. Annulering herstelt uitsluitend regels waarvoor een eerdere verkoopmutatie bestaat.

**Waarom:** een pre-order vertegenwoordigt toekomstige inkoop en moet bij voorraad nul bevestigd kunnen worden zonder negatieve voorraad te creëren.

### Client ontvangt stabiele orderfoutcodes

**Besluit:** publieke orderfouten gebruiken codes die de locale-UI vertaalt; interne serverteksten worden niet rechtstreeks aan klanten getoond.

**Waarom:** foutmeldingen moeten meertalig en voorspelbaar zijn zonder bedrijfslogica per taal te dupliceren.

## 2026-07-07

### Jaar in factuurlabel zonder risicovolle renummering

**Besluit:** de bestaande globale `invoice_number` identity blijft de unieke, oplopende bron. PDF, admin, downloads en e-mail tonen `NC-{UTC-jaar issued_at}-{zes cijfers}`.

**Waarom:** hiermee krijgt de administratie een herkenbaar jaarlabel zonder bestaande facturen, foreign keys, sequences of orderkoppelingen te herschrijven. De teller wordt niet jaarlijks hergebruikt.

### Spaanse factuurpresentatie met configureerbare fiscale identiteit

**Besluit:** facturen zijn Spaans/Engels en tonen IVA per tarief. Verkopergegevens komen uitsluitend uit `config/business.ts`; ontbrekende fiscale naam of NIF/NIE veroorzaakt een zichtbare adminwaarschuwing.

**Waarom:** er mogen geen fiscale persoonsgegevens worden verzonnen. De technische structuur kan gereed zijn terwijl de definitieve gegevens en tekst nog door een gestor/boekhouder worden gecontroleerd.

**Ingestelde keuze:** facturen tonen `NANCY'S CASTALLA` prominent als handelsnaam en `JIMMY BERGSMA` kleiner als titular/autónomo, met NIF/NIE `Y8875740P` en het centrale adres. De titular staat ook in Terms/disclaimer.

### Ordernotities staan los van statusovergangen

**Besluit:** adminnotities gebruiken een afzonderlijke API-actie en starten geen orderstatus-RPC.

**Waarom:** een tekstcorrectie mag nooit voorraad afboeken, terugboeken of onbedoeld een statusmail sturen.

### E-mailfalen is operationeel, niet transactioneel

**Besluit:** orders en facturen worden vóór verzending opgeslagen. Resend-fouten worden gelogd en zichtbaar teruggegeven, maar draaien de bedrijfsdata niet terug.

**Waarom:** een tijdelijke mailstoring mag geen dubbele order of ontbrekende factuur veroorzaken. De beheerder kan facturen later opnieuw verzenden.

### Klantmails volgen ordergebeurtenissen en klanttaal

**Besluit:** ontvangen, bevestigd, betaald, afhaal-klaar, onderweg, afgeleverd en geannuleerd hebben eigen teksten in de vijf ondersteunde locales.

**Waarom:** één generieke statuszin gaf onvoldoende betaal- en afhaalinstructie en paste niet bij de internationale doelgroep.

## 2026-07-08

### Eén actuele projectstatus naast diepgaande documentatie

**Besluit:** `PROJECT_STATUS.md` wordt de korte operationele waarheid voor go-live-status, afgeronde mijlpalen en uitsluitend nog openstaande livegangpunten. `TECHNICAL_HANDOVER.md` blijft de volledige technische bron; `CHANGELOG.md` bewaart geschiedenis en `ROADMAP.md` bevat alleen toekomstig werk.

**Waarom:** afgeronde functies stonden door snelle ontwikkeling soms nog als roadmapitem vermeld. Een expliciete scheiding tussen actuele status, technische uitleg, geschiedenis en toekomst voorkomt dat een nieuw team reeds gebouwde functionaliteit opnieuw plant of productiegebreken over het hoofd ziet.

### Betaalmethode als aparte order- en factuurwaarde

**Besluit:** checkout bewaart een betaalvoorkeur in `orders.payment_method` en facturen nemen deze waarde over als snapshot. Toegestane waarden zijn `bizum`, `bank-transfer`, `cash`, `card` en `pending`.

**Waarom:** facturen en klantcommunicatie mogen niet langer `Payment: -` tonen. Een apart veld voorkomt dat betaalmethode uit vrije notities moet worden afgeleid en blijft geschikt voor latere betalingsintegraties.

### Branded HTML-mails zonder aparte templateprovider

**Besluit:** order-, status- en factuurmails krijgen responsive HTML direct in de bestaande Resend-mailservice, naast een tekstversie.

**Waarom:** voor de go-livefase is een professionele eerste indruk nodig zonder een nieuwe template-infrastructuur of externe afhankelijkheid toe te voegen. Orders en facturen blijven eerst opgeslagen; mailfalen blijft operationeel en niet transactioneel.

### Veilige productnaamvertaling als tussenstap

**Besluit:** bekende klantgerichte productnamen worden via een centrale helper vertaald voor publieke productkaarten, productdetail, zoeken, cart, mails, klantaccount en factuur-PDF. Onbekende producten vallen terug op de catalogusnaam.

**Waarom:** er is nog geen volledig producttranslation-model. Automatisch alles vertalen kan merknamen, voedselinformatie of allergenen vervormen; een gecontroleerde helper verbetert de klantbeleving zonder data-risico.

## 2026-07-11

### Archived catalogus beschermen tegen import-upserts

**Besluit:** `products.id`/`NC-xxxxx` blijft de unieke interne Nancy-productcode en publieke URL-sleutel. `supplier_code` en `ean` worden bewust niet uniek gemaakt. Archived producten worden via vervolg-migratie `202607110003_product_catalogue_conflict_protection.sql` door een database-trigger beschermd tegen gewone updates; alleen de expliciete restore-functie mag een archived product terugzetten. Nieuwe imports moeten een mogelijke match op leveranciercode, EAN, naam of verpakking als conflict behandelen en daarna bewust kiezen tussen nieuw importeren, overslaan of herstellen/koppelen.

**Waarom:** de oude prelaunchcatalogus moet volledig naast een nieuwe livecatalogus kunnen blijven bestaan. Leveranciers hergebruiken codes, EAN's kunnen in meerdere verpakkingen of batches terugkomen en productnamen zijn geen stabiele sleutel. Een oud importbestand met `on conflict (id) do update` mag archived producten niet stil wijzigen of heractiveren.

### Professionele transactionele e-mailstandaard

**Besluit:** transactionele order-, status- en factuurmails gebruiken een gedeelde responsive Nancy's Castalla-shell met logo, groene header, product-/ordertabel, betaalinformatie, contactknoppen, WhatsApp, website, Facebook en plain-text fallback. Resend gebruikt `Nancy's Castalla <orders@nancys.es>` als From, `info@nancys.es` als Reply-To voor klantmails en het klantadres als Reply-To voor adminordermeldingen. `List-Unsubscribe` blijft voorbereid maar niet standaard actief voor noodzakelijke transactionele mails.

**Waarom:** echte klanten moeten professionele, herkenbare mails ontvangen in Gmail, Outlook, Apple Mail en mobiele mailapps. Transactionele mails mogen niet lijken op losse tekstberichten en moeten duidelijk maken dat betaling pas na beschikbaarheidscontrole volgt. Een unsubscribe-header is zinvol voor marketing, maar niet standaard passend voor noodzakelijke order-, status- en factuurcommunicatie.

## 2026-07-12

### Leveranciersimports starten altijd als dry-run en draft

**Besluit:** actuele leverancierslijsten van Europ Foods en Tindale worden niet rechtstreeks in de livecatalogus geschreven. De nieuwe workflow gebruikt eerst een server-side dry-run met previewrapport. Confirmed import is in de API bewust geblokkeerd totdat de preview handmatig is beoordeeld en de nieuwe migratie bewust in Supabase is uitgevoerd. Nieuwe producten uit een toekomstige import worden standaard `draft`, `is_visible=false`, `featured=false`, zonder voorraadmutatie en met een nieuwe unieke Nancy-productcode.

**Waarom:** de oude prelaunchcatalogus moet bewaard blijven, maar mag de nieuwe livecatalogus niet vervuilen. Prijzen, verpakkingen, btw, categorieën en afbeeldingen vragen handmatige controle voordat producten zichtbaar mogen worden voor klanten.

### Supplier offers apart van Nancy-producten

**Besluit:** leveranciersdata wordt voorbereid in `supplier_product_offers` naast `products`. Een offer bewaart leverancier, leveranciercode, EAN, originele naam, broncategorie, verpakking, prijsvelden, bronbestand, importbatch en reviewstatus.

**Waarom:** hetzelfde Nancy-product kan later meerdere leveranciers of prijzen hebben. Leveranciercodes zijn alleen binnen leverancier en broncontext betekenisvol en mogen archived producten niet overschrijven. Producthistorie en publieke productcodes blijven daardoor stabiel.

### Importconflicten zijn handmatige beslissingen

**Besluit:** EAN, leveranciercode en genormaliseerde naam/verpakking worden gebruikt als duplicaatsignalen, niet als automatische merge-sleutel. Matches met active of archived producten worden als conflict of waarschuwing getoond. Mogelijke keuzes zijn nieuw importeren, overslaan, supplier offer koppelen of archived product expliciet herstellen.

**Waarom:** automatische samenvoeging kan oude producten reactiveren, verkeerde verpakkingen mengen of historische data wijzigen. Een menselijke keuze is verplicht bij onzekerheid.

### Faviconset uit officieel logo

**Besluit:** de favicon-, Apple- en Android-iconen worden gegenereerd uit het bestaande Nancy's Castalla-logo en geregistreerd via Next.js metadata en `site.webmanifest`.

**Waarom:** de webshop moet professioneel ogen in browser-tabs, iOS en Android zonder extra brandingassets of redesign.

### Confirmed leveranciersimport naar draft vrijgegeven

**Besluit:** na productiemigratie `202607120001_supplier_import_workflow.sql` mag de adminimport-API confirmed imports uitvoeren voor goedgekeurde Tindale- en Europ Foods-bestanden. De import maakt uitsluitend draftproducten, supplier offers en conflictlogs aan; publicatie blijft een aparte handmatige stap met reviewflags.

**Waarom:** Nancy's Castalla moet actuele leverancierslijsten snel kunnen bewerken voor livegang, maar producten mogen niet automatisch zichtbaar worden zolang verkoopprijs, IVA, categorie, verpakking en reviewstatus niet gecontroleerd zijn.

### Alleen Bizum en bankoverschrijving in klantflow

**Besluit:** nieuwe klantorders tonen alleen Bizum en bankoverschrijving als betaalmethode. WhatsApp-klantenservice, Bizum-betaalnummer en bankgegevens zijn centraal gescheiden in `config/business.ts`. Contant, kaart en Stripe blijven niet zichtbaar/selecteerbaar.

**Waarom:** de go-livefase werkt zonder online betaalprovider en zonder contante betaling. Duidelijke scheiding van WhatsApp en Bizum voorkomt dat klanten naar het verkeerde nummer betalen of appen.

### Admin-API's blijven JSON-safe bij productieschema-drift

**Besluit:** adminroutes voor Customers en Orders retourneren altijd gestructureerde JSON met een `diagnosticId`. Services vallen voor leesacties terug op basisselecties wanneer productie nog cleanup-/factuurserievelden uit `202607110001_admin_cleanup_and_invoice_series.sql` mist. Mutaties die ontbrekende kolommen nodig hebben stoppen met een duidelijke fout en wijzigen geen data.

**Waarom:** een productie-database kan tijdelijk achterlopen op de repositorymigraties. De backoffice moet dan nog steeds klanten en orders kunnen lezen zonder `Unexpected end of JSON input`, terwijl risicovolle gedeeltelijke updates worden voorkomen.

### Live businessmode als veilige standaard

**Besluit:** de applicatie gebruikt `live` als standaard `businessMode`. Alleen een expliciete environmentwaarde `BUSINESS_MODE=prelaunch` zet prelaunchgedrag aan. Bestaande facturen worden nooit automatisch hernummerd.

**Waarom:** Nancy's Castalla beweegt naar livegang. Een ontbrekende Vercel-env mag toekomstige facturen niet per ongeluk in de testserie houden, maar Preview/staging kan nog bewust prelaunch blijven.

### Leveranciersdoosprijs en publieke verkoopeenheid blijven gescheiden

**Besluit:** geïmporteerde leveranciersproducten krijgen aparte velden voor leverancierdoosprijs, bron-eenheidsprijs, aantal per doos, bronverpakking, publieke verkoopeenheid en reviewstatus. Producten uit `IMPORT_2026_LIVE_%` mogen niet publiek zichtbaar of bestelbaar zijn zolang `sales_unit_confirmed`, `price_basis_confirmed`, `sales_unit_type`, verpakking en verkoopprijs niet logisch samen gecontroleerd zijn.

**Waarom:** leverancierslijsten bevatten vaak een doosprijs en een bron-eenheidsprijs. Wanneer de publieke verpakking nog `24x500ml` toont maar de verkoopprijs rond de eenheidsprijs ligt, lijkt de webshop een hele doos voor een stukprijs te verkopen. De Magners-controle op 12 juli 2026 heeft dit risico concreet aangetoond. De veilige regel is daarom: admin kiest expliciet of het product per doos, per stuk, per custom pack, per kg of per unit verkocht wordt voordat publicatie of cart/order-validatie mogelijk is.

## 2026-07-16

### Automatische i18n-structuurcontrole

**Besluit:** `npm run lint` voert eerst `scripts/validate-i18n.mjs` uit. Deze controle vergelijkt de dictionary-structuur van `en`, `nl`, `de`, `es` en `sv`, faalt op lege vertalingen en signaleert kapotte accent-encoding in de i18n-bronbestanden.

**Waarom:** de webshop heeft meerdere vertaalbronnen en snelle wijzigingen hadden geleid tot oude of ontbrekende klantteksten. Een lichte controle vóór ESLint voorkomt dat één locale stil achterblijft of dat accenten kapot in productie komen.

### Veilige productweergavevertaling blijft code-only

**Besluit:** productnamen en klantgerichte beschrijvingen worden alleen bij weergave vertaald via helpers die hoofdletters, accenten, leestekens en bekende importvarianten normaliseren. Onbekende productnamen blijven de catalogusnaam; onbekende niet-Engelse beschrijvingen tonen een korte locale-fallback. Supabase-productdata, supplier offers, prijzen, IVA, categorieën en zichtbaarheid worden niet gewijzigd.

**Waarom:** leveranciersinhoud mag niet automatisch worden overschreven of met AI worden verzonnen, zeker niet bij voedselinformatie. De klantbeleving verbetert voor bekende producten zonder risico op verkeerde productdata, allergeneninformatie of historische order-/factuurverschillen.

## Beslisregel voor toekomstige wijzigingen

Leg een besluit hier vast wanneer het een architectuurgrens, datamodel, beveiligingsmodel, externe provider, kernworkflow of blijvende ontwikkelconventie verandert. Vermeld altijd datum, besluit, motivatie, gevolgen en eventueel het vervangen besluit.
