# Technisch overdrachtsrapport: Nancy's Castalla

**Documentstatus:** actuele technische situatie  
**Peildatum:** 5 juli 2026  
**Productiedomein:** `https://www.nancys.es`  
**Repository:** `jimmybergsma3-collab/NANCY-S-CASTALLA`  
**Doelgroep:** ontwikkelaars, beheerders en technische partners die het project zonder voorafgaande broncodekennis moeten kunnen overnemen.

> Dit rapport beschrijft uitsluitend de aantoonbare actuele toestand van de repository. Wijzigingsgeschiedenis staat in `CHANGELOG.md`; de motivatie achter technische beslissingen staat in `DECISIONS.md`. Instellingen die alleen in Vercel, Supabase, Resend of DNS bestaan, kunnen vanuit de broncode niet volledig worden bewezen en zijn als extern te controleren gemarkeerd. De migraties in `supabase/migrations` gelden als de gezaghebbende databasespecificatie; `supabase-schema.sql` en oudere documentatie kunnen achterlopen.

## Inhoud

1. Projectoverzicht
2. Technologie
3. Architectuur
4. Database
5. Authenticatie en autorisatie
6. Adminpanel en backoffice
7. Publieke website
8. Functionaliteitsmatrix
9. API-routes
10. E-mailsysteem
11. Bestelproces
12. Voorraadbeheer
13. Afhalen en bezorgen
14. Facturatie en betalingen
15. SEO
16. Responsive design en visuele keuzes
17. Performance
18. Security
19. Bekende problemen en technische schuld
20. Roadmap
21. Technisch advies
22. Beknopte systeemsamenvatting

---

# 1. Projectoverzicht

## 1.1 Doel

Nancy's Castalla is een meertalige webwinkel en operationele backoffice voor een kleinschalige internationale food-market in Castalla, Spanje. De eerste commerciële fase werkt met kleine voorraad, pre-orders, afhalen in Castalla, lokale bezorging wanneer mogelijk en klantcontact via WhatsApp.

Het assortiment richt zich op Nederlandse, Britse, Ierse, Duitse, Scandinavische, Aziatische/Indonesische, Zuid-Amerikaanse en overige internationale producten. Producten kunnen per stuk, per verpakking of via meerdere klantverpakkingen worden verkocht. Brood wordt hoofdzakelijk op voorbestelling aangeboden.

## 1.2 Huidige status

De applicatie is online als productie-implementatie op Vercel, maar functioneel nog in een **pre-order/MVP-fase**. De kern is aanwezig:

| Onderdeel | Status | Toelichting |
|---|---|---|
| Publieke catalogus | Werkend | Categorieën, zoeken, productkaarten en detailpagina's |
| Productbeheer | Werkend | Toevoegen, wijzigen, verwijderen, foto's uploaden en zichtbaarheid beheren |
| Klantregistratie en login | Werkend | Supabase Auth, e-mailbevestiging en wachtwoordherstel |
| Klantprofiel | Werkend, beperkt | Naam, e-mail, telefoon, adres en taal; account toont orderhistorie op hoofdniveau |
| Database-orders | Werkend | Server-side prijscontrole, idempotentie en orderopslag |
| WhatsApp-bestellen | Werkend | CTA en samengesteld bericht; dit is een apart kanaal naast database-orders |
| Voorraad | Werkend voor kernflow | Afboeken bij bevestiging, terugboeken bij annulering |
| E-mail | Werkend mits extern correct ingesteld | Resend voor orders, Supabase Custom SMTP voor accounts |
| Online betaling | Niet actief | Bizum, bankoverschrijving en contant worden handmatig afgehandeld |
| Inkoop/facturatie/rapportages | Voorbereid | Datamodel en/of read-only schermen, nog geen complete bedrijfsworkflow |

## 1.3 Productie versus development

- **Productie:** Vercel, `www.nancys.es`, Supabase als productiebackend en Resend als e-mailinfrastructuur.
- **Lokaal:** Next.js developmentserver via `npm run dev`, standaard op `http://localhost:3000`.
- **Belangrijk verschil:** lokale en Vercel-environmentvariabelen zijn onafhankelijk. Vooral adminlogin, service-role toegang, Resend en redirect-URL's moeten in beide omgevingen afzonderlijk correct staan.
- **Databaseschema:** wijzigingen worden als SQL-migraties bijgehouden, maar uitvoering in productie is een handmatige operationele stap. De repository bewijst niet dat iedere migratie daadwerkelijk in de productie-Supabase is uitgevoerd.

## 1.4 Belangrijkste openstaande onderdelen

1. Betrouwbare productiecontrole van alle Vercel-, Supabase-, Resend- en DNS-instellingen.
2. Volledige orderworkflow in de backoffice, inclusief duidelijke overgangsregels en foutafhandeling.
3. Voorraadreservering of een expliciete pre-orderstrategie om gelijktijdige overboeking te voorkomen.
4. Server-side handhaving van bezorgminimum, bezorgkosten en bezorggebied.
5. Volwaardige inkoop, facturatie, leveranciersbeheer en rapportages.
6. Juridische en inhoudelijke vertalingen voor alle talen.
7. Product- en categorie-SEO, structured data en volledige sitemap.
8. Geautomatiseerde tests, CI, monitoring, audit logging en operationele runbooks.

---

# 2. Technologie

## 2.1 Stack en versies

| Technologie | Versie/status | Functie |
|---|---:|---|
| Next.js | 16.2.9 | App Router, server rendering, routes en API-handlers |
| React | 19.0.0 | Componenten en clientinteractie |
| React DOM | 19.0.0 | Browser-rendering |
| TypeScript | 5.7.2 | Statische typen voor product-, order- en backofficemodellen |
| Tailwind CSS | 3.4.17 | Styling en responsive utilities |
| PostCSS | 8.4.49 | CSS-transformatie |
| Autoprefixer | 10.4.20 | Browserprefixes |
| Supabase JS | `^2.50.0` | Klantauthenticatie en browsersessies |
| Supabase REST/RPC | Externe dienst | Database, opslag, auth en server-side RPC's |
| Vercel | Externe dienst | Hosting, serverless runtime, domein en environmentvariabelen |
| Resend | Externe dienst | Transactionele ordermail en SMTP voor Supabase Auth |
| Lucide React | 0.468.0 | Interface-iconen |
| ESLint | 9.17.0 | Statische codecontrole |
| Stripe | Niet geinstalleerd | Alleen providerarchitectuur voorbereid; geen checkout of sleutelgebruik |

De scripts gebruiken bewust Webpack:

```text
npm run dev    -> next dev --webpack
npm run build  -> next build --webpack
npm run start  -> next start
npm run lint   -> eslint . --max-warnings=0
```

Webpack is gekozen nadat Turbopack tijdens ontwikkeling instabiele chunk- en workerfouten gaf. Dit vermindert ontwikkelproblemen zonder de functionele architectuur te veranderen.

## 2.2 Motivatie

- **Next.js App Router:** combineert publieke pagina's, dynamische metadata, servercomponenten en server-side API's in één deploybaar project.
- **TypeScript:** verlaagt het risico bij een rijk productmodel met prijzen, btw, verpakkingen, categorieën en voorraad.
- **Tailwind:** ondersteunt snelle, consistente responsive styling zonder een zware componentenbibliotheek.
- **Supabase:** levert PostgreSQL, Auth, Storage en RPC's met weinig operationeel beheer. Het project kan daardoor klein starten en later uitbreiden.
- **Vercel:** sluit direct aan op Next.js en GitHub-deployments.
- **Resend:** verzorgt zowel API-mail voor orders als SMTP voor Supabase-accountmails met eigen domeinafzenders.
- **Geen Stripe in V1:** de onderneming werkt eerst met Bizum, overschrijving en contante betaling. De betaalproviderlaag voorkomt een toekomstige herbouw.

## 2.3 Ontbrekende engineeringtools

Er is geen testframework, componentcatalogus, foutmonitoring, analyticsplatform, jobqueue, CI-workflow of database-ORM aanwezig. Database-interactie gebeurt via Supabase REST en PostgreSQL-RPC's.

---

# 3. Architectuur

## 3.1 Architectuurbeeld

```mermaid
flowchart LR
    Browser["Browser: publieke site, account, admin"]
    Next["Next.js op Vercel"]
    Auth["Supabase Auth"]
    DB["Supabase PostgreSQL"]
    Storage["Supabase Storage"]
    Resend["Resend API en SMTP"]
    WA["WhatsApp wa.me"]

    Browser --> Next
    Browser --> Auth
    Browser --> WA
    Next --> Auth
    Next --> DB
    Next --> Storage
    Next --> Resend
    Auth --> Resend
```

De publieke frontend en serverbackend staan in dezelfde Next.js-repository, maar bedrijfslogica is zo veel mogelijk verdeeld over `services`, `lib` en API-routes. Externe integraties worden via een register en providerinterfaces voorbereid.

## 3.2 Hoofdstructuur

