# AI Context: Nancy's Castalla

**Doel:** snelle, zelfstandige projectcontext voor ChatGPT, Codex en andere AI-assistenten.  
**Laatst bijgewerkt:** 5 juli 2026  
**Productie:** `https://www.nancys.es`

Lees dit bestand voordat je een wijziging plant of uitvoert. Gebruik voor diepere details de documenten in `/docs`:

- `docs/TECHNICAL_HANDOVER.md`: actuele technische toestand.
- `docs/BUSINESS_LOG.md`: zakelijke keuzes en motivatie.
- `docs/ROADMAP.md`: actuele prioriteiten.
- `docs/DECISIONS.md`: chronologische technische beslissingen.
- `docs/CHANGELOG.md`: wijzigingsgeschiedenis.

Dit bestand bevat bewust geen wachtwoorden, API-keys, service-role keys of andere geheimen.

## 1. Projectvisie

Nancy's Castalla is een meertalige internationale food-market en pre-orderwebshop in Castalla, Spanje. Het bedrijf start kleinschalig met beperkte voorraad, voorbestellingen, afhalen en lokale bezorging. Persoonlijke service via WhatsApp is een belangrijk onderdeel.

De software bestaat uit:

- Een publieke productcatalogus en bestelflow.
- Klantregistratie, login, profiel en orderhistorie.
- Een beveiligde admin/backoffice.
- Product-, prijs-, order- en voorraadbeheer.
- Voorbereidingen voor inkoop, facturatie, betalingen en externe integraties.

De huidige fase is een productie-MVP/pre-orderfase. De website is live, maar niet alle voorbereide backofficemodules zijn al volledig operationeel.

## 2. Doelgroep

De primaire doelgroep bestaat uit internationale inwoners en expats rond Castalla:

- Brits en Iers.
- Nederlands.
- Duits.
- Scandinavisch.
- Spaans en Zuid-Amerikaans.
- Aziatisch/Indonesisch geinteresseerde klanten.

Engels is de hoofdtaal. Ondersteunde localecodes zijn `en`, `nl`, `de`, `es` en `sv`. Spaans is essentieel voor Spaanse en Zuid-Amerikaanse klanten. Vertalingen zijn nog niet overal volledig.

## 3. Huidige technische stack

| Onderdeel | Technologie |
|---|---|
| Framework | Next.js 16.2.9, App Router |
| UI | React 19.0.0 |
| Taal | TypeScript 5.7.2 |
| Styling | Tailwind CSS 3.4.17 |
| Database | Supabase PostgreSQL |
| Klantauth | Supabase Auth |
| Bestandsopslag | Supabase Storage |
| Hosting | Vercel |
| E-mail | Resend API en Resend SMTP via Supabase Auth |
| Iconen | Lucide React |
| Betaling | Handmatig; providerarchitectuur voorbereid |

Development en productiebuild gebruiken Webpack:

```text
npm run dev
npm run lint
npm run build
```

Databasewijzigingen staan in `supabase/migrations`. Deze migraties zijn leidend. Leveranciersimports staan in `supabase/imports`.

## 4. Belangrijkste routes

Alle publieke hoofdroutes hebben een locale-prefix.

| Route | Functie |
|---|---|
| `/{locale}` | Homepage |
| `/{locale}/products` | Categorieoverzicht |
| `/{locale}/products/category/{categorySlug}` | Producten per categorie |
| `/{locale}/products/{productId}` | Productdetail op Nancy-productcode |
| `/{locale}/bread` | Brood en pre-orders |
| `/{locale}/collection-delivery` | Afhalen en bezorgen |
| `/{locale}/about` | Over Nancy's Castalla |
| `/{locale}/contact` | Contactinformatie |
| `/{locale}/register` | Klantregistratie |
| `/{locale}/login` | Klantlogin |
| `/{locale}/forgot-password` | Wachtwoordherstel |
| `/{locale}/account` | Klantprofiel en orderhistorie |
| `/{locale}/privacy` | Privacy |
| `/{locale}/terms` | Voorwaarden |
| `/{locale}/admin/login` | Verborgen adminlogin |
| `/{locale}/admin` | Backoffice |
| `/{locale}/admin/products` | Productbeheer |

Belangrijke API's:

