# Changelog: Nancy's Castalla

Alle belangrijke wijzigingen aan dit project worden in dit bestand vastgelegd. De structuur volgt [Semantic Versioning](https://semver.org/) zolang het project pre-1.0 is:

- `PATCH`: fixes, documentatie en kleine compatibele verbeteringen.
- `MINOR`: nieuwe compatibele functionaliteit.
- `MAJOR`: vanaf 1.0, incompatibele productiewijzigingen.

Categorieën: **Toegevoegd**, **Gewijzigd**, **Verbeterd**, **Opgelost**, **Beveiliging** en **Verwijderd**.

## [Unreleased]

### Toegevoegd

- Volledige responsieve admin-orderdetailweergave met klantgegevens, ordermetadata, orderregels, btw-totalen en directe contactacties.
- Aanklikbaar orderoverzicht en een duidelijke waarschuwing voor historische orders zonder orderregels.

### Verbeterd

- Adminorders worden server-side samen met `order_items` opgehaald en in een gebundelde query met gekoppelde klantprofielen verrijkt.
- Status- en betaalstatuswijzigingen behouden de reeds geladen klant- en orderregelgegevens in de beheerinterface.
- Afleveradressen van oudere orders worden waar nodig uit de gelokaliseerde adresregel in de bestelnotitie gelezen.

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