```text
/
|-- config/
|   `-- business.ts
|-- public/
|   `-- nancys-castalla-logo.jpg
|-- src/
|   |-- app/
|   |   |-- [locale]/
|   |   |   |-- account, admin, login, register, forgot-password
|   |   |   |-- products, bread, collection-delivery
|   |   |   `-- about, contact, privacy, terms
|   |   |-- api/
|   |   |   |-- account/
|   |   |   |-- admin/
|   |   |   |-- auth/
|   |   |   `-- orders/
|   |   |-- redirects voor routes zonder taalprefix
|   |   |-- layout.tsx, globals.css, robots.ts, sitemap.ts
|   |-- components/
|   |   |-- admin/
|   |   |-- auth/
|   |   `-- publieke componenten
|   |-- data/
|   |   `-- products.ts
|   |-- i18n/
|   |   `-- config.ts
|   |-- lib/
|   |-- payments/
|   |-- services/
|   |   |-- integrations/
|   |   |-- inventory/
|   |   `-- orders/
|   `-- types/
|-- supabase/
|   |-- imports/
|   |-- migrations/
|   `-- templates/
|-- middleware.ts
|-- next.config.ts
|-- tailwind.config.ts
`-- package.json
```

## 3.3 Verantwoordelijkheden per map

| Map/bestand | Verantwoordelijkheid |
|---|---|
| `config/business.ts` | Centrale bedrijfsgegevens: naam, adres, WhatsApp, e-mails, bezorgregels, Bizum, banktekst en faseberichten |
| `public` | Statische merkassets, in het bijzonder het Nancy's Castalla-logo |
| `src/app/[locale]` | Alle meertalige pagina's met taalprefix `en`, `nl`, `de`, `es` of `sv` |
| `src/app/api` | Server-side HTTP-endpoints voor orders, accounts en beheer |
| `src/components` | Herbruikbare UI, productbestelling, header, footer, delen en prijsweergave |
| `src/components/admin` | Adminlogin, shell, orders en voorraadpanelen |
| `src/components/auth` | Login, wachtwoordherstel en accountdashboard |
| `src/data/products.ts` | Lokale fallback/startdata; niet de primaire productiecatalogus |
| `src/i18n` | Ondersteunde locales en tekstwoordenboeken |
| `src/lib` | Authhelpers, e-mail, environmentvalidatie, prijslogica, productmapping, Supabaseclients en WhatsApp |
| `src/payments` | Providercontracten en voorbereidende betaalstructuur; geen actieve Stripe-provider |
| `src/services/orders` | Server-authoritatieve ordervalidatie en berekening |
| `src/services/inventory` | Voorraadmutaties en adminvoorraaddiensten |
| `src/services/integrations` | Register van toekomstige externe koppelingen |
| `src/types` | Centrale TypeScriptmodellen voor producten en backoffice |
| `supabase/migrations` | Chronologische, gezaghebbende SQL-schemawijzigingen |
| `supabase/imports` | Grote leveranciersimports, standaard verborgen voor de publieke winkel |
| `supabase/templates` | Branded HTML voor bevestiging en wachtwoordherstel via Supabase Auth |
| `middleware.ts` | Taalroutering voor routes zonder locale |

## 3.4 Belangrijke ontwerpgrenzen

- Publieke productdata wordt server-side uit Supabase geladen.
- Klantauth werkt rechtstreeks met Supabase Auth in de browser; beveiligde account-API's verifiëren vervolgens het bearer-token server-side.
- Adminauth is bewust apart en gebruikt geen Supabase-gebruiker, maar een server-side gedeeld credential uit Vercel-environmentvariabelen.
- De browser is nooit de bron van waarheid voor orderprijzen, btw of voorraad.
- Productinhoud kan uit de database komen en bij een fout terugvallen op lokale data. Dit verhoogt beschikbaarheid, maar kan databaseproblemen maskeren.

---

# 4. Database

## 4.1 Algemeen

De database is PostgreSQL via Supabase. UUID's worden gegenereerd met `gen_random_uuid()`. Tabellen hebben Row Level Security ingeschakeld. De migraties bevatten geen publieke SELECT/INSERT-policies voor de bedrijfsdata. Daardoor is directe toegang door `anon` en gewone `authenticated` rollen standaard geblokkeerd; de Next.js-server gebruikt de service-role, die RLS mag omzeilen.

**Belangrijk:** RLS inschakelen zonder policies is in deze architectuur een bewuste default-deny. Klanttoegang loopt via gecontroleerde API-routes, niet rechtstreeks naar tabellen.

## 4.2 `products`

**Doel:** centrale catalogus, prijsadministratie, voorraad en productinhoud.

Belangrijkste kolommen:

| Groep | Kolommen |
|---|---|
| Identiteit | `id` tekstuele code, `uuid`, `sku`, optioneel `ean` |
| Presentatie | `name`, `description`, `image_url`, `images`, `is_visible`, `featured`, `is_new` |
| Indeling | `category`, `categories`, `origin`, `type`, `stock_status` |
| Verkoop | `sale_price_incl_vat`, `unit`, `package_options`, `weight` |
| Inkoop | `cost_price_ex_vat`, `vat_rate`, `supplier`, `supplier_code`, `pack_size`, `unit_cost` |
| Marge | `margin_percent`, `profit_per_unit` |
| Voorraad | `stock_quantity`, `minimum_stock`, `track_inventory` |
| Detailinformatie | `ingredients`, `directions`, `conservation`, `additional_info` |
| Audit | `created_at`, `updated_at` waar door migraties toegevoegd |

Constraints en indexes:

- `id` is de primaire sleutel en volgt in de beheerinterface het formaat `NC-00001`.
- `uuid` heeft een unieke index.
- `sku` is uniek.
- `ean` heeft een partiele index wanneer een waarde aanwezig is.
- Er is een index voor lage voorraad/tracked inventory.
- Categorie-, zichtbaarheid- en zoekvelden missen nog gerichte productie-indexen voor een zeer grote catalogus.

Relaties:

- `order_items.product_id` bewaart de productcode, maar is historisch niet als harde foreign key aangelegd.
- `inventory_movements.product_id` verwijst wel naar `products` en wordt bij verwijderen op `NULL` gezet.

RLS: ingeschakeld, geen expliciete tabelpolicies in de repository.

## 4.3 `customers`

**Doel:** bedrijfsprofiel van een klant, los van de technische Auth-identiteit.

Kolommen: `id` UUID primary key, `auth_user_id`, `name`, `email`, `phone`, `address`, `language`, `created_at`, `updated_at`.

Relaties en constraints:

- `auth_user_id` is uniek en verwijst naar `auth.users(id)` met `ON DELETE SET NULL`.
- `email` is uniek.
- Orders kunnen via `customer_id` naar deze tabel verwijzen.
- Een trigger op `auth.users` maakt of actualiseert automatisch het bijbehorende klantrecord.

RLS: ingeschakeld, geen directe self-service policies; toegang verloopt via de account-API.

## 4.4 `orders`

**Doel:** orderkop, klantgegevens, totalen, status, betaling en verzendmethode.

Belangrijkste kolommen:

- Identiteit: `id`, `uuid`, oplopend `order_number`, `idempotency_key`.
- Klant: `customer_id`, `customer_name`, `customer_email`, `customer_phone`.
- Fulfilment: `fulfillment`, `delivery_method`, `notes`.
- Financieel: `subtotal_ex_vat`, `vat_total`, `total`, `payment_status`.
- Proces: `status`, `inventory_committed`.
- E-mailtracking: tijdstempels voor admin-, klant- en statusmail.
- Audit: `created_at`, `updated_at`.

Constraints/indexes:

- `id` is primary key.
- `uuid` is uniek.
- `order_number` is een oplopende identity en uniek.
- `idempotency_key` heeft een partiele unieke index.
- Index op status en creatiedatum.
- `customer_id` verwijst naar `customers`; deze foreign key is historisch als `NOT VALID` toegevoegd en moet in productie expliciet worden gevalideerd.
- Statuswaarden zijn niet als database-`CHECK` of enum afgedwongen. RPC/API-validatie bewaakt de toegestane waarden.

RLS: ingeschakeld; server-side service-role toegang.

## 4.5 `order_items`

**Doel:** onveranderlijke orderregels met een snapshot van productnaam, verpakking en prijs.

Kolommen: identity `id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit`, `package_label`, `package_quantity`, `unit_price`, `vat_rate`, `line_total_ex_vat`, `line_total_incl_vat`.

- `order_id` verwijst naar `orders` met cascade delete.
- Productnaam en prijs worden gekopieerd, zodat oude orders leesbaar blijven wanneer een product later wijzigt.
- `product_id` is geen gegarandeerde foreign key; dit voorkomt dat catalogusopschoning historische orders blokkeert, maar vermindert referentiele controle.

RLS: ingeschakeld.

## 4.6 `suppliers`

**Doel:** leveranciersstamgegevens.

Kolommen: UUID `id`, unieke `code`, unieke `name`, contact- en adresvelden, `active`, JSON `metadata`, timestamps.

De tabel is initieel gevuld met unieke leveranciersnamen uit producten. Producten bevatten daarnaast nog steeds een tekstveld `supplier`; er is dus nog geen volledige foreign-keynormalisatie.

RLS: ingeschakeld.

## 4.7 `inventory_movements`

**Doel:** audittrail van voorraadwijzigingen.

Kolommen: UUID `id`, `product_id`, `order_id`, `movement_type`, `quantity`, `reference`, `notes`, `created_at`.

- Foreign keys naar product en order gebruiken `ON DELETE SET NULL`.
- Index op product en datum.
- Positieve en negatieve aantallen vertegenwoordigen toevoegingen en afboekingen.
- Er is geen databaseconstraint die toegestane movement types afdwingt.

RLS: ingeschakeld.

## 4.8 `purchase_orders`

**Doel:** voorbereiding voor inkooporders.

Kolommen: UUID, oplopend uniek inkoopnummer, leverancier, status, bedragen excl. btw/btw/incl. btw, verwachte en ontvangen datum, notities en timestamps.

Relatie: optionele foreign key naar `suppliers`, `ON DELETE SET NULL`.

Beperking: er is nog geen `purchase_order_items`-tabel. Daardoor is ontvangst per artikel en automatische voorraadverhoging nog niet als volledige workflow te implementeren.

RLS: ingeschakeld.

## 4.9 `invoices`

**Doel:** datamodelvoorbereiding voor verkoopfacturen.

Kolommen: UUID, oplopend uniek factuurnummer, order, klant, status, totalen excl. btw/btw/incl. btw, uitgiftedatum en creatiedatum.

Relaties: optionele foreign keys naar `orders` en `customers`, beide `ON DELETE SET NULL`.

Beperking: geen factuurregels, PDF-generatie, fiscale nummerreeksen per jaar, creditnota's of export naar boekhouding.

RLS: ingeschakeld.

## 4.10 `integration_settings`

**Doel:** voorbereidende configuratie voor externe diensten.

Kolommen: UUID, unieke providernaam, `enabled`, JSON `settings`, `updated_at`.

Geheimen horen niet in het JSON-veld maar in environmentvariabelen of een secrets manager. De tabel is bedoeld voor niet-geheime providerinstellingen.

RLS: ingeschakeld.

## 4.11 Functies en triggers

| Functie/trigger | Doel |
|---|---|
| Auth-customer trigger | Maakt of actualiseert `customers` na insert/update van een Supabase Auth-user |
| `create_validated_order` | Maakt idempotent een server-gevalideerde order en orderregels |
| `transition_order_status` | Wijzigt status/betaalstatus atomair en verwerkt voorraad bij bevestiging of annulering |
| `create_order_with_inventory` | Oudere functie; niet meer de primaire applicatieroute en kandidaat voor deprecatie |

`transition_order_status` gebruikt row locks op order en producten. Daardoor kunnen twee bevestigingen niet tegelijk dezelfde voorraad overschrijven.

## 4.12 Toekomstige database-uitbreidingen

- `addresses` als aparte tabel met meerdere klantadressen.
- `order_status_history` en `payment_status_history`.
- `email_events`/transactional outbox in plaats van enkele timestamps.
- `purchase_order_items`, ontvangstregels en batch/lotbeheer.
- `invoice_items`, creditnota's en fiscale nummerreeksen.
- Productvertalingen per locale.
- Productvarianten en genormaliseerde verpakkingsopties.
- Gerichte zoekindexen, eventueel PostgreSQL full-text search.
- Database-`CHECK` constraints voor status, btw, prijzen en voorraad.
- Gevalideerde foreign keys en expliciete RLS-policies waar directe Supabase-toegang gewenst is.

---

# 5. Authenticatie en autorisatie

## 5.1 Klantauthenticatie

Klantaccounts gebruiken Supabase Auth met e-mail en wachtwoord.

```mermaid
sequenceDiagram
    participant K as Klantbrowser
    participant S as Supabase Auth
    participant M as Resend SMTP
    participant N as Next.js API
    participant D as PostgreSQL

    K->>S: signUp(email, password, name)
    S->>M: bevestigingsmail
    M-->>K: branded accountmail
    K->>S: bevestigingslink
    S->>D: auth.users bevestigd
    D->>D: trigger upsert customers
    K->>S: signInWithPassword
    S-->>K: access token en refresh token
    K->>N: Bearer access token
    N->>S: token verifiëren via /auth/v1/user
    N->>D: profiel/orders via service-role