- `POST /api/orders`
- `GET/PATCH /api/account/profile`
- `GET /api/account/orders`
- `/api/admin/products`
- `/api/admin/orders`
- `/api/admin/inventory`
- `POST /api/admin/upload-product-image`
- `POST /api/admin/login`
- `POST /api/admin/logout`

## 5. Database-hoofdtabellen

| Tabel | Doel |
|---|---|
| `products` | Catalogus, prijzen, btw, verpakking, voorraad en productinhoud |
| `customers` | Klantprofielen gekoppeld aan Supabase Auth |
| `orders` | Orderkop, klant, status, betaling en totalen |
| `order_items` | Product-, verpakking-, btw- en prijssnapshot per orderregel |
| `inventory_movements` | Audittrail van voorraadmutaties |
| `suppliers` | Leveranciersstamgegevens |
| `purchase_orders` | Voorbereiding voor inkooporders |
| `invoices` | Voorbereiding voor facturen |
| `integration_settings` | Niet-geheime providerinstellingen |

Row Level Security staat aan. De applicatie gebruikt server-side service-role toegang voor bedrijfsdata. Plaats de service-role key nooit in browsercode of documentatie.

Productcodes volgen `NC-00001`, `NC-00002`, enzovoort. Productdetail-URL's gebruiken deze stabiele code.

## 6. Orderflow

Er zijn twee orderkanalen:

### Database-order

1. Klant kiest producten, klantverpakking en aantallen.
2. Een ingelogde klant krijgt profielgegevens vooraf ingevuld.
3. Browser stuurt productcodes en keuzes naar `POST /api/orders`.
4. Server vertrouwt geen browserprijzen of totalen.
5. Server haalt actuele producten, prijzen, btw, verpakking en voorraad uit Supabase.
6. Server berekent subtotalen, btw en totaal opnieuw.
7. Een idempotency key voorkomt dubbele orders bij retries.
8. Order en orderregels worden via een database-RPC opgeslagen.
9. Order krijgt UUID en oplopend ordernummer.
10. Resend verstuurt admin- en klantmail als e-mailconfiguratie werkt.
11. Nieuwe order start als `new` met betaalstatus `pending`.

### WhatsApp-order

De CTA opent een samengesteld bericht naar het zakelijke WhatsApp-nummer uit `config/business.ts`. Een WhatsApp-bericht wordt niet automatisch als databaseorder opgeslagen. Maak nooit de aanname dat beide kanalen hetzelfde zijn.

## 7. Voorraadflow

- `track_inventory` bepaalt of voorraad wordt gecontroleerd.
- `stock_quantity` is de actuele hoeveelheid.
- `minimum_stock` bepaalt de lagevoorraadwaarschuwing.
- Een `new` order reserveert momenteel geen voorraad.
- Bij status `confirmed` lockt een PostgreSQL-RPC order en producten, controleert voorraad en boekt atomisch af.
- `inventory_committed` voorkomt dubbel afboeken.
- Bij `cancelled` wordt eerder afgeboekte voorraad teruggezet.
- Iedere mutatie hoort een `inventory_movements`-record te krijgen.

Belangrijk risico: meerdere open orders kunnen dezelfde laatste voorraad aanvragen. De tweede order kan pas bij bevestiging worden afgewezen. Voorraadreservering staat op de roadmap.

## 8. Admin/backoffice

Adminauth staat los van klantauth. De login gebruikt server-side `ADMIN_EMAIL` en `ADMIN_PASSWORD` en zet een HttpOnly-cookie. Voeg nooit hardcoded credentials toe. Admin is niet zichtbaar in het publieke menu.

Beschikbare modules:

- Dashboard.
- Producten.
- Categorieën.
- Klanten.
- Orders.
- Voorraad.
- Leveranciers.
- Inkoop.
- Facturatie.
- BTW.
- Rapportages.
- Instellingen.
- API-integraties.

Producten, orders en voorraad zijn de meest functionele onderdelen. Klanten en leveranciers zijn grotendeels overzicht/read-only. Inkoop, facturatie, rapportages en integraties zijn voorbereid maar niet volledig operationeel.

Productbeheer ondersteunt onder meer:

