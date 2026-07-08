# Projectstatus: Nancy's Castalla

**Peildatum:** 8 juli 2026
**Fase:** productie-MVP / pre-orderfase
**Productiedomein:** `https://www.nancys.es`
**Bronnen voor deze status:** volledige Git-geschiedenis vanaf de eerste webshopcommit, actuele routes, services, migraties en documentatie.

## Status in één oogopslag

Nancy's Castalla heeft een werkende meertalige catalogus, persistente winkelmand, server-gevalideerde bestelaanvraag, Supabase-klantaccounts, beveiligde backoffice, transactionele voorraadmutaties en interne Spaanse facturatie. De softwarebasis is geschikt voor gecontroleerde pre-orders. Volledig onbeheerde productie is nog niet verstandig totdat de externe configuratie en complete liveflow opnieuw op productie zijn getest en de hieronder genoemde operationele punten zijn afgehandeld.

| Gebied | Status | Toelichting |
|---|---|---|
| Publieke webshop | Operationeel | Home, categorieën, zoeken, productdetail, winkelmand en checkout bestaan in vijf locales. |
| Pre-orders | Operationeel | Pre-order is bestelbaar bij voorraad nul; coming-soon is geblokkeerd. |
| Klantaccount | Operationeel | Registratie, login, herstel, profiel, orderhistorie, orderdetails en eigen factuurdownload. |
| Orders | Operationeel | Serverprijzen, IVA, idempotency, orderregels, ordernummer, klantkoppeling en adminbeheer. |
| Voorraad | Operationeel met beperking | Afboeken bij bevestiging en terugboeken bij annulering; geen reservering tijdens status `new`. |
| Facturatie | Operationeel voor normale facturen | Unieke factuur per order, snapshots, Spaans/Engelse PDF, admin- en klantdownload, e-mail. |
| E-mail | Operationeel mits extern geconfigureerd | Resend voor order/factuur; Supabase SMTP voor accountmail; geen queue of automatische retry. |
| Admin | Gemengd | Producten, orders, voorraad en facturen functioneel; overige modules variëren van overzicht tot voorbereiding. |
| Betaling | Handmatig | Bizum, bankoverschrijving en contant; kaart slechts als vastgelegde keuze, geen online provider. |
| Bezorging | Gedeeltelijk | Beleid wordt getoond, maar minimum, radius en fee zijn niet volledig server-authoritatief. |
| Tests/CI | Onvoldoende geautomatiseerd | Lint en build slagen; geen vaste geautomatiseerde regressiesuite of CI-gate. |

# Afgeronde mijlpalen

## Webshop

- Next.js App Router-webshop met responsive merkstijl en locales `en`, `nl`, `de`, `es`, `sv`.
- Homepage, categorieoverzicht, categoriepagina, zoeken, filters en productdetail op stabiele `NC-xxxxx`-productcode.
- Productfoto-upload via Supabase Storage, meerdere categorieën, verpakkingsopties, uitgebreide productinformatie en sociale deelactie.
- Persistente winkelmand met badge, aantallen wijzigen, regels verwijderen, subtotalen, IVA en totaal.
- Checkout met klantgegevens, fulfilment en betaalvoorkeur.
- Gedeelde beschikbaarheidsregels: `preorder` bestelbaar zonder voorraad, `coming-soon` niet bestelbaar en `available` met inventorytracking gecontroleerd.
- Veilige vertaling van bekende productnamen in publieke kaarten, productdetail, zoeken, cart, account, e-mail en factuur; onbekende namen vallen terug op catalogusdata.

## Bestellingen en klantaccount

- Supabase Auth-registratie, e-mailverificatie, login, logout en wachtwoordherstel.
- Klantprofiel met naam, e-mail, telefoon, adres en leidende taalvoorkeur.
- Server-side prijs-, verpakking-, beschikbaarheids-, voorraad- en IVA-validatie.
- Idempotente ordercreatie met UUID, oplopend nummer `NC-000001`, klantkoppeling en orderregelsnapshot.
- Klantorderhistorie met uitklapbare orderdetails, producten, aantallen, status, betaalstatus, totalen en factuurdownload.
- Transactionele voorraadafboeking bij bevestiging, terugboeking bij annulering en movement-audittrail.

## Admin en backoffice