```

Registratie gebruikt momenteel de Supabase JS-client rechtstreeks in de browser. `emailRedirectTo` wijst naar `/{locale}/login?confirmed=1` op de actuele origin. De oude `/api/auth/register` bestaat nog als alternatieve/legacy route en verdient consolidatie.

## 5.2 Klantsessies

- Supabase bewaart de sessie standaard in browserstorage en vernieuwt tokens automatisch.
- De sessie is geen HttpOnly-cookie van Next.js.
- Accountcomponenten controleren client-side of een sessie bestaat en sturen anders naar login.
- Beveiligde API-routes vertrouwen niet alleen op de UI, maar verifiëren het bearer-token bij Supabase.
- Uitloggen roept `supabase.auth.signOut()` aan.
- Wachtwoordherstel gebruikt Supabase `resetPasswordForEmail`; een herstelsessie kan op de accountpagina een nieuw wachtwoord instellen.

## 5.3 Koppeling aan `customers`

Een database-trigger koppelt `auth.users.id` aan `customers.auth_user_id`. Bestaande Auth-users worden door de migratie teruggevuld. Het profiel bevat naam, e-mail, telefoon, adres en taal. Een ingelogde klant wordt in het bestelcomponent herkend; deze velden worden vooraf ingevuld.

## 5.4 Adminauthenticatie

Adminauth is een eenvoudige, afzonderlijke server-side login:

1. E-mail en wachtwoord worden gelezen uit `ADMIN_EMAIL` en `ADMIN_PASSWORD`.
2. E-mail wordt getrimd en lowercase vergeleken.
3. Het wachtwoord wordt met timing-safe vergelijking gecontroleerd.
4. Na succes zet de server de cookie `nancys_admin`.
5. De cookie is HttpOnly, `SameSite=Lax`, in productie `Secure`, pad `/` en maximaal zeven dagen geldig.
6. De cookiewaarde is een HMAC/SHA-256-afgeleide token, gekoppeld aan het ingestelde wachtwoord. Een gewijzigd adminwachtwoord maakt bestaande cookies ongeldig.

Adminpagina's gebruiken `requireAdmin`; admin-API's gebruiken `isAdminSession`. De adminlink hoort niet in het publieke menu te staan. De loginroute is `/{locale}/admin/login`, met `/admin/login` als taalredirect.

## 5.5 Autorisatiemodel

- Klant: toegang tot eigen profiel en eigen orderhistorie via geverifieerd Auth-token.
- Admin: volledige backoffice via één gedeeld credential.
- Publiek: alleen zichtbare producten en openbare content.
- Service-role: uitsluitend server-side voor databasehandelingen.

Er zijn nog geen adminrollen, individuele medewerkers, MFA, permissions, sessieoverzicht of auditlog. Dit gedeelde adminmodel is acceptabel voor een zeer kleine start, maar niet voor een groeiend team.

---

# 6. Adminpanel en backoffice

## 6.1 Routes en navigatie

- Login: `/{locale}/admin/login`
- Dashboard: `/{locale}/admin`
- Productbeheer: `/{locale}/admin/products`
- Prijshelper: `/{locale}/admin/pricing`
- Modules: `/{locale}/admin/{module}`

De `AdminShell` biedt modules voor Dashboard, Producten, Categorieën, Klanten, Orders, Voorraad, Leveranciers, Inkoop, Facturatie, BTW, Rapportages, Instellingen en API-integraties.

## 6.2 Productbeheer

Aanwezige functies:

- Automatisch volgend productnummer in formaat `NC-00001`.
- Product toevoegen, selecteren, wijzigen en verwijderen.
- Zoeken, filteren, statusoverzicht en paginering voor grote catalogi.
- Meerdere categorieën per product.
- SKU/leverancierscode, EAN, leverancier en herkomst.
- Kostprijs excl. btw, btw-percentage, eenheidskosten en verkoopprijs incl. btw.
- Leveranciersverpakking en klantverpakkingen op meerdere regels.
- Voorraad, minimumvoorraad en voorraadtracking.
- `available`, `preorder` en `coming-soon`.
- Actief/verborgen, featured en nieuw.
- Afbeeldings-URL of bestand uploaden naar Supabase Storage.
- Ingrediënten, gebruiksaanwijzing, bewaring en extra informatie.

De prijshelper kan btw, winst en marge tonen. De oude automatische 50%-regel is geen verplichte verkoopprijs meer; de beheerder bepaalt de verkoopprijs.

## 6.3 Orders

Het orderpaneel toont orders en maakt status- en betaalstatuswijziging mogelijk. Belangrijke statussen zijn:

- `new`
- `confirmed`
- `processing`
- `ready`
- `shipped`
- `delivered`
- `cancelled`

Bij bevestiging wordt tracked voorraad atomair afgeboekt. Bij annulering wordt eerder afgeboekte voorraad teruggezet. Fouten, zoals onvoldoende voorraad, worden aan de beheerinterface teruggegeven.

Beperking: niet alle overgangspaden zijn formeel afgedwongen. Bijvoorbeeld direct van `new` naar `delivered` kan technisch mogelijk zijn als de API-validatie dat niet blokkeert. Een expliciete state machine is aanbevolen.

## 6.4 Voorraad

- Overzicht van producten met voorraadtracking.
- Lage voorraad op basis van `minimum_stock`.
- Handmatige correcties met voorraadbeweging.
- Ordergerelateerde bewegingen.

Een handmatige correctie bestaat uit een productupdate en een movementregistratie. Als deze niet in één database-RPC/transactie gebeurt, bestaat een klein risico op afwijking bij een gedeeltelijke fout.

## 6.5 Klanten

Het klantenscherm is hoofdzakelijk read-only en toont klantgegevens uit `customers`. Volwaardige bewerking, segmentatie, GDPR-acties, adresbeheer en klantnotities ontbreken nog.

## 6.6 Leveranciers en inkoop

Leveranciers worden uit de database getoond. Inkooporders hebben een voorbereid datamodel en overzicht, maar nog geen volledige create/edit/receive-flow. Ontvangst kan nog niet per regel automatisch voorraad verhogen omdat inkoopregels ontbreken.

## 6.7 Facturatie en btw

Facturen en btw-overzichten zijn voorbereid. Het btw-scherm groepeert of telt aanwezige tarieven; er is geen volledige btw-aangifte, factuur-PDF, creditnota of boekhoudexport.

## 6.8 Rapportages

Beschikbare rapportage is beperkt tot eenvoudige tellingen en omzetaggregaties, bijvoorbeeld productaantallen, online producten, orders en betaalde omzet. Er is geen datamart, periodevergelijking, kostprijsanalyse, brutomarge per categorie of export.

## 6.9 Instellingen en integraties

Het instellingenscherm toont centrale bedrijfs-/e-mailgegevens. De feitelijke bron is deels `config/business.ts` en deels environmentvariabelen; er is nog geen veilige admineditor.

Het integratieregister noemt toekomstige providers voor POS/kassa, SumUp, kaartterminals, facturatie, boekhouding, leveranciers, verzending, WhatsApp Business, e-mail, mobiele app en eigen API. Dit is architectuurvoorbereiding, geen actieve koppeling.

---

# 7. Publieke website

## 7.1 Talen

Ondersteunde localecodes:

| Code | Bedoelde taal/doelgroep |
|---|---|
| `en` | Engels, hoofdtaal |
| `nl` | Nederlands |
| `de` | Duits |
| `es` | Spaans, belangrijk voor Spaanse en Zuid-Amerikaanse klanten |
| `sv` | Zweeds als huidige Scandinavische representatie |

De vertaaldekking is niet volledig. Sommige productcategorieën, juridische teksten, backofficeteksten en productinhoud blijven Engels. `sv` is geen volledige dekking voor alle Scandinavische talen.

## 7.2 Paginaoverzicht

| Route | Functie |
|---|---|
| `/{locale}` | Homepage met positionering, fasebericht, CTA's en uitgelichte producten |
| `/{locale}/products` | Categorieoverzicht met aantallen |
| `/{locale}/products/category/{slug}` | Zoekbare productlijst binnen een categorie en bestelmogelijkheid |
| `/{locale}/products/{productId}` | Productdetail op productcode, inhoud, verpakking, prijs, delen en bestellen |
| `/{locale}/bread` | Broodassortiment en pre-orderuitleg |
| `/{locale}/collection-delivery` | Afhalen, lokaal bezorgen, minimum en kosten |
| `/{locale}/about` | Bedrijfsconcept en achtergrond |
| `/{locale}/contact` | Adres, info-e-mail en WhatsApp |
| `/{locale}/register` | Klantregistratie |
| `/{locale}/login` | Klantlogin en bevestigingsfeedback |
| `/{locale}/forgot-password` | Wachtwoordherstel aanvragen |
| `/{locale}/account` | Profiel, wachtwoord en orderhistorie |
| `/{locale}/privacy` | Privacytekst |
| `/{locale}/terms` | Voorwaarden |

Routes zonder locale sturen door naar de Engelse variant. Er is geen aparte FAQ-route, conventionele winkelwagenpagina of betaalcheckout.

## 7.3 Homepage

De homepage toont:

- Duidelijk “Starting soon / pre-order phase”.
- Nancy's Castalla als merk en het aangeleverde logo.
- Kleine voorraad, pre-orders, WhatsApp, afhalen en lokale bezorging.
- CTA's naar producten en brood.
- Maximaal acht zichtbare producten met afbeelding; featured producten krijgen voorrang.
- Productzoeken, categoriefilters en een ordercomponent waar van toepassing.

Homepage-productfoto's zijn begrensd en gebruiken een 4:3-presentatie om de eerdere mobiele schaalproblemen te voorkomen. Productdetailafbeeldingen behouden hun eigen passende 4:3-weergave.

## 7.4 Catalogus en productdetail

Het hoofdoverzicht toont categoriekaarten in plaats van duizenden producten op één pagina. Een categoriepagina bevat zoeken op naam/productcode, filters en productkaarten. Alleen `is_visible` producten verschijnen publiek.

Een productdetailpagina gebruikt de productcode als stabiele URL-identificatie. De pagina kan tonen:

- Foto en categorieën.
- Naam, beschrijving, prijs, btw-verwerkte klantverpakking en voorraadstatus.
- Ingrediënten, bereidings-/gebruiksaanwijzing, bewaring en extra informatie als beschikbaar.
- Sociale deelknop.
- Bestelaantallen en verpakkingskeuze.

Ontbrekende leveranciersinformatie wordt niet geforceerd: secties kunnen leeg blijven. Leveranciersnamen en interne inkoopinformatie horen niet publiek zichtbaar te zijn.

## 7.5 Header en footer

De header bevat hoofdmenu, taalkeuze, register/login of accountstatus en een WhatsApp “Order support”-CTA. Het mobiele menu is compact en moet bij toekomstige wijzigingen regressievrij blijven.

De footer toont bedrijfsgegevens, bezoekadres, WhatsApp, betaalmethoden, privacy/voorwaarden en copyright met logo: `© NANCY'S CASTALLA 2026`.