- Automatische Nancy-productcode.
- Toevoegen, wijzigen en verwijderen.
- Zoeken, filteren en grote catalogi.
- Meerdere categorieën.
- Kostprijs, btw, verkoopprijs en margeweergave.
- Leveranciers- en klantverpakkingen.
- Voorraadtracking.
- Online/verborgen, featured en nieuw.
- Afbeeldingsupload naar Supabase Storage.
- Ingrediënten, instructies, bewaring en extra informatie.

## 9. Betaalmethodes

Actief in V1:

- Bizum.
- Bankoverschrijving.
- Contant bij afhalen.
- Contant bij bezorgen.

Niet actief:

- Stripe-checkout.
- Online kaartbetaling.
- SumUp-integratie.

Betaling wordt na handmatige orderbevestiging afgesproken. Stripe is niet geinstalleerd; alleen een providerstructuur is voorbereid. Controleer vóór productiegebruik het Bizum-nummer en de bankrekening in de bedrijfsconfiguratie.

## 10. Bezorgbeleid

Huidige configuratie:

- Afhalen in Castalla, Calle Murcia 111.
- Bezorgminimum EUR 25.
- Indicatieve radius circa 15 km.
- Bezorgkosten vanaf EUR 3,50.
- Levering alleen wanneer operationeel mogelijk.
- Brood via pre-order wanneer voldoende vraag bestaat.

Deze regels worden momenteel vooral getoond en nog niet volledig server-side afgedwongen. De bezorgfee wordt niet gegarandeerd in het ordertotaal verwerkt. Gratis bezorging is geen vastgelegde actieve regel. Wijzig bezorgbeleid pas nadat de zakelijke keuze in `docs/BUSINESS_LOG.md` is vastgelegd.

## 11. Designregels

Merkstijl:

- Donkergroen: `#0d2f22`.
- Creme: `#f7efd9`.
- Linnen: `#fbf7ed`.
- Koffiebruin: `#8a4d25`.
- Messing/goud: `#b88a3d`.
- Warme broodkleuren als accent.
- Klassiek, premium en internationaal food-marketgevoel.

Praktische regels:

- Mobiel is leidend.
- Geen horizontale paginascroll.
- Categoriefilters mogen de pagina nooit verbreden; op desktop breken ze binnen de productkolom om en op kleine schermen scrollen ze alleen binnen hun eigen rij.
- Productfoto's gebruiken stabiele verhoudingen en mogen layout niet laten verspringen.
- Productdetailafbeeldingen werken goed en mogen niet zonder aantoonbare noodzaak worden gewijzigd.
- Mobiel menu werkt en mag niet onnodig worden herbouwd.
- Gebruik bestaande Tailwindtokens en Lucide-iconen.
- Geen vlaggen als dominant ontwerpmiddel.
- Geen overdadige marketinghero's, decoratieve kaarten in kaarten of willekeurige gradients.
- Lange vertalingen en productnamen moeten passen zonder overlap.
- Leveranciersnamen, inkoopprijzen en interne codes zijn niet voor publieke weergave.

## 12. Niet zomaar wijzigen

Wijzig de volgende onderdelen alleen na broncodeanalyse, impactcontrole en passende tests:

1. Mobiele productdetail-layout en beeldverhouding.
2. Werkend mobiel menu en headergedrag.
3. Productcodeformaat en productdetailroutes.
4. Server-side prijs-, btw- en verpakkingsvalidatie.
5. Order-idempotentie.
6. Transactionele voorraad-RPC en `inventory_committed`.
7. Koppeling tussen Supabase Auth en `customers`.
8. Admincookie- en credentialcontrole.
9. RLS of service-role grenzen.
10. Centrale bedrijfsconfiguratie en zakelijke WhatsApp-CTA.
11. E-mailafzenders en auth-redirects.
12. Databasekolommen zonder nieuwe migratie.
13. Publieke productzichtbaarheid van geimporteerde catalogi.

Verwijder geen bestaande functionaliteit, migratie of data-import omdat deze verouderd lijkt zonder eerst gebruik, productiegegevens en documentatie te controleren.

## 13. Bekende risico's