- Verborgen adminlogin met environmentcredentials en HttpOnly-sessiecookie.
- Dashboard met product-, online-, verborgen- en lagevoorraadtellingen.
- Volledig productbeheer: toevoegen, wijzigen, verwijderen, publiceren, zoeken, filteren, prijzen, IVA, verpakking, voorraad en afbeeldingen.
- Categorieoverzicht, klantoverzicht, leveranciersoverzicht, inkooporderoverzicht, IVA-samenvatting, rapportagekaarten, instellingen en integratieregister.
- Orderoverzicht en responsieve orderdetails met klantgegevens, adres, opmerkingen, regels, verpakking, aantallen, prijzen, IVA en totalen.
- Status, betaalstatus en interne notities wijzigen; bellen, WhatsApp en e-mail openen.
- Voorraadoverzicht en handmatige correcties.

## Facturatie

- Factuurcreatie vanuit factureerbare orders via transactionele databasefunctie.
- Eén normale factuur per order door unieke databaseconstraint; globale oplopende teller met externe notatie `NC-{jaar}-{zes cijfers}`.
- Onveranderlijke klant-, adres-, product-, prijs-, IVA- en betaalmethodesnapshots.
- Professionele Spaans/Engelse PDF met logo, handelsnaam, titular/autónomo, NIF/NIE, factuur- en ordernummer, productregels, IVA per tarief en totalen.
- Beveiligde admin- en klantspecifieke PDF-download.
- Facturenlijst, e-mailstatus en opnieuw verzenden via Resend.

## E-mail en platform

- Branded responsive order-, status- en factuurmails met tekstfallback.
- Adminmelding en klantbevestiging na ordercreatie.
- Statusmails voor bevestigd, betaald, klaar voor afhalen, onderweg, afgeleverd en geannuleerd.
- Mailfalen verwijdert geen order of factuur en wordt aan admin teruggekoppeld.
- Vercel-deployment, Supabase PostgreSQL/Auth/Storage, Resend en Webpack-build zijn ingericht.
- SEO-basis met metadata, canonical, Open Graph, robots en sitemap.

# TODO vóór livegang

Uitsluitend punten die nog daadwerkelijk openstaan voor betrouwbare eerste klantorders:

1. Controleer in Vercel alle vereiste environmentvariabelen voor Production én Preview, zonder waarden in Git te zetten.
2. Bevestig dat alle migraties tot en met `202607080001_payment_method_polish.sql` in productie zijn uitgevoerd.
3. Voer één volledige productieflow uit met een nieuw klantaccount: verificatie, login, checkout, adminbevestiging, voorraadmutatie, factuur, PDF, e-mail, klantdownload en annulering/terugboeking.
4. Controleer Resend-domein, SPF, DKIM, DMARC, API-key en Supabase Custom SMTP; verifieer ontvangst van account-, order-, status- en factuurmails.
5. Vervang de placeholder-bankrekening en bevestig het zakelijke Bizum-nummer in de centrale bedrijfsconfiguratie.
6. Laat fiscale gegevens, factuurlayout, nummerreeks en teksten vóór officieel gebruik controleren door een Spaanse gestor/boekhouder.
7. Maak bezorgminimum, bezorgkosten en leveringsgebied server-side autoritatief of communiceer tijdens de pre-orderfase expliciet dat bezorgkosten handmatig worden bevestigd.
8. Voeg rate limiting/botbescherming toe aan adminlogin, registratie, ordercreatie, profielmutaties en uploads.
9. Richt individuele adminaccounts met MFA of minimaal een operationeel beleid voor credentialrotatie en sessiebeheer in.
10. Voeg geautomatiseerde regressietests en een CI-gate voor lint/build toe; behandel de bekende dependency-auditmeldingen gericht.
11. Beslis of open orders voorraad moeten reserveren; tot die tijd moet admin beschikbaarheid controleren vóór bevestiging.
12. Controleer juridische teksten, privacy/cookiebeleid, bewaartermijnen, allergeneninformatie en consumentenvoorwaarden met passende deskundigen.

## Niet blokkerend voor de eerste gecontroleerde pre-orders

- Volledig inkoopbeheer en goederenontvangst.
- Creditnota's, boekhoudexport en automatische betalingsmatching.
- POS/SumUp/Stripe/WhatsApp Business-integraties.
- Volledig vertaalde leveranciersinhoud en backoffice.
- Product-JSON-LD, uitgebreidere sitemap en geavanceerde rapportages.

## Laatste technische verificatie

Op 8 juli 2026 zijn `npm run lint` en `npm run build` succesvol uitgevoerd op de actuele codebase. Een lokale regressietest bevestigde catalogus, cartvalidatie, orderopslag en adminweergave. De lokale klantmail kon niet opnieuw worden bewezen omdat `RESEND_API_KEY` lokaal ontbrak; externe productiewerking moet daarom expliciet in Vercel/Resend worden gecontroleerd.