## 7.6 Contact en checkout

Er is geen klassiek contactformulier. Contact loopt via `info@nancys.es`, WhatsApp en adresgegevens. Er is evenmin een betaalcheckout. De klant kan een orderrequest naar de database sturen en/of WhatsApp gebruiken; betaling wordt daarna handmatig afgesproken.

---

# 8. Functionaliteitsmatrix

## 8.1 Werkend

- Meertalige locale-routing en taalwisselaar.
- Responsive publieke navigatie.
- Productcatalogus uit Supabase, lokale fallbackdata en categoriepagina's.
- Productdetails op productcode.
- Productfoto-upload naar Supabase Storage.
- Meerdere categorieën en klantverpakkingen.
- Productzichtbaarheid, featured en nieuw.
- Klantregistratie, e-mailbevestiging, login, logout en wachtwoordreset.
- Klantprofiel en vooraf invullen van bestelgegevens.
- Server-side orderprijs-, btw-, pakket- en voorraadvalidatie.
- Idempotente ordercreatie.
- Ordernummer en UUID.
- Adminorderbeheer.
- Voorraadafboeking bij bevestiging en herstel bij annulering.
- Transactionele ordermail indien Resend correct is geconfigureerd.
- WhatsApp CTA met centraal nummer `+34 644 05 97 69`.
- Privacy, voorwaarden, robots en sitemapbasis.

## 8.2 Gedeeltelijk werkend

- **Vertalingen:** structuur aanwezig, inhoud niet overal volledig vertaald.
- **Orderhistorie:** zichtbaar, maar beperkt detail en geen herhaalbestelling/download.
- **Voorraad:** correct bij statuswijziging, maar geen reservering tijdens `new`.
- **E-mail:** geen queue/retrydashboard; externe configuratie is essentieel.
- **Inkoop:** tabellen en overzicht, geen complete regel-/ontvangstflow.
- **Facturatie:** datamodelvoorbereiding, geen operationele facturen.
- **Rapportages:** basisaggregaties, geen diepgaande analyse.
- **Settings:** vooral weergave, niet volledig beheerbaar in de backoffice.
- **SEO:** globale metadata aanwezig, productcatalogus niet volledig in sitemap/structured data.
- **Bezorging:** regels worden getoond, maar niet server-side berekend of geografisch gevalideerd.

## 8.3 Gepland/niet aanwezig

- Online kaartbetaling/Stripe/SumUp-checkout.
- POS/kassakoppeling.
- WhatsApp Business API.
- Factuur-PDF en boekhoudexport.
- Automatische leveranciersorders en goederenontvangst.
- Postcode-/afstandcontrole.
- Klantadresboek en meerdere afleveradressen.
- Productreviews, verlanglijst, kortingscodes en marketingmail.
- Volwaardige FAQ/CMS.
- Mobiele app.
- Geautomatiseerde testset, CI en observability.

