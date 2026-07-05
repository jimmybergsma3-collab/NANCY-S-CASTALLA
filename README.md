# Nancy's Castalla

Meertalige Next.js-webwinkel en backoffice voor Nancy's Castalla, gericht op internationale foodproducten, pre-orders, afhalen in Castalla en lokale bezorging.

## Documentatie

De actuele projectdocumentatie staat in [`docs`](docs):

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
- Klantlogin: `/{locale}/login`
- Klantaccount: `/{locale}/account`
- Adminlogin: `/{locale}/admin/login`
- Backoffice: `/{locale}/admin`

## Deployment

Productie draait op Vercel en gebruikt Supabase en Resend. Een succesvolle build bewijst niet dat externe dashboardinstellingen correct staan. Controleer bij releases ook Vercel-environmentvariabelen, Supabase-migraties en Auth-redirects, Resend-domein/SMTP en DNS. De actuele checklist en open punten staan in de [roadmap](docs/ROADMAP.md).
