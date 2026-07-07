# Roadmap: Nancy's Castalla

**Peildatum:** 6 juli 2026
**Status:** levende roadmap

Deze roadmap beschrijft de actuele prioriteiten. Gereed werk wordt uit de actieve lijsten verwijderd en vastgelegd in `CHANGELOG.md`. Belangrijke keuzes en motivaties staan in `DECISIONS.md` en `BUSINESS_LOG.md`.

## Nu bezig

### Productiebetrouwbaarheid

- [ ] Controleer alle productie-environmentvariabelen in Vercel zonder geheime waarden te documenteren.
- [ ] Controleer of alle Supabase-migraties in productie zijn uitgevoerd.
- [x] Voer `202607050001_customer_signup_language.sql` uit in productie zodat nieuwe registraties direct de gekozen locale krijgen.
- [ ] Voer `202607060001_preorder_inventory_rules.sql` uit in productie zodat pre-orders bij bevestiging geen fysieke voorraad vereisen of afboeken.
- [ ] Voer `202607060002_order_invoicing.sql` uit in productie voordat facturen worden aangemaakt.
- [ ] Leg Supabase Auth Site URL en redirect-URL's voor `https://www.nancys.es` vast in een operationele checklist.
- [ ] Controleer Resend domeinverificatie, SPF, DKIM, DMARC en SMTP-instellingen.
- [ ] Test registratie, bevestiging, login, wachtwoordherstel en logout end-to-end op productie.
- [ ] Test ordercreatie, e-mails, klantkoppeling, bevestiging, voorraadafboeking en annulering end-to-end.
- [ ] Bevestig het zakelijke Bizum-nummer en vul bankrekeninggegevens in.

### Documentatie en beheer

- [x] Centrale documentatiemap met technisch rapport, business log, roadmap, beslissingen en changelog.
- [ ] Voeg een korte documentatie-updatecheck toe aan de pull-request- of commitwerkwijze.
- [x] Werk README bij zodat deze naar `/docs` verwijst en geen verouderde architectuur beschrijft.

### Klantaccount

- [ ] Toon volledig klantprofiel en maak adresgegevens duidelijk bewerkbaar.
- [ ] Toon orderregels en statushistorie in orderhistorie.
- [x] Zorg dat ingelogde klantgegevens op iedere bestelplek consequent vooraf worden ingevuld.
- [ ] Voeg duidelijke feedback toe wanneer profiel- of orderdata niet kan worden geladen.

### Winkelmand en checkout

- [x] Persistente lokale winkelmand met badge, aantallen, verwijderen en locale-routes.
- [x] Server-authoritatieve cartvalidatie voor prijzen, btw, verpakking en voorraadstatus.
- [x] Pre-order altijd bestelbaar; coming-soon geblokkeerd; beschikbare tracked voorraad gecontroleerd.
- [ ] Productie-orderflow met echte klantdata end-to-end uitvoeren na de nieuwe voorraadmigratie.

## Daarna

### Security en kwaliteit

- [ ] Rate limiting op adminlogin, registratie, ordercreatie, profielmutaties en uploads.
- [ ] Botbescherming/CAPTCHA waar misbruik waarschijnlijk is.
- [ ] Individuele adminaccounts met rollen en MFA.
- [ ] Auditlog voor admin- en voorraadacties.
- [ ] Security headers, waaronder CSP en framebeleid.
- [ ] Uniforme requestvalidatie, bij voorkeur met een schema-validatiebibliotheek.
- [ ] Geautomatiseerde lint-, build-, unit-, integratie- en smoke-tests in CI.
- [ ] Dependency-audit uitvoeren en kwetsbaarheden gericht oplossen.

### Orders en voorraad

- [x] Volledige responsieve admin-orderdetails met klant, regels, btw-totalen en contactacties.
- [x] Interne orderfacturen met snapshots, PDF, klantdownload en Resend-verzending.
- [ ] Formele order-state-machine met toegestane overgangen.
- [ ] Voorraadreservering of expliciet per product instelbaar reserveringsbeleid.
- [ ] Handmatige voorraadcorrectie in één database-transactie/RPC.
- [ ] Orderstatushistorie en interne notities.
- [ ] Creditnota's en formele factuurcorrecties.
- [ ] Apart afleveradres-snapshot op de order.
- [ ] WhatsApp-orders eenvoudig handmatig registreren of later via Business API importeren.
- [ ] Duidelijke afhandeling van onvoldoende voorraad in klant- en adminscherm.