---

# 9. API-routes

Alle responses zijn JSON tenzij anders aangegeven.

## 9.1 Publieke orders

### `POST /api/orders`

**Doel:** veilig een orderrequest opslaan.

**Input:** klantnaam, e-mail, telefoon, fulfilment/levermethode, notities, idempotency key en regels met product-ID, aantal en gekozen verpakking. Een bearer-token is optioneel maar koppelt de order aan de ingelogde klant.

**Servervalidatie:**

- Verplichte klant- en ordervelden.
- Geldig e-mailformaat.
- Geheel aantal binnen toegestane grens, momenteel maximaal 99 per regel.
- Product bestaat, is zichtbaar en niet `coming-soon`.
- Gekozen verpakking komt exact overeen met serverdata.
- Prijs en btw worden opnieuw uit Supabase gelezen.
- Voorraad is op het aanvraagmoment voldoende indien tracking actief is.

**Output:** order-ID, ordernummer, berekende totalen, indicatie of de order al bestond en e-mailstatus.

**Authenticatie:** publiek toegestaan; optionele klantauth.

## 9.2 Account

### `GET /api/account/profile`

Geeft het profiel van de ingelogde klant terug. Vereist `Authorization: Bearer <Supabase access token>`.

### `PATCH /api/account/profile`

Actualiseert naam, telefoon, adres en taal. E-mailwijziging blijft gekoppeld aan Supabase Auth-regels. Vereist klanttoken en valideert toegestane velden.

### `GET /api/account/orders`

Geeft orders terug die via `customer_id` aan de ingelogde Auth-user gekoppeld zijn. Vereist klanttoken. De huidige UI toont vooral orderkopinformatie.

## 9.3 Auth

### `POST /api/auth/register`

Oudere server-side registratieroute. De actuele registratiecomponent gebruikt rechtstreeks Supabase JS. Deze dubbele implementatie moet worden geconsolideerd om afwijkend gedrag te voorkomen.

## 9.4 Adminauth

### `POST /api/admin/login`

**Input:** e-mail en wachtwoord.  
**Output:** succes/fout; bij succes HttpOnly admincookie.  
**Authenticatie:** publiek endpoint met credentialcheck.  
**Open punt:** geen applicatiebrede rate limiter of lockout.

### `POST /api/admin/logout`

Verwijdert de admincookie.

## 9.5 Adminproducten

### `/api/admin/products`

Ondersteunt productcreatie/upsert, wijziging en verwijdering. Input omvat de productvelden uit hoofdstuk 4. Server controleert de adminsessie en voert basisvalidatie uit. Product-ID's worden door de beheerflow automatisch opgebouwd.

### `POST /api/admin/upload-product-image`

**Input:** multipart bestand en productcontext.  
**Validatie:** adminsessie, afbeelding-MIME en maximaal circa 5 MB.  
**Actie:** upload naar de publieke Supabase-bucket, standaard `product-images`.  
**Output:** publieke URL.

## 9.6 Adminorders

### `/api/admin/orders`

Leest orders en wijzigt status/betaalstatus. Mutaties gebruiken de database-RPC voor atomische voorraadtransities. Belangrijke statussen kunnen een klantmail activeren.

## 9.7 Adminvoorraad

### `/api/admin/inventory`

Leest voorraadproducten en verwerkt handmatige correcties/movements. Vereist adminsessie. De correctieflow verdient verdere transactionele aanscherping.

## 9.8 API-ontwerpbeoordeling

Positief:

- Bedrijfsgevoelige berekeningen zijn server-side.
- Admin- en accountendpoints controleren identiteit.
- Ordercreatie is idempotent.
- Voorraadtransities zijn atomisch.

Nog nodig:

- Uniform schema-validatiepakket, bijvoorbeeld Zod.
- Gestandaardiseerde foutcodes en request-ID's.
- Rate limiting en abuse protection.
- API-versies voor externe consumers.
- OpenAPI-specificatie.
- Idempotentie voor meer muterende endpoints.
- Auditlogging.

---

# 10. E-mailsysteem

## 10.1 Twee e-mailkanalen

| Kanaal | Dienst | Afzender | Gebruik |
|---|---|---|---|
| Accountmail | Supabase Auth via Resend SMTP | `account@nancys.es` | Bevestiging, herstel en accountgerelateerde berichten |
| Ordermail | Resend HTTP API | Standaard `orders@nancys.es` via `FROM_EMAIL` | Nieuwe order, klantbevestiging en statussen |
| Algemene communicatie | Handmatig/toekomstig | `info@nancys.es` | Contact, algemene informatie en nieuws |

## 10.2 Templates

`supabase/templates/confirmation.html` en `recovery.html` bevatten merkgebonden accounttemplates. Deze moeten in het Supabase-dashboard bij Auth e-mailtemplates worden toegepast; bestanden in Git alleen veranderen de productie-template niet automatisch.

Ordermails worden in applicatiecode als transactionele tekstinhoud opgebouwd. Er is nog geen componentgebaseerde HTML-templatebibliotheek.

## 10.3 Environmentvariabelen

Minimaal relevant:

```text
RESEND_API_KEY
INFO_EMAIL=info@nancys.es
ORDER_EMAIL=orders@nancys.es
ACCOUNT_EMAIL=account@nancys.es
FROM_EMAIL=Nancy's Castalla <orders@nancys.es>
NEXT_PUBLIC_SITE_URL=https://www.nancys.es
```

Voor Supabase Custom SMTP staan host, poort, username, password, afzender en naam extern in Supabase. Het SMTP-wachtwoord is een Resend API-key en mag nooit in Git.

## 10.4 Betrouwbaarheid

- Order wordt eerst opgeslagen; een mislukte e-mail verwijdert de order niet.
- Resend-idempotency headers beperken dubbele verzending bij retries.
- Tijdstempels registreren dat hoofdmailsoorten zijn verzonden.
- Statusmail wordt verstuurd bij belangrijke statuswijzigingen.

Beperkingen:

- Geen queue, cron-retry of dead-letter overzicht.
- API-response kan wachten op Resend.
- Eén generiek statusmailtijdstip is onvoldoende om iedere status afzonderlijk te auditen.
- Geen expliciete `Reply-To` in de huidige ordermailflow.
- Templates en teksten zijn grotendeels Engels.
- Resend domeinverificatie, SPF, DKIM en DMARC zijn externe DNS-verantwoordelijkheden.

---

# 11. Bestellingen

## 11.1 Kanalen

Er bestaan twee bestelkanalen:

1. **Database-orderrequest:** formulier verstuurt naar `/api/orders`, waarna de order in Supabase staat en e-mails worden verzonden.
2. **WhatsApp-order:** de browser bouwt een bericht en opent `wa.me` naar het centrale zakelijke nummer. Dit bericht maakt niet automatisch een databaseorder, tenzij de klant ook het orderformulier verstuurt.

Deze kanalen moeten in communicatie duidelijk blijven om dubbel werk en niet-geregistreerde WhatsApp-orders te voorkomen.

## 11.2 Volledige databaseflow

```mermaid
sequenceDiagram
    participant K as Klant
    participant C as ProductOrder
    participant A as /api/orders
    participant D as Supabase DB
    participant E as Resend
    participant B as Backoffice

    K->>C: producten, verpakking en aantallen kiezen
    C->>C: idempotency UUID genereren
    C->>A: klantdata en productkeuzes
    A->>D: actuele producten/prijzen ophalen
    A->>A: subtotalen, btw en totaal berekenen
    A->>D: create_validated_order RPC
    D-->>A: order-ID en oplopend nummer
    A->>E: admin- en klantmail
    A-->>C: orderbevestiging
    B->>D: status naar confirmed
    D->>D: voorraad locken, controleren en afboeken
    B->>E: statusmail
```

## 11.3 Prijs- en btwberekening

De browserwaarde is alleen een schatting voor de UI. De server haalt per regel opnieuw op:

- Verkoopprijs incl. btw.
- Btw-tarief.
- Verpakkingsoptie en hoeveelheid.
- Zichtbaarheid en voorraadstatus.

Daaruit berekent de server `line_total_incl_vat`, `line_total_ex_vat`, btw per regel, subtotalen en ordertotaal. Hierdoor kan een klant de prijs niet betrouwbaar manipuleren met browsertools.

## 11.4 Idempotentie

Het bestelcomponent behoudt tijdens een poging een UUID. `orders.idempotency_key` is uniek. Bij een retry retourneert de RPC de bestaande order in plaats van een duplicaat. E-mail gebruikt stabiele idempotency identifiers per ordergebeurtenis.

## 11.5 Ordernummering

- Technische `id`: tekstuele UUID-gebaseerde code.
- `uuid`: database-UUID.
- `order_number`: oplopend uniek getal voor menselijke communicatie.
- Presentatie kan worden geformatteerd als `NC-000001`.

## 11.6 Klantkoppeling

