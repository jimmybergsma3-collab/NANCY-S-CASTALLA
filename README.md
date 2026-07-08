# Nancy's Castalla

Meertalige Next.js-webwinkel en backoffice voor Nancy's Castalla, gericht op internationale foodproducten, pre-orders, afhalen in Castalla en lokale bezorging.

**Huidige fase:** productie-MVP / pre-orderfase. De kernflow van catalogus naar winkelmand, server-gevalideerde bestelaanvraag, klantaccount, adminorderbeheer en PDF-factuur is gebouwd. De resterende livegangpunten zijn vooral productieconfiguratie, end-to-end verificatie, bezorgberekening en operationele beveiliging. Zie [`PROJECT_STATUS.md`](PROJECT_STATUS.md) voor de actuele go-live-status.

## Documentatie

De actuele projectdocumentatie staat in [`docs`](docs):

- [`AI_CONTEXT.md`](AI_CONTEXT.md): compacte projectbriefing en werkinstructies voor AI-assistenten.
- [`PROJECT_STATUS.md`](PROJECT_STATUS.md): actuele functionele status, afgeronde mijlpalen en uitsluitend nog openstaande livegangpunten.
- [`TECHNICAL_HANDOVER.md`](docs/TECHNICAL_HANDOVER.md): actuele technische architectuur en projectstatus.
- [`BUSINESS_LOG.md`](docs/BUSINESS_LOG.md): zakelijke keuzes en motivatie.
- [`ROADMAP.md`](docs/ROADMAP.md): actuele prioriteiten en toekomstig werk.
- [`DECISIONS.md`](docs/DECISIONS.md): chronologische technische beslissingen.
- [`CHANGELOG.md`](docs/CHANGELOG.md): wijzigingsgeschiedenis met semantische versies.

De documentatie is onderdeel van iedere belangrijke wijziging. Werk alleen de documenten bij waarop een wijziging daadwerkelijk invloed heeft.

## Technologie

- Next.js App Router en React
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth en Storage
- Resend voor transactionele e-mail
- Vercel voor productiehosting

Zie het [technische overdrachtsrapport](docs/TECHNICAL_HANDOVER.md) voor versies, datamodel, API's, authenticatie, deployment, security en bekende aandachtspunten.

## Lokaal starten

```bash
npm install
npm run dev
```

De ontwikkelserver gebruikt standaard `http://localhost:3000`.

## Kwaliteitscontrole

```bash
npm run lint
npm run build
```

## Configuratie

Openbare bedrijfsinstellingen staan in `config/business.ts`. Geheime of omgevingsafhankelijke instellingen horen in lokale/Vercel-environmentvariabelen. Gebruik `.env.example` als namenlijst en commit nooit echte wachtwoorden, service-role keys, SMTP-credentials of API-keys.

Databasewijzigingen staan chronologisch in `supabase/migrations`. Deze migraties zijn leidend; voer ze gecontroleerd uit in de juiste Supabase-omgeving.

## Belangrijke routes

- Publieke website: `/en`, `/nl`, `/de`, `/es`, `/sv`
- Producten: `/{locale}/products`
- Winkelmand en checkout: `/{locale}/cart`
- Klantlogin: `/{locale}/login`
- Klantaccount: `/{locale}/account`
- Adminlogin: `/{locale}/admin/login`
- Backoffice: `/{locale}/admin`
- Adminorders: `/{locale}/admin/orders`
- Facturen: `/{locale}/admin/invoicing`

## Functionele kern

- Meertalige catalogus voor `en`, `nl`, `de`, `es` en `sv`.
- Producten zoeken, filteren, openen, delen en met verpakkingskeuze aan de winkelmand toevoegen.
- Pre-orders blijven bestelbaar bij voorraad nul; `coming-soon` is geblokkeerd; beschikbare voorraadproducten worden server-side gecontroleerd.
- De server herberekent prijzen, IVA en totalen en maakt orders idempotent aan in Supabase.
- Klanten kunnen registreren, inloggen, hun profiel beheren, orders openen en eigen facturen downloaden.
- Admin kan producten, voorraad, orders, orderregels, notities, statussen, betaalstatussen en facturen beheren.
- Facturen worden transactioneel uit orders opgebouwd, als Spaans/Engelse PDF gegenereerd en via Resend verzonden.

Niet iedere zichtbare backofficemodule is al volledig transactioneel. Zie `PROJECT_STATUS.md` voor het precieze onderscheid tussen operationeel, gedeeltelijk en voorbereid.

## Deployment

Productie draait op Vercel en gebruikt Supabase en Resend. Een succesvolle build bewijst niet dat externe dashboardinstellingen correct staan. Controleer bij releases ook Vercel-environmentvariabelen, Supabase-migraties en Auth-redirects, Resend-domein/SMTP en DNS. De actuele checklist en open punten staan in de [roadmap](docs/ROADMAP.md).
