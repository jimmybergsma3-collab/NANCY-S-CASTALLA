# Roadmap: Nancy's Castalla

**Peildatum:** 8 juli 2026
**Status:** levende roadmap

Deze roadmap bevat alleen toekomstig werk. Afgeronde functionaliteit staat in `CHANGELOG.md` en `PROJECT_STATUS.md`; technische details staan in `TECHNICAL_HANDOVER.md`.

## Nu bezig

### Productiecontrole

- [ ] Controleer Vercel-environmentvariabelen voor Production en Preview.
- [ ] Bevestig dat alle Supabase-migraties tot en met `202607080001_payment_method_polish.sql` actief zijn.
- [ ] Test op productie één volledige nieuwe-klantflow inclusief accountmail, ordermail, statusmail en factuurmail.
- [ ] Controleer Resend-domein, SPF, DKIM, DMARC, API-key, Supabase SMTP en bounce-/complaintgedrag.
- [ ] Bevestig het zakelijke Bizum-nummer en vervang de placeholder-bankrekening.
- [ ] Laat Spaanse factuurgegevens en teksten door gestor/boekhouder valideren.
- [ ] Leg een eenvoudige releasechecklist vast voor Vercel, Supabase, Resend, DNS, lint, build en smoke-test.

### Livegangveiligheid

- [ ] Rate limiting op adminlogin, registratie, ordercreatie, profielmutaties en uploads.
- [ ] Botbescherming op publieke mutaties waar misbruik waarschijnlijk is.
- [ ] Individuele adminaccounts en MFA, of tijdelijk een gedocumenteerd credentialrotatiebeleid.
- [ ] Security headers, CSP en framebeleid controleren en aanscherpen.
- [ ] Geautomatiseerde regressietests en CI-gate voor lint/build toevoegen.
- [ ] Dependency-auditmeldingen gericht onderzoeken en zonder geforceerde breaking upgrades oplossen.

### Orders, voorraad en bezorging

- [ ] Server-side bezorgminimum, bezorgkosten en leveringsgebied berekenen en afdwingen.
- [ ] Apart onveranderlijk afleveradres-snapshot op orders opslaan.
- [ ] Formele order-state-machine en statushistorie toevoegen.
- [ ] Beslissen over voorraadreservering voor open orders.
- [ ] Duidelijke admin- en klantafhandeling toevoegen wanneer voorraad bij bevestiging onvoldoende blijkt.

## Daarna

### Performance en catalogus

- [ ] Productdetail rechtstreeks op productcode ophalen in plaats van via volledige catalogusload.
- [ ] Categorie, zoekresultaten en admincatalogus server-side pagineren en filteren.
- [ ] Indexen voor zichtbaarheid, categorieën en zoekgebruik meten en optimaliseren.
- [ ] Productafbeeldingen voorzien van thumbnails en responsive formaten.
- [ ] Monitoring voor errors, performance en externe integraties toevoegen.

### Klantbeleving en compliance

- [ ] Volledige productinhoud en resterende interface/backoffice professioneel vertalen.
- [ ] Allergenen- en voedselinformatie structureren en operationeel controleren.
- [ ] Privacy-, cookie-, retentie-, verwijderings- en consumentenprocessen juridisch valideren.
- [ ] Product- en categorie-URL's aan sitemap toevoegen en JSON-LD voor LocalBusiness/Product/Offer/BreadcrumbList bouwen.
- [ ] Orderstatushistorie en herhaalbestelling in klantaccount toevoegen.

### Backoffice verdiepen

- [ ] Volledig leveranciersbeheer en inkooporderregels.
- [ ] Goederenontvangst die voorraad transactioneel verhoogt.
- [ ] Lagevoorraadmeldingen en bestelvoorstellen.
- [ ] Rapportages voor verkoop, marge, voorraad en IVA uitbreiden.
- [ ] Auditlogging voor admin-, prijs-, voorraad- en orderacties.

## Later

### Facturatie en betaling

- [ ] Creditnota's en formele factuurcorrecties.
- [ ] Boekhoudexport en/of koppeling met Spaanse administratieprovider.
- [ ] Automatische betalingsmatching en payment webhooks.
- [ ] SumUp of andere kaartprovider selecteren; Stripe alleen activeren bij expliciete zakelijke keuze.

### Integraties

- [ ] Transactionele e-mailoutbox met retries en eventhistorie.
- [ ] WhatsApp Business API en handmatige import van WhatsApp-orders.
- [ ] POS/kassa met gedeelde voorraad.
- [ ] Leveranciers-, verzend- en boekhoudintegraties.
- [ ] Versioned externe API met partnerauthenticatie.

## Ideeën

- Meertalige nieuwsbrief na expliciete toestemming.
- Loyalty en klantsegmentatie.
- Mobiele app boven op dezelfde services.
- Lots, houdbaarheidsdatum en opslaglocaties.

## Roadmapregels

1. Werk eerst productiebetrouwbaarheid en wettelijke randvoorwaarden af.
2. Verplaats afgerond werk naar `CHANGELOG.md` en `PROJECT_STATUS.md`.
3. Voeg geen externe provider toe zonder businessbesluit, securityreview en environmentplan.
4. Breek de werkende mobiele productdetail-layout, productfotoverhouding en mobiele navigatie niet zonder aantoonbare noodzaak en regressietest.