Bij een geldig bearer-token wordt de Auth-user gekoppeld aan `customers`, waarna `orders.customer_id` wordt gezet. Voor niet-ingelogde klanten kan op e-mail een klantrecord worden bijgewerkt/aangemaakt. Het adres wordt momenteel vooral in notities verwerkt in plaats van een apart orderadres-snapshotveld.

## 11.7 Status- en betaalmodel

Een nieuwe order start met `new` en betaalstatus `pending`. De beheerder bevestigt handmatig na beschikbaarheids- en betaalafspraak. Er is geen online payment webhook. Betaling en operationele status zijn gescheiden, wat correct is voor Bizum, overschrijving en contant.

---

# 12. Voorraadbeheer

## 12.1 Huidig model

Per product:

- `track_inventory`: voorraadcontrole aan/uit.
- `stock_quantity`: actuele verkoopbare hoeveelheid.
- `minimum_stock`: waarschuwinggrens.
- `stock_status`: commerciele status zoals available/preorder/coming-soon.

Deze velden zijn bewust gescheiden. Een preorderproduct kan bijvoorbeeld commercieel bestelbaar zijn zonder directe voorraad.

## 12.2 Ordermutaties

- Bij ordercreatie wordt voorraad gecontroleerd, maar nog niet gereserveerd.
- Bij status `confirmed` lockt de RPC ieder tracked product, controleert opnieuw en boekt af.
- `inventory_committed` voorkomt dubbel afboeken.
- Bij `cancelled` wordt de voorraad teruggezet als deze eerder gecommit was.
- Iedere mutatie schrijft een `inventory_movements`-record.

## 12.3 Risico's

- Twee `new` orders kunnen dezelfde laatste voorraad claimen. De eerste bevestiging slaagt; de tweede krijgt bij bevestiging onvoldoende voorraad.
- Pre-orders en fysieke voorraad hebben nog geen expliciete allocatie.
- Geen lotnummer, houdbaarheidsdatum, locatie of beschadigde voorraad.
- Handmatige correcties verdienen één atomische RPC.

## 12.4 Aanbevolen uitbreiding

1. Kies per product tussen `reserve_on_order` en `commit_on_confirm`.
2. Voeg `stock_reservations` met vervaltijd toe voor directe verkoop.
3. Voeg inkoopregels en goods receipts toe.
4. Introduceer lots, THT-datum en opslaglocatie voor food compliance.
5. Maak lagevoorraadnotificaties en bestelvoorstellen.

---

# 13. Afhalen en bezorgen

## 13.1 Centrale instellingen

In `config/business.ts`:

| Instelling | Huidige waarde |
|---|---:|
| Afhalen | Castalla, Calle Murcia 111 |
| Bezorgminimum | EUR 25 |
| Radius | Circa 15 km |
| Bezorgkosten | Vanaf EUR 3,50 |
| Gratis bezorging | Niet als regel geimplementeerd |

## 13.2 Huidig gedrag

De klant kiest afhalen of lokale bezorging. De website toont minimum, radius en kosten. Het adres van een ingelogde klant wordt vooraf ingevuld. De uiteindelijke bezorgmogelijkheid blijft handmatige bevestiging.

## 13.3 Ontbrekende handhaving

- Het bezorgminimum wordt niet definitief server-side geblokkeerd.
- De bezorgfee wordt niet betrouwbaar server-side aan het ordertotaal toegevoegd.
- Geen postcode-, afstands- of routecontrole.
- Geen bezorgslots of capaciteit.
- Geen apart orderadres-snapshot.
- Geen gratis-bezorgdrempel.

## 13.4 Toekomstige postcodecontrole

Aanbevolen model:

1. Sla bezorgzones met postcode/radius en fee op.
2. Valideer adres server-side via geocoding of een eigen postcodezone.
3. Bereken fee en minimum uitsluitend server-side.
4. Bewaar het gevalideerde afleveradres als onveranderlijk ordersnapshot.
5. Toon pas daarna een bevestigbaar totaal.

---

# 14. Facturatie en betalingen

## 14.1 Huidige betaalmethoden

- Bizum.
- Bankoverschrijving.
- Contant bij afhalen.
- Contant bij bezorgen.
- Kaartbetaling later.

`bankAccount` is nog een placeholder. Het Bizum-nummer in de config moet worden gecontroleerd: het kan nog naar het eerdere telefoonnummer verwijzen terwijl WhatsApp inmiddels is gewijzigd.

## 14.2 Payment providerarchitectuur

Onder `src/payments` bestaan provider/typestructuren zodat een latere Stripe-, SumUp- of andere provider kan worden toegevoegd zonder de winkelwagen opnieuw te ontwerpen. Er is geen Stripe-package, webhook, checkout session of actieve payment intent.

## 14.3 Facturatiestatus

Aanwezig:

- `invoices`-tabel.
- Moduleplaats in backoffice.
- Bedragvelden excl. btw, btw en incl. btw.
- Relatie met order en klant.

Ontbreekt:

- Factuurregels en snapshots van fiscale klantgegevens.
- Officiele nummerreeksregels.
- PDF-template en opslag.
- Creditnota's.
- Spaanse fiscale/IVA-validatie.
- Automatische creatie na betaling.
- Verzending naar klant.
- Boekhoudexport of API.

## 14.4 API-mogelijkheden

De integratielaag kan later providers implementeren voor facturatie, POS, SumUp en accounting. Advies is eerst een interne `BillingService` en providerneutraal factuurmodel af te ronden, daarna een externe leverancier te koppelen.

---

# 15. SEO

## 15.1 Aanwezig

- `metadataBase` op het productiedomein.
- Algemene titel, omschrijving en zoekwoorden rond international food Castalla, British food, Dutch snacks, expat food en bread order.
- Locale-afhankelijke titel/omschrijving.
- Canonical URL en `hreflang`-alternates voor de ondersteunde talen.
- Open Graph-informatie en logo.
- Dynamische productmetadata met productnaam, omschrijving en afbeelding.
- `robots.ts` dat admin- en API-routes uitsluit.
- `sitemap.ts` voor statische routes en locales.

## 15.2 Ontbreekt of is onvolledig

- Product- en categorie-URL's staan niet volledig in de sitemap.
- Geen JSON-LD voor `LocalBusiness`, `Product`, `Offer`, `BreadcrumbList` en FAQ.
- De root-HTML-taal kan voor alle locales nog `en` zijn.
- Veel pagina's erven algemene metadata in plaats van unieke content.
- Geen productfeed voor Google Merchant.
- Geen Search Console-/analyticsintegratie in de repository.
- Geen redirects/slugstrategie als productnamen wijzigen; productcodes zijn wel stabiel.

## 15.3 Advies

Voeg een databasegestuurde sitemap toe, lokale bedrijfsstructured data, productoffers en breadcrumbs. Houd productcode in de URL als stabiele sleutel en voeg desgewenst een leesbare slug toe zonder de code te verwijderen.

---

# 16. Responsive design en visuele keuzes

## 16.1 Designrichting

Het ontwerp volgt het logo en een klassieke internationale food-market:

| Token | Kleur | Gebruik |
|---|---|---|
| `forest` | `#0d2f22` | Hoofdgroen, navigatie, CTA's |
| `leaf` | `#214f36` | Secundair groen |
| `cream` | `#f7efd9` | Warme vlakken |
| `linen` | `#fbf7ed` | Basisachtergrond |
| `coffee` | `#8a4d25` | Accent/labels |
| `toast` | `#c88b4d` | Brood-/warm accent |
| `brass` | `#b88a3d` | Premium goudaccent |
| `ink` | `#17251f` | Tekst |

Koppen gebruiken Georgia/Times, interface- en broodtekst Arial/Helvetica. Dit geeft een klassiek marktgevoel zonder de leesbaarheid van operationele UI te verliezen. Lucide-iconen ondersteunen herkenbare acties.

## 16.2 Mobiel

- Compact mobiel menu.
- Flexibele grids en begrensde afbeeldingen.
- Productkaarten gebruiken stabiele beeldverhouding.
- `html` en `body` hebben horizontale overflowbescherming.
- Knoppen en aantalkiezers zijn geschikt voor touch.

Eerdere problemen met extreem brede mobiele productkaarten en foto's zijn gericht aangepakt. Productdetailafbeeldingen moeten bij toekomstige wijzigingen ongemoeid blijven tenzij regressietests aantonen dat aanpassing nodig is.

## 16.3 Tablet en desktop

- Max-width containers voorkomen uitgerekte content.
- Productcategorieën schalen van een naar twee en vier kolommen.
- Backofficetabellen mogen intern horizontaal scrollen in plaats van de hele pagina te verbreden.
- De sticky header en taalkeuze blijven bereikbaar.

## 16.4 Openstaande verbeteringen

- Structurele visuele regressietests voor iPhone, Android, tablet en desktop.
- Lange Duitse/Spaanse labels en zeer lange productnamen testen.
- Toegankelijkheidsaudit: toetsenbord, focus, contrast, labels en screenreader.
- Adminformulieren op klein scherm verder ergonomisch maken.
- Browserextensies kunnen `fdprocessedid` toevoegen en daardoor een development hydration-waarschuwing veroorzaken; dat is niet noodzakelijk een applicatiefout.