- Externe Vercel-, Supabase-, Resend- en DNS-configuratie is niet volledig vanuit Git te bewijzen.
- Geen applicatiebrede rate limiting of botbescherming.
- Admin gebruikt nog één gedeeld account zonder MFA/RBAC.
- Geen geautomatiseerde testset, CI of visuele regressietests.
- Open orders reserveren geen voorraad.
- Bezorgminimum, fee en radius zijn niet server-authoritatief.
- Sommige productqueries laden te veel of de volledige catalogus.
- Lokale productfallback kan een Supabase-storing maskeren.
- Account/order e-mails hebben geen volwaardige queue en retryflow.
- Vertalingen, juridische content en Scandinavische dekking zijn onvolledig.
- Geen volledige product-/categoriesitemap of structured data.
- Inkoop, facturatie en rapportages zijn nog gedeeltelijk.
- Klantadres is nog geen apart onveranderlijk ordersnapshot.
- Bizum en bankgegevens moeten zakelijk worden bevestigd.
- Eerder gedeelde secrets moeten buiten Git worden geroteerd; neem ze nooit over in output.

## 14. Roadmap

Actuele prioriteit:

1. Productieconfiguratie en kernflows end-to-end controleren.
2. Klantprofiel en orderhistorie verder afmaken.
3. Rate limiting, botbescherming, individuele admins en auditlogging.
4. Strikte orderstatussen en voorraadreservering.
5. Server-side bezorging en adressnapshots.
6. Directe/gepagineerde productqueries en afbeeldingsoptimalisatie.
7. Inkoopontvangst en volledig voorraadbeheer.
8. Facturatie, boekhouding en kaartbetaling.
9. Volledige vertalingen, SEO en compliance.
10. POS, WhatsApp Business en overige integraties.

Gebruik `docs/ROADMAP.md` als gezaghebbende levende roadmap. Verplaats gereed werk naar `docs/CHANGELOG.md`.

## 15. Regels voor toekomstige AI-assistenten

### Voor iedere wijziging

1. Lees `AI_CONTEXT.md`.
2. Lees de relevante documenten in `/docs`.
3. Inspecteer de daadwerkelijke broncode; vertrouw documentatie niet blind als code anders blijkt.
4. Controleer Git-status en respecteer bestaande gebruikerswijzigingen.
5. Analyseer impact op mobiel, database, auth, orders, voorraad, e-mail en deployment.
6. Leg bij grote of riskante wijzigingen eerst kort uit welke bestanden veranderen en waarom.

### Tijdens implementatie

1. Volg bestaande patronen en houd wijzigingen klein en gericht.
2. Vertrouw nooit prijzen, totalen, voorraad of autorisatie uit de browser.
3. Houd secrets uitsluitend in environmentvariabelen.
4. Maak databasewijzigingen via een nieuwe, voorwaartse Supabase-migratie.
5. Maak externe integraties providerneutraal en hardcode geen providerlogica in UI-componenten.
6. Bescherm bestaande mobiele layout en productdetailweergave.
7. Verwijder of reset geen gebruikersdata zonder expliciete opdracht en controle.
8. Voeg foutafhandeling en zichtbare feedback toe voor operationele workflows.

### Documentatieplicht

Na iedere belangrijke wijziging moet worden beoordeeld welke documenten moeten worden bijgewerkt:

- `AI_CONTEXT.md` bij wijzigingen aan kernwerking, regels, risico's of roadmap.
- `docs/TECHNICAL_HANDOVER.md` voor de actuele technische toestand.
- `docs/BUSINESS_LOG.md` voor zakelijke keuzes en motivatie.
- `docs/ROADMAP.md` voor prioriteiten en voltooid werk.
- `docs/DECISIONS.md` voor belangrijke technische beslissingen.
- `docs/CHANGELOG.md` voor iedere belangrijke wijziging.
- `README.md` alleen wanneer onboarding, commando's of documentatienavigatie wijzigen.

Documentatie mag nooit een geplande functie als werkend presenteren. Het technisch handoverdocument bevat de huidige toestand, geen geschiedenis.

### Afronding

1. Voer `npm run lint` uit.
2. Voer `npm run build` uit.
3. Voer relevante tests/smoke checks uit.
4. Controleer dat geen geheimen of privegegevens in Git terechtkomen.
5. Controleer en update relevante documentatie.
6. Maak een kleine, duidelijke commit wanneer de gebruiker daarom vraagt.
7. Push alleen wanneer de gebruiker dat vraagt of dit expliciet onderdeel van de opdracht is.
8. Rapporteer gewijzigde bestanden, controles, benodigde environmentvariabelen en eventuele open risico's.