### Bezorging

- [ ] Bezorgminimum en bezorgkosten server-side berekenen en afdwingen.
- [ ] Bezorgzones/postcodes en afstandscontrole modelleren.
- [ ] Besluit nemen over gratis bezorging in Castalla en eventuele orderdrempel.
- [ ] Levermomenten en capaciteit toevoegen.

### Performance en SEO

- [ ] Productdetail rechtstreeks op productcode queryen, zonder volledige catalogusload.
- [ ] Categorie- en zoekfilters server-side uitvoeren.
- [ ] Publieke cataloguspaginering toevoegen.
- [ ] Database-indexen voor zichtbaarheid, categorieën en zoeken toevoegen.
- [ ] Productafbeeldingen optimaliseren met thumbnails en responsive formaten.
- [ ] Product- en categorie-URL's aan sitemap toevoegen.
- [ ] JSON-LD voor LocalBusiness, Product, Offer en BreadcrumbList.
- [ ] Correcte HTML-taal per locale.

## Later

### Inkoop en leveranciers

- [ ] Volledig leveranciersbeheer met contact- en leveringsvoorwaarden.
- [ ] Inkooporderregels.
- [ ] Goederenontvangst per product.
- [ ] Automatische voorraadverhoging na ontvangst.
- [ ] Lagevoorraadmeldingen en bestelvoorstellen.
- [ ] Lots, houdbaarheidsdatum en opslaglocatie.

### Facturatie en betalingen

- [ ] Factuurregels en fiscale snapshots.
- [ ] Factuur-PDF, nummerreeksen en creditnota's.
- [ ] Spaanse IVA-/factuureisen laten valideren.
- [ ] Boekhoudexport of providerkoppeling.
- [ ] SumUp of andere kaartbetaling selecteren.
- [ ] Payment webhooks en automatische betaalstatus.
- [ ] Stripe alleen activeren als dit zakelijk en operationeel gewenst is.

### Communicatie en integraties

- [ ] Transactionele e-mailoutbox, retries en eventhistorie.
- [ ] Meertalige account- en ordermails.
- [ ] Reply-To en bounce/complaint monitoring.
- [ ] WhatsApp Business API.
- [ ] POS/kassa en gedeelde voorraad.
- [ ] Leveranciers-, verzend- en boekhoudintegraties.
- [ ] Versioned externe API met partnerauthenticatie.

### Internationalisatie en compliance

- [ ] Volledige vertaling van publieke, juridische en accountteksten.
- [ ] Productvertalingen in de database.
- [ ] Besluit over aanvullende Scandinavische talen naast `sv`.
- [ ] Allergenen- en foodinformatie juridisch controleren.
- [ ] GDPR-proces voor export, correctie, verwijdering en bewaartermijnen.

## Ideeën

- [ ] Herhaalbestelling vanuit klantaccount.
- [ ] Verlanglijst en meldingen wanneer pre-orders openen.
- [ ] Productlabels/barcodes printen vanuit admin.
- [ ] Google Merchant-productfeed.
- [ ] PWA of mobiele app.
- [ ] Klantsegmentatie zonder marketingtoestemming te vermengen met transactionele mail.
- [ ] Vraagvoorspelling en analyse van marge, omloopsnelheid en verspilling.
- [ ] Afhaaltijdsloten en bezorgrouteplanning.

## Definition of done voor belangrijke wijzigingen

Een belangrijke wijziging is pas gereed wanneer:

1. Functionaliteit en foutpaden zijn gecontroleerd.
2. `npm run lint` slaagt.
3. `npm run build` slaagt.
4. Relevante tests zijn toegevoegd of uitgevoerd.
5. Relevante bestanden in `/docs` zijn bijgewerkt.
6. Nieuwe environmentvariabelen en externe dashboardstappen zijn gedocumenteerd zonder secrets op te nemen.
7. De wijziging als kleine, duidelijke Git-commit is vastgelegd.