---

# 17. Performance

## 17.1 Rendering

- App Router gebruikt servercomponenten waar mogelijk.
- Databaseafhankelijke cataloguspagina's zijn `force-dynamic` en gebruiken actuele data.
- Statische informatieve routes kunnen bij build worden gegenereerd.
- Er is geen expliciete ISR-strategie of `revalidate`-beleid.

## 17.2 Caching

- Productdatabasequeries zijn hoofdzakelijk actueel/no-store.
- Geen Redis, edge KV of applicatiecache.
- Geen catalogus-tag invalidation.
- Vercel verzorgt statische assetdelivery, maar databasecontent wordt niet structureel gecachet.

## 17.3 Afbeeldingen

- Logo gebruikt Next.js Image waar van toepassing.
- Productafbeeldingen zijn vaak externe/public Storage-URL's in gewone `img`-elementen.
- Daardoor ontbreekt een uniforme Next Image-optimalisatie, responsive `srcset` en formaatconversie.
- Upload beperkt type en bestandsgrootte, maar maakt geen thumbnails of WebP/AVIF-varianten.

## 17.4 Grote catalogus

De productstore haalt records in pagina's van 1.000 op, tot een hoge bovengrens. Dit lost de Supabase standaardlimiet op, maar sommige routes laden vervolgens de volledige catalogus en filteren in Node.js. Ook productdetail kan via `getProducts()` eerst alles ophalen. Bij duizenden producten is dit de grootste performance- en geheugenschuld.

De homepage heeft een geoptimaliseerde query die maximaal acht zichtbare producten met foto ophaalt. Categoriepagina's kunnen nog te veel producten en client-hydratiedata krijgen omdat publieke paginering ontbreekt.

## 17.5 Aanbevolen optimalisaties

1. Query productdetail direct op `id`.
2. Filter categorie, zichtbaarheid en zoekterm in SQL.
3. Voeg cursor- of serverpaginering toe.
4. Indexeer `is_visible`, categorieën en zoekvelden.
5. Gebruik Next Image met toegestane Supabase-host en thumbnails.
6. Introduceer cachetags met invalidatie na adminwijzigingen.
7. Meet Web Vitals en serverfunctieduur voordat verder wordt geoptimaliseerd.

---

# 18. Security

## 18.1 Aanwezige maatregelen

- Supabase service-role staat uitsluitend server-side.
- `.env.local` en productiesecrets horen niet in Git.
- RLS staat op bedrijfsdatatabellen aan en heeft default-deny zonder policies.
- Klant-API's verifiëren Supabase access tokens server-side.
- Admincookie is HttpOnly, SameSite en production-secure.
- Adminwachtwoord wordt timing-safe vergeleken.
- Orderprijzen, btw, producten, verpakkingen en voorraad worden server-side opnieuw gevalideerd.
- Idempotency voorkomt dubbele orders.
- Voorraadmutaties gebruiken row locks en een transactionele RPC.
- React escaped standaard dynamische tekst.
- Upload valideert MIME en grootte.
- Robots sluiten beheer/API uit; dit is vindbaarheidsbeperking, geen beveiliging.

## 18.2 Environmentvariabelen

