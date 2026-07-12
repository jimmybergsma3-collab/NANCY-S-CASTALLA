# Changelog: Nancy's Castalla

Alle belangrijke wijzigingen aan dit project worden in dit bestand vastgelegd. De structuur volgt [Semantic Versioning](https://semver.org/) zolang het project pre-1.0 is:

- `PATCH`: fixes, documentatie en kleine compatibele verbeteringen.
- `MINOR`: nieuwe compatibele functionaliteit.
- `MAJOR`: vanaf 1.0, incompatibele productiewijzigingen.

Categorieën: **Toegevoegd**, **Gewijzigd**, **Verbeterd**, **Opgelost**, **Beveiliging** en **Verwijderd**.

## [Unreleased]

### Documentatie

- Volledige Git-geschiedenis en actuele codebase opnieuw vergeleken met alle projectdocumentatie.
- Nieuw `PROJECT_STATUS.md` toegevoegd met een statusmatrix, afgeronde mijlpalen en uitsluitend werkelijke TODO's vóór livegang.
- README, technische overdracht, roadmap, businesslog, beslislog en AI-context gesynchroniseerd met de huidige webshop-, admin-, order-, voorraad-, factuur- en e-mailfunctionaliteit.
- Verouderde roadmapitems voor reeds opgeleverde klantorderdetails, factuursnapshots, PDF-facturen en meertalige transactionele mails verwijderd.

### Toegevoegd

- Admin-herstelactie voor Europ Foods-importconflicten: bestaande pending conflictregels kunnen opnieuw worden geclassificeerd als `Importable variants`, `Repeated listings`, `Unresolved conflicts` of `Skipped/parse errors`.
- Nieuwe beveiligde admin-API's `POST /api/admin/imports/{runId}/reclassify` en `POST /api/admin/imports/{runId}/import-selected-conflicts` om geldige overgeslagen Europ Foods-regels alsnog als nieuwe hidden draftproducten te importeren.
- Backoffice-sectie `Europ Foods conflict recovery` binnen Supplier Imports met filtering, selectie en bulkimport van importeerbare varianten.
- Migratie `202607120001_supplier_import_workflow.sql` voor veilige leveranciersimports met `product_import_runs`, `supplier_product_offers`, reviewvelden, transactionele Nancy-productcode-reservering, batchpublicatie en veilige rollback zonder harde delete.
- Server-side importlaag voor Europ Foods PDF en Tindale XLS/XLSX met dry-run preview, parsewaarschuwingen, duplicate/conflict-signalering, reviewflags en confirmed import naar veilige draftproducten.
- Adminmodule `Supplier imports` met leverancierselectie, bestandupload, batchnaam, dry-runrapport, conflictvoorbeelden, importgeschiedenis, confirmed import to draft, publish approved batch en rollback naar draft/archive.
- Productie-import uitgevoerd voor `IMPORT_2026_LIVE_TINDALE_JULY`: 924 draftproducten en 924 supplier offers vanaf `NC-01581`, zonder publicatie of voorraadmutaties.
- Productie-import uitgevoerd voor `IMPORT_2026_LIVE_EUROPFOODS_JULY`: 713 veilige unieke draftproducten en 713 supplier offers vanaf `NC-02505`; 466 regels zijn overgeslagen/conflict-review en 483 conflictregels zijn vastgelegd.
- Complete faviconset op basis van het bestaande Nancy's Castalla-logo: `favicon.ico`, 16/32px iconen, Apple touch icon, Android iconen, webmanifest en donkergroene theme-color.
- Migratie `202607110002_product_catalogue_archiving.sql` met product lifecycle-status, importbatchtracking, archive-current-catalogue RPC en restore-archived-product RPC.
- Vervolg-migratie `202607110003_product_catalogue_conflict_protection.sql` met lookup-indexen voor leveranciercode/EAN/naam, een `product_import_conflicts`-logtabel en databasebescherming tegen gewone updates op archived producten.
- Admin bulkactie `Archive current catalogue`, waarmee de huidige catalogus onder `IMPORT_2026_PRELAUNCH` wordt gearchiveerd en publiek onzichtbaar gemaakt zonder databaseverwijdering.
- Productbeheerfilters voor Active, Archived, Disabled, Draft en All, met Active als standaardweergave.
- Veilige individuele restore-actie voor archived producten.
- Migratie `202607110001_admin_cleanup_and_invoice_series.sql` voor gecontroleerde adminopschoning, testmarkering, archiveren, auditlog en gescheiden factuurseries.
- Klantenbeheer met detailpaneel, zoeken, filters voor actief/gearchiveerd/test/met account/zonder account, veilige archiefactie en geblokkeerde delete voor echte accounts, orders en facturen.
- Compacter orderbeheer met zoekveld, status-, betaal-, datum- en test/real/archivefilters, bulkselectie voor testorders, testmarkering, archiveren en server-side veilige testorderverwijdering.
- Factuurbeheer met filters voor productie, test, gearchiveerd en geannuleerd, plus markeer-test en archiveeracties zonder factuurnummers te wijzigen.
- Configureerbare `businessMode`, `invoiceSeries` en `invoiceTestSeries` in `config/business.ts`.
- Admin auditlogging voor cleanup- en beheeracties zonder secrets.
- Centrale Facebooklink in `config/business.ts` voor transactionele e-mails en toekomstige contactblokken.
- Migratie `202607080001_payment_method_polish.sql` voor betaalmethode op orders en facturen.
- Betaalvoorkeur in checkout met ondersteuning voor Bizum, bankoverschrijving, contant, kaart en pending.
- Gedeelde betaalmethode-labels voor checkout, admin, klantaccount, e-mail en factuur-PDF.
- Veilige productnaamvertalingshelper voor bekende klantgerichte productnamen in publieke productkaarten, productdetail, zoeken, ordermails, klantaccount en facturen.
- Volledige responsieve admin-orderdetailweergave met klantgegevens, ordermetadata, orderregels, btw-totalen en directe contactacties.
- Aanklikbaar orderoverzicht en een duidelijke waarschuwing voor historische orders zonder orderregels.
- Interne factuurflow vanuit factureerbare orders, met oplopend factuurnummer en dubbele-factuurbeveiliging.
- Professionele Nancy's Castalla-factuur-PDF met klant-, order-, product- en btw-gegevens.
- Beveiligde PDF-download voor admins en voor de eigenaar van een klantorder.
- Responsieve facturatielijst met PDF- en e-mailacties op `/{locale}/admin/invoicing`.
- Uitklapbare klantorders met orderregels, totalen en factuurdownload in `/{locale}/account`.
- Migratie `202607060002_order_invoicing.sql` met factuursnapshots, `invoice_items` en transactionele creatie-RPC.
- Veilige pre-live normalisatie van het volgende factuurnummer via `202607070001_normalize_invoice_sequence.sql`.
- Bewerkbare admin-ordernotities met afzonderlijke beveiligde opslagactie.
- Registratie met wachtwoordbevestiging, twee toon/verbergknoppen en browservriendelijke autocomplete.
- Meertalige operationele e-mails voor order ontvangen, bevestigd, betaling ontvangen, klaar voor afhalen, onderweg en afgeleverd.
- Spaans/Engelse factuur-PDF met fiscale verkopersectie, klantsectie, tweetalige productkolommen, IVA-overzicht en Spaanse bedragnotatie.
- Jaargebonden externe factuurnummers in formaat `NC-2026-000001`, gebaseerd op de bestaande unieke globale teller.
- Configureerbare `fiscalName`, `fiscalId`, `fiscalAddress` en `businessActivity` in de centrale bedrijfsconfiguratie.
- Optionele klantvelden voor NIF/CIF/NIE, bedrijfsnaam en fiscaal adres via migratie `202607070002_spanish_invoice_customer_fields.sql`.

### Verbeterd

- Europ Foods-importidentiteit gebruikt nu leverancier + supplier code + productnaam + verpakking + doosprijs + eenheidsprijs. Daardoor worden verschillende verpakkingsvarianten, zoals `8775 MAGNERS CIDER 24x500ml` en `8780 MAGNERS CIDER 12x568ml`, niet meer samengevoegd of onterecht geblokkeerd.
- Exacte herhalingen van dezelfde Europ Foods-bronregel worden als `repeated_source_listing` behandeld: er wordt geen tweede Nancy-product aangemaakt, maar de herhaling blijft traceerbaar in conflict-/bronmetadata.
- Archived producten blokkeren nieuwe Europ Foods-draftproducten niet langer alleen vanwege dezelfde naam/verpakking; ze worden nog steeds nooit automatisch hersteld of gewijzigd.
- Betaalmethoden in de klantflow zijn teruggebracht tot Bizum en bankoverschrijving. WhatsApp-klantenservice, Bizum-nummer en bankgegevens zijn centraal gescheiden in `config/business.ts`.
- Europ Foods PDF parsing gebruikt nu een server-side externe `pdf-parse` package en compacte JSON-responses, zodat zware PDF-dry-runs geen lege/non-JSON response meer veroorzaken.
- Import-API-fouten geven altijd geldige JSON terug met `errorCode`, `message` en `diagnosticId`.
- Publieke productqueries tonen alleen nog `active` + `is_visible=true`; archived, disabled en draftproducten verdwijnen uit homepage, categorieën, productlijsten, productdetail en cart/order-validatie.
- Product-DELETE in admin archiveert voortaan veilig in plaats van een database-delete uit te voeren.
- Nieuwe productimport via de admin/API mag een archived productcode niet stil heractiveren of wijzigen; herstel moet bewust via restore.
- Oude en nieuwe catalogusbatches kunnen naast elkaar bestaan: Nancy-productcode blijft uniek, terwijl supplier code en EAN niet uniek zijn en alleen als duplicaatsignalen worden gebruikt.
- Nieuwe facturen gebruiken voortaan een expliciete serie: in `prelaunch` standaard `TEST-{jaar}-{zes cijfers}` en in `live` standaard `NC-{jaar}-{zes cijfers}`. Bestaande facturen behouden hun historische label.
- Transactionele order-, status- en factuurmails hebben een professionelere responsive HTML-opmaak gekregen met logo, nette header, product-/ordertabel, betaalinformatie, contactknoppen, WhatsApp-link, website, Facebook en footer.
- Resend-verzending gebruikt nu afzendernaam `Nancy's Castalla`, een Reply-To naar `info@nancys.es` voor klantmails en de klant als Reply-To voor adminordermeldingen.
- Transactionele e-mails behouden een plain-text fallback en krijgen een stabiele `X-Entity-Ref-ID`; `List-Unsubscribe` is voorbereid maar niet standaard actief voor noodzakelijke order- en factuurmails.
- Productzoekvelden zijn verduidelijkt en zoeken nu ook op zichtbare locale-productomschrijving en vertaalde categorienamen, naast productnaam, interne categorie, code en leveranciercode.
- Productkaarten tonen de gekozen verkoopeenheid/verpakking prominenter als eigen `Sold as`/`Verkocht als`-regel, zodat aantallen zoals `4 stuks`, `40 x 85 g`, `1 kg` en `500 ml` direct zichtbaar zijn.
- Productdetailpagina's labelen de verkoopeenheid nu als `Sold as`/`Verkocht als` in plaats van als algemene eenheid.
- De winkelmand toont gekozen verpakkingen als duidelijke labels per orderregel.
- Het checkoutformulier toont bij afhalen alleen naam, e-mail, telefoon en gewenste afhaaltijd/opmerking; het bezorgadres verschijnt alleen bij lokale bezorging.
- Klantorderdetails tonen verpakkingen, productcode, aantal en btw als losse badges, waardoor eerdere bestellingen beter scanbaar zijn.
- `POST /api/orders` logt nu de volledige veilige orderflow met diagnose-id: ontvangst, authcheck, cartvalidatie, totaalberekening, RPC-poging, eventuele fallback, orderopslag en e-mailstap.
- Orderfouten sturen nu een `message` en `diagnosticId` terug naar de browser, zodat testers en beheer exactere feedback zien dan alleen `The order could not be sent`.
- Orderopslag heeft een service-role REST-fallback wanneer de Supabase RPC `create_validated_order` faalt door schema-cache, ontbrekende functie, permissie of `payment_method`-mismatch; customer, order en orderregels worden dan alsnog opgeslagen.
- De checkout toont backendfoutmeldingen rechtstreeks aan de klant/tester in plaats van relevante serverdetails weg te filteren.
- Registratie toont na succesvolle aanmaak nu een duidelijke bevestigingsmelding met spammap-instructie in `en`, `nl`, `de`, `es` en `sv`.
- Het registratieformulier wist naam, e-mail en wachtwoorden na succesvolle aanmaak, zodat gevoelige gegevens niet zichtbaar blijven.
- Klanten kunnen na registratie de bevestigingsmail opnieuw aanvragen met een zichtbare 60-seconden wachttijd en duidelijke rate-limitmelding.
- Het accountdashboard valt terug op de actieve Supabase-sessie wanneer het customerprofiel of de orderhistorie tijdelijk niet geladen kan worden, zodat naam, e-mail, telefoon, adres en taal altijd zichtbaar of invulbaar blijven.
- Nederlandse productkaarten en productdetails tonen voor bekende producten Nederlandse teksten; onbekende niet-vertaalde leveranciersbeschrijvingen vallen terug op `Vertaling volgt binnenkort` in plaats van willekeurig Engels of Spaans.
- Productbeschrijvingen hebben nu locale-fallbacks voor `en`, `nl`, `de`, `es` en `sv`, inclusief categoriegerichte fallbackteksten.
- Het Nederlandse preorderlabel is klantvriendelijker gemaakt als `Voorbestelling`.
- Mobiele productkaarten hebben extra overflowbescherming om brede categorie- of productlabels binnen de kaart te houden.
- `POST /api/orders` slaat orders op voordat e-mail wordt geprobeerd; een Resend- of netwerkfout kan de ordercreatie niet meer terugdraaien of blokkeren.
- Ordercreatie is backwards-compatible gemaakt met Supabase-omgevingen waar de `payment_method`-RPC-parameter nog niet beschikbaar is of de schema-cache achterloopt.
- Checkout toont duidelijkere foutmeldingen voor ontbrekende velden, tijdelijke serviceproblemen, verouderde verpakkingen, niet-beschikbare producten en voorraadproblemen.
- Local delivery vraagt client-side expliciet om een bezorgadres voordat de order wordt verstuurd.
- Registratie gebruikt nu de centrale serverroute `POST /api/auth/register`, zodat de Supabase-bevestigingsmail altijd met de productiebase-URL uit `NEXT_PUBLIC_SITE_URL` en de gekozen locale wordt aangevraagd.
- Signup-fouten van Supabase Auth geven nu een stabiele foutcode terug aan het formulier, zodat rate limits en SMTP/Auth-problemen voorspelbaarder worden afgehandeld.
- Order-, status- en factuurmails gebruiken nu branded responsive HTML met logo, groene huisstijl, duidelijke koppen en vaste contactfooter.
- Nieuwe orderbevestiging gebruikt warmere tekst en toont orderregels, ordernummer, totaal, fulfilment en betaalmethode.
- Order- en factuurmail gebruiken afzendernaam `Nancy's Castalla Orders` in plaats van een generieke mailboxnaam.
- Klantaccount toont klantvriendelijke orderstatussen zoals bestelling ontvangen, beschikbaarheid gecontroleerd, wacht op betaling, klaar om af te halen en onderweg.
- Factuur-PDF heeft meer witruimte, prominenter logo, duidelijker factuurnummer, beter totalenblok en netter IVA-overzicht.
- Adminorders worden server-side samen met `order_items` opgehaald en in een gebundelde query met gekoppelde klantprofielen verrijkt.
- Status- en betaalstatuswijzigingen behouden de reeds geladen klant- en orderregelgegevens in de beheerinterface.
- Afleveradressen van oudere orders worden waar nodig uit de gelokaliseerde adresregel in de bestelnotitie gelezen.
- Resend kan een factuur als PDF-bijlage versturen; een verzendfout laat de opgeslagen factuur intact.
- Resend-netwerk- en API-fouten worden server-side gelogd en als beheerfout teruggegeven zonder bedrijfsdata terug te draaien.
- De orderbevestiging zegt expliciet dat beschikbaarheid eerst wordt gecontroleerd en betaalinstructies daarna via WhatsApp of e-mail volgen.
- Factuurmail gebruikt een duidelijk Spaans/Engels onderwerp en begeleidende tekst met PDF-bijlage.
- Factuurmail-idempotency is geversioneerd voor de nieuwe tweetalige template, zodat Resend geen gewijzigde body onder een oude sleutel weigert.
- Admin waarschuwt wanneer fiscale naam of NIF/NIE van de verkoper nog ontbreekt.
- Fiscale factuurconfiguratie ingesteld met handelsnaam `NANCY'S CASTALLA`, titular `JIMMY BERGSMA` en NIF/NIE `Y8875740P`; titular tevens toegevoegd aan Terms.
- Publieke productkaarten en productdetailpagina's tonen bekende productnamen in de actieve taal en blijven voor onbekende producten veilig terugvallen op de catalogusnaam.

### Opgelost

- Productdetailpagina's tonen in de add-to-cart sectie niet langer opnieuw dezelfde productfoto; dit voorkomt dat Android/Chrome bij producten zoals Potato Scones meerdere afbeeldingen gestapeld of overlappend lijkt te tonen.

## [0.10.0] - 2026-07-06

### Toegevoegd

- Persistente winkelmand via `CartProvider`, met lokale opslag en aantallenbadge in de header.
- Nieuwe route `/{locale}/cart` met aantallen wijzigen, verwijderen, subtotalen, btw, totaal en checkout.
- `POST /api/cart/validate` voor actuele server-side product-, prijs-, verpakking- en voorraadcontrole.
- Gedeelde productbeschikbaarheidsregel voor browser en server.
- Meertalige winkelmand-, checkout- en juridische woordenboeken voor `en`, `nl`, `de`, `es` en `sv`.
- Migratie `202607060001_preorder_inventory_rules.sql` voor correcte voorraadafhandeling bij pre-orders.

### Gewijzigd

- Het inline bestelformulier onder productlijsten is vervangen door normale toevoegen-aan-winkelmand-UX.
- Productkaarten bewaren hun beeldverhouding en tonen een lokale beschikbaarheidsmelding bij de bestelknop.
- Checkout vult klantprofielgegevens vooraf in en verstuurt alleen productcodes, verpakking en aantallen.
- Order-API retourneert stabiele foutcodes in plaats van Engelstalige servertekst aan klanten.

### Opgelost

- Pre-orders met voorraad nul worden niet langer door client- of servervalidatie geblokkeerd.
- Coming-soon-producten kunnen niet worden toegevoegd of besteld.
- Beschikbare voorraadgevolgde producten worden op gevraagde verkoopeenheden gecontroleerd.
- Juridische pagina's en resterende bezorgtekst zijn niet langer hardcoded Engels.
- Mobiele cart en productoverzichten veroorzaken geen horizontale paginascroll.

### Opgelost

- De accounttaal stuurt nu de locale-route, navigatie en kerninterface van ingelogde klanten.
- Routes zonder locale detecteren cookie, browsertaal en optionele landcode in plaats van altijd naar Engels te sturen.
- Nederlandse, Duitse, Spaanse en Scandinavische bezoekers krijgen de juiste locale-fallback zonder redirectlus.
- Hardcoded Engelse teksten rond homepageproducten, categorieën, productbediening, orderpaneel, registratie en account zijn naar centrale woordenboeken verplaatst.
- De desktopcategoriepagina blijft binnen de viewport wanneer veel categoriefilters zichtbaar zijn.
- De header vervangt registreren/inloggen door de accountlink zodra een Supabase-klantsessie actief is.
- Spaanse klanttelefoonnummers worden in het bestelformulier leesbaar als `+34`-nummer weergegeven.

### Toegevoegd

- `src/proxy.ts` voor Next.js 16 localedetectie en voorkeurscookies.
- Profiel-, cookie- en localStorage-synchronisatie voor klanttaal.
- Gecentraliseerde UI-vertalingen voor categorieën, productkaarten, orderaanvraag, footer en WhatsApp-bericht.
- Database-migratie die de registratielocale bij nieuwe customers opslaat.
- `AI_CONTEXT.md` in de repositoryroot met compacte projectcontext, beschermde onderdelen, risico's en vaste regels voor toekomstige AI-assistenten.
- Professionele documentatiestructuur onder `/docs`.
- Actueel technisch overdrachtsrapport.
- Business log met motivatie achter bedrijfskeuzes.
- Levende roadmap.
- Chronologisch technisch beslislog.
- Semantisch changelog.

### Gewijzigd

- Het databaseformulier heet voortaan “order request” in plaats van “WhatsApp order”; WhatsApp blijft als afzonderlijke support-CTA beschikbaar.
- README vervangen door een actuele projectingang met documentatielinks, stack, routes, kwaliteitscontrole en deploymentaandachtspunten.

## [0.9.0] - 2026-07-05

### Toegevoegd

- Klantregistratie, login, logout, wachtwoordherstel en accountdashboard via Supabase Auth.
- Koppeling tussen Supabase Auth-users en `customers`.
- Klantprofiel met naam, e-mail, telefoon, adres en taal.
- Orderhistorie in het klantaccount.
- Automatisch vooraf invullen van klantgegevens in het bestelformulier.
- Branded bevestigings- en hersteltemplates voor accountmail.
- Resend SMTP voor accountmail vanaf `account@nancys.es`.
- Resend ordermail vanaf `orders@nancys.es`.
- Server-gevalideerde, idempotente ordercreatie.
- Oplopend ordernummer, UUID en klantkoppeling.
- Server-side berekening van subtotalen, btw en totaal.
- Transactionele voorraadmutatie bij bevestiging en annulering.
- E-mailtracking en statusmail voor belangrijke orderstatussen.

### Gewijzigd

- Zakelijk WhatsApp-nummer ingesteld op `+34 644 05 97 69`.
- Auth-redirects geschikt gemaakt voor `https://www.nancys.es` in plaats van een vaste localhostredirect.
- Admincredentialvergelijking en sessieafhandeling aangescherpt.

### Opgelost

- Accountbevestigingslinks die op mobiele apparaten naar localhost terugkeerden.
- Generieke Supabase-uitstraling van accountmails door eigen afzender en templates.
- Risico op dubbele orders bij opnieuw proberen.
- Risico dat browserprijzen als bron van waarheid werden gebruikt.
- Dubbele voorraadafboeking bij herhaalde statuswijziging.

### Beveiliging

- Klant-API's verifiëren Supabase bearer-tokens server-side.
- Orderregels worden tegen actuele Supabase-productdata gevalideerd.
- Adminsessie gebruikt een HttpOnly, SameSite en production-secure cookie.

## [0.8.0] - 2026-07-02

### Toegevoegd

- Modulaire backoffice met dashboard, producten, categorieën, klanten, orders, voorraad, leveranciers, inkoop, facturatie, btw, rapportages, instellingen en integraties.
- Tabellen voor customers, suppliers, inventory movements, purchase orders, invoices en integration settings.
- Voorraadvelden, minimumvoorraad, gewicht, SKU, EAN, afbeeldingen, featured en nieuw.
- Voorbereide integratiearchitectuur voor POS, SumUp, kaartterminals, boekhouding, verzending, WhatsApp Business en eigen API.
- Privacy- en voorwaardenpagina's.
- Robots- en sitemapbasis.

### Verbeterd

- Homepage-productafbeeldingen begrensd voor mobiel zonder productdetailafbeeldingen te wijzigen.
- Responsive gedrag en horizontale overflowbescherming.

## [0.7.0] - 2026-06-28

### Toegevoegd

- Meerdere categorieën per product.
- Categorieën voor Duits, Scandinavisch, Aziatisch/Indonesisch en vegan/vegetarisch.
- Filteren van online en verborgen producten in productbeheer.
- Verwijderactie in productoverzicht.
- Voorraad- en verpakkingsweergave voor stuk- en doosverkoop.

### Gewijzigd

- Verkoopprijs kan handmatig worden bepaald zonder verplichte 50%-margeregel.
- Leveranciersverpakking en klanteenheid duidelijker gescheiden.

### Opgelost

- Verpakkingslabels die alleen het gewicht per stuk toonden terwijl de prijs voor een hele doos gold.
- Producten die door een enkele categorie moeilijk vindbaar waren.

## [0.6.0] - 2026-06-26

### Toegevoegd

- Grote SQL-imports voor Europfood, De Hollandse Bakker, Malpica en Tindale Retail.
- Paginering/gefaseerd laden voorbij de Supabase-limiet van 1.000 producten.
- Zoekbaar adminproductoverzicht geschikt voor grote catalogi.
- Productzichtbaarheid en uitgebreide productdetails.
- Ingrediënten, gebruiksaanwijzing, bewaring en aanvullende informatie.

### Gewijzigd

- Geimporteerde producten staan standaard verborgen totdat ze zijn gecontroleerd.
- Publieke productteksten tonen geen interne leveranciersinformatie.

## [0.5.0] - 2026-06-25

### Toegevoegd

- Productafbeeldingen via URL en upload vanuit lokale bestanden.
- Supabase Storage-integratie voor productfoto's.
- Klikbare productkaarten en productdetailpagina's op productcode.
- Zoekbalk en klikbare categorieën.
- Klantverpakkingsopties met meerdere regels.
- Sociale deelmogelijkheid voor producten.

### Opgelost

- Productfoto's die na upload niet in de catalogus verschenen.
- Productupdates die de beheerder naar een leeg formulier stuurden.
- Onbruikbaar lang productoverzicht bij grote aantallen.

## [0.4.0] - 2026-06-24

### Toegevoegd

- Supabase databasefundament voor products, orders en order items.
- Adminproductbeheer met handmatige productcodes en leverancierscodes.
- Eerste orderopslag en e-mailvoorbereiding.
- Betaalmethoden Bizum, bankoverschrijving en contant.

### Gewijzigd

- Productdata verschoven van uitsluitend lokale data naar Supabase als primaire bron.

## [0.3.0] - 2026-06-23

### Toegevoegd

- Next.js App Router-project met TypeScript en Tailwind CSS.
- Nancy's Castalla-logo en merkstijl in donkergroen, creme, koffie- en broodkleuren.
- Homepage, producten, brood, afhalen/bezorgen, over en contact.
- Engels, Nederlands, Duits, Spaans en Zweeds/Scandinavische locale.
- WhatsApp-bestelcomponent en CTA.
- Lokale productdataset met prijs-, btw-, marge- en leveranciersvelden.
- Centrale bedrijfsconfiguratie.
- Vercel- en GitHub-ready projectstructuur.

### Gewijzigd

- Development en build gebruiken Webpack vanwege Turbopack chunk-/workerinstabiliteit tijdens ontwikkeling.

## Onderhoudsregel

Iedere belangrijke code-, database-, configuratie- of gebruikerswijziging krijgt eerst een item onder `[Unreleased]`. Bij een release worden de items onder een nieuwe semantische versie en datum geplaatst. Pure interne tekstcorrecties hoeven alleen te worden vermeld wanneer ze klantgedrag, juridische betekenis of operationele instructies veranderen.