Benodigd:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
ADMIN_EMAIL
ADMIN_PASSWORD
INFO_EMAIL
ORDER_EMAIL
ACCOUNT_EMAIL
FROM_EMAIL
PRODUCT_IMAGES_BUCKET
```

`NEXT_PUBLIC_*` is zichtbaar voor browsers en mag alleen publieke Supabasegegevens bevatten. Service-role, adminwachtwoord en Resend-key zijn geheim.

## 18.3 Ontbrekende maatregelen

- Geen rate limiting op adminlogin, orders, profielwijziging of uploads.
- Geen CAPTCHA/botbescherming.
- Geen individuele adminaccounts, MFA of RBAC.
- Geen adminauditlog.
- Geen expliciete CSRF-token of Origin-check voor adminmutaties; SameSite helpt maar is geen volledige strategie.
- Geen expliciete Content-Security-Policy, frame policy of Permissions-Policy in broncode.
- Geen centrale requestvalidatiebibliotheek.
- Publieke Storage-bucket; URL-bezit is niet geheim.
- Geen malware-/inhoudsscan of afbeeldingsnormalisatie.
- Geen geheimrotatieprocedure.
- Geen applicatiebrede privacyretentie, accountverwijdering of data-export.
- Geen geautomatiseerde dependency/securityscan in CI.

## 18.4 Data- en privacyrisico

Klantnaam, e-mail, telefoon, adres en orderhistorie zijn persoonsgegevens. Bij verwijderen van een Auth-user wordt `auth_user_id` op het klantrecord `NULL`, maar profiel en orders blijven bestaan. Dat is nuttig voor administratie, maar vereist een gedocumenteerde wettelijke bewaartermijn en een aparte anonimiseer-/verwijderprocedure.

---

# 19. Bekende problemen en technische schuld

## 19.1 Hoog risico

1. **Externe configuratie is niet version-controlled.** Productie werkt alleen als Vercel env, Supabase redirects/SMTP/templates/migraties en Resend/DNS correct staan.
2. **Geen rate limiting.** Login, order- en mailflows kunnen worden misbruikt.
3. **Geen voorraadreservering.** Meerdere open orders kunnen dezelfde voorraad aanvragen.
4. **Bezorgregels niet server-side.** Minimum, fee en radius kunnen operationeel verkeerd uitpakken.
5. **Geen testset/CI.** Regressies worden hoofdzakelijk handmatig ontdekt.

## 19.2 Functionele schuld

- WhatsApp-orders worden niet automatisch in de database geregistreerd.
- Klantadres wordt niet als ordersnapshot gemodelleerd.
- Account toont beperkte orderdetails.
- Geen conventionele cart die navigatie/reload overleeft.
- Geen online betaling.
- Bankrekening is placeholder.
- Bizum-nummer kan nog het oude telefoonnummer zijn en moet zakelijk worden bevestigd.
- Contactformulier en FAQ ontbreken.
- Orderstatusovergangen vormen nog geen strikte state machine.
- `processing` voor `confirmed` kan voorraadlogica omzeilen totdat een bevestiging plaatsvindt.
- Handmatige voorraadcorrectie is mogelijk niet volledig transactioneel.

## 19.3 Data- en architectuurschuld

- Productdetail en sommige lijsten laden de hele catalogus.
- Lokale fallback kan een Supabase-fout stil verbergen en verouderde producten tonen.
- Productleverancier is zowel vrije tekst als leveranciersrecord.
- Verpakkingsopties zijn gedeeltelijk tekstgebaseerd in plaats van genormaliseerd.
- `order_items.product_id` heeft geen harde product-FK.
- De customer-FK op orders moet mogelijk nog worden gevalideerd.
- Geen databasechecks voor status, btw en prijsbereiken.
- Legacy `create_order_with_inventory` en `/api/auth/register` veroorzaken dubbele concepten.
- `supabase-schema.sql`/README kunnen achterlopen; migraties zijn leidend.

## 19.4 E-mail- en operationele schuld

- Geen outbox/queue of automatische retry.
- Geen per-event mailaudit.
- Geen expliciete Reply-To.
- Auth- en ordertemplates zijn niet volledig meertalig.
- Supabase-templatewijzigingen moeten handmatig worden gepubliceerd.
- Geen monitoring op bounced/complained e-mail.

## 19.5 SEO, toegankelijkheid en kwaliteit

- Geen product-/categoriesitemap of structured data.
- HTML `lang` kan niet met locale meeschakelen.
- Onvolledige vertalingen, vooral juridische en Scandinavische dekking.
- Geen automatische accessibilityscan.
- Geen browser-/visuele regressietests.
- Geen observability, error tracker of uptimealarm.
- Dependency-audit heeft eerder lage/matige kwetsbaarheden gemeld; opnieuw controleren en gericht upgraden zonder geforceerde breaking update.

---

# 20. Roadmap

## 20.1 Korte termijn: productiebetrouwbaarheid

1. Maak een gecontroleerde productiechecklist voor Vercel, Supabase, Resend en DNS.
2. Voeg smoke- en integratietests toe voor login, registratie, productpagina, order en voorraadtransitie.
3. Voeg rate limiting toe aan auth, admin en orderendpoints.
4. Maak bezorgminimum, fee en orderadres server-authoritatief.
5. Voeg strikte orderstatusovergangen en duidelijke backofficefouten toe.
6. Controleer/actualiseer Bizum en bankrekening.
7. Voeg logging, request-ID's, foutmonitoring en e-mailalerts toe.
8. Maak productqueries databasegericht en gepagineerd.

## 20.2 Middellange termijn: operationele volwassenheid

1. Individuele adminaccounts, rollen, MFA en auditlog.
2. Orderdetail, statusgeschiedenis, notities en klantcommunicatie in backoffice.
3. Inkoopregels, goederenontvangst en automatische voorraadverhoging.
4. Voorraadreserveringen, lots en THT.
5. Factuurregels, PDF's en boekhoudexport.
6. Adresboek, postcodezones en bezorgplanning.
7. Transactional outbox en mailretry.
8. Volledige vertalingen en producttranslation model.
9. Productstructured data, sitemap en Merchant feed.

## 20.3 Lange termijn: integraties en schaal

1. SumUp/kaartbetaling en webhookgestuurde betaalstatus.
2. POS/kassa met gedeelde voorraad.
3. WhatsApp Business API en automatische conversatie naar order.
4. Leveranciers- en boekhoudkoppelingen.
5. Native/PWA-klantervaring.
6. BI-rapportages voor marge, rotatie, verspilling en vraagvoorspelling.
7. Eigen versioned API met partnerauthenticatie.

---

# 21. Technisch advies

## 21.1 Eerste verbeteringen

Mijn aanbevolen volgorde is:

1. **Betrouwbaarheid voor omzet:** test ordercreatie, voorraad, e-mail en klantkoppeling end-to-end in productie.
2. **Misbruikbeperking:** rate limits, CAPTCHA waar passend, individuele adminauth en auditlogging.
3. **Correcte logistiek:** server-side bezorging en voorraadreservering.
4. **Performance:** directe productqueries en serverpaginering.
5. **Operationele tooling:** orderdetail, inkoopontvangst, voorraadcorrectie-RPC en rapportage.
6. **Facturatie/betaling:** pas koppelen nadat order- en geldmodellen stabiel zijn.

## 21.2 Aanbevolen refactors

- Introduceer schema-validatie voor alle request/responsemodellen.
- Maak één `ProductRepository`, `OrderRepository` en `CustomerRepository` in plaats van verspreide REST-aanroepen.
- Verwijder of depreceer legacy order- en registratieroutes na migratie.
- Normaliseer productverpakkingen naar een eigen tabel met hoeveelheid, label, barcode en prijs.
- Maak `OrderStateMachine` met toegestane overgangen en side effects.
- Maak `NotificationService` plus database-outbox.
- Scheid bedrijfsconfig in openbare configuratie, geheime env en beheerbare database-instellingen.
- Voeg typed integration providercontracten en health checks toe.

## 21.3 Extra aandacht

- **Food data:** ingrediënten, allergenen, bewaring en THT verdienen juridische en inhoudelijke controle. Ontbrekende leveranciersdata niet zelf verzinnen.
- **Prijsmodel:** leg vast of inkoopprijs per doos of verkoopeenheid is en bewaar conversie expliciet.
- **Privacy:** documenteer retentie, accountverwijdering, export en toestemming.
- **Spaanse fiscaliteit:** laat factuur- en IVA-vereisten voor productie juridisch/boekhoudkundig controleren.
- **Mobiel:** behoud de huidige productdetailverhouding en test elke cataloguswijziging op echte iPhone en Android.
- **Secrets:** roteer eerder gedeelde sleutels/wachtwoorden en leg nooit geheime waarden in documentatie of Git vast.

---

# 22. Beknopte systeemsamenvatting

Nancy's Castalla is een Next.js 16/React 19 webwinkel op Vercel met Supabase als PostgreSQL-, Auth- en Storagebackend. De website is gebouwd voor een internationale expatdoelgroep rond Castalla en ondersteunt Engels, Nederlands, Duits, Spaans en een Zweedse/Scandinavische locale. Het ontwerp gebruikt donkergroen, creme, koffie- en messingkleuren uit het logo. De publieke ervaring is mobielgericht, met categorieoverzichten, zoeken, productdetail op stabiele Nancy-productcode, verpakkingskeuzes, sociale deelmogelijkheid en duidelijke WhatsApp-CTA's.

Producten worden primair uit Supabase geladen. De catalogus bevat rijke commerciële en operationele velden: identificatie, meerdere categorieën, herkomst, afbeelding, zichtbaarheid, voorraadstatus, kostprijs, btw, verkoopprijs, leverancier, verpakkingen, voorraad, ingrediënten en bewaar-/bereidingsinformatie. Een lokale TypeScriptdataset fungeert als fallback, maar kan bij storingen verouderde data tonen. Grote leverancierslijsten zijn via SQL-imports ingebracht en standaard verborgen, waarna de beheerder producten handmatig kan verrijken en publiceren.

De backoffice is bereikbaar via een verborgen adminlogin. Adminauth gebruikt een gedeelde e-mail en wachtwoord uit Vercel-environmentvariabelen en een beveiligde HttpOnly-cookie. Productbeheer is het meest volwassen onderdeel: toevoegen, wijzigen, verwijderen, foto's uploaden, meerdere categorieën, prijzen, btw, klantverpakkingen en online zichtbaarheid. Orders en voorraad zijn operationeel bruikbaar. Klanten, leveranciers en eenvoudige rapportages zijn zichtbaar. Inkoop, facturatie, btw en integraties zijn vooral voorbereid en nog niet volledig uitvoerbaar.

Klantaccounts gebruiken Supabase Auth. Registratie verstuurt via Supabase en Resend SMTP een branded bevestigingsmail van `account@nancys.es`. Na bevestiging kan de klant inloggen, het profiel met naam, telefoon, adres en taal beheren, het wachtwoord herstellen en orderhistorie bekijken. Een database-trigger koppelt de Auth-user aan de `customers`-tabel. De Supabase-sessie leeft in browserstorage; account-API's verifiëren ieder bearer-token opnieuw en gebruiken daarna server-side service-role toegang.

Bij bestellen verstuurt de browser alleen productcodes, aantallen en verpakkingskeuzes. De server vertrouwt geen prijzen of totalen uit de browser. Hij leest actuele producten uit Supabase, controleert zichtbaarheid, status, verpakking en voorraad en berekent excl.-btw, btw en incl.-btw opnieuw. Een idempotency key en unieke database-index voorkomen dubbele orders bij retries. De order krijgt een UUID en oplopend ordernummer. Ingelogde klanten worden via `customer_id` gekoppeld; gastorders blijven mogelijk.

Nieuwe orders boeken nog geen voorraad af. Wanneer een beheerder een order bevestigt, gebruikt PostgreSQL een transactionele RPC met row locks. Tracked voorraad wordt gecontroleerd en afgeboekt en er wordt een movement geschreven. `inventory_committed` voorkomt dubbel afboeken. Annuleren zet eerder geboekte voorraad terug. Dit is veilig bij gelijktijdige bevestigingen, maar open orders reserveren nog niets. Daardoor kan de tweede van twee concurrerende orders pas bij bevestiging onvoldoende voorraad blijken te hebben.

Ordermail loopt via de Resend API met `orders@nancys.es`; accountmail loopt via Supabase Custom SMTP met `account@nancys.es`. De order wordt opgeslagen voordat mail wordt verstuurd, zodat een mailstoring geen orderverlies of duplicatie veroorzaakt. Idempotency headers verminderen dubbele mails. Er is nog geen queue, automatische retry of uitgebreid eventlog. DNS-verificatie, SMTP-credentials, redirect-URL's en templates worden buiten Git in Resend/Supabase beheerd en moeten via een deploymentchecklist worden bewaakt.

WhatsApp blijft een belangrijk apart kanaal. De site bouwt een bericht naar `+34 644 05 97 69`, maar zo'n WhatsApp-bericht wordt niet vanzelf een databaseorder. Betaling gebeurt handmatig via Bizum, overschrijving of contant; Stripe en kaartbetaling zijn niet actief. Een providerstructuur maakt latere koppeling mogelijk. De bankrekening is nog een placeholder en het Bizum-nummer moet worden gecontroleerd op het nieuwe zakelijke nummer.

Afhalen is in Castalla; bezorging wordt gecommuniceerd met een minimum van EUR 25, circa 15 km en vanaf EUR 3,50. Deze regels zijn nog niet server-side afgedwongen en de fee wordt niet gegarandeerd in het ordertotaal opgenomen. Een toekomstige versie moet bezorgzones, adresvalidatie, ordersnapshots, capaciteit en server-side prijsberekening toevoegen.

De securitybasis is verstandig voor een MVP: service-role alleen op de server, RLS default-deny, geverifieerde klanttokens, HttpOnly admincookie, server-authoritatieve prijzen, idempotente orders en transactionele voorraad. Voor duurzame productie ontbreken nog rate limiting, botbescherming, individuele admins/MFA, auditlogs, security headers, geautomatiseerde tests en monitoring. Persoonsgegevens en foodinformatie vereisen bovendien formeel retentie-, verwijderings- en compliancebeleid.

De eerstvolgende ontwikkelfase moet daarom niet beginnen met extra commerciele features, maar met productiebetrouwbaarheid: end-to-end tests, externe configuratiecontrole, logging, rate limiting, correcte bezorgberekening, voorraadreservering en snellere databasequeries. Daarna kunnen inkoop, facturatie, POS, SumUp, WhatsApp Business, boekhouding en een eigen API veilig op de bestaande servicearchitectuur worden aangesloten.
