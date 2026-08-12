# Projectstatus: Nancy's Castalla

**Peildatum:** 30 juli 2026
**Fase:** productie-MVP / pre-orderfase
**Productiedomein:** `https://www.nancys.es`
**Bronnen voor deze status:** volledige Git-geschiedenis vanaf de eerste webshopcommit, actuele routes, services, migraties en documentatie.

## Status in één oogopslag

Nancy's Castalla heeft een werkende meertalige catalogus, persistente winkelmand, server-gevalideerde bestelaanvraag, Supabase-klantaccounts, beveiligde backoffice, transactionele voorraadmutaties en interne Spaanse facturatie. De softwarebasis is geschikt voor gecontroleerde pre-orders. Volledig onbeheerde productie is nog niet verstandig totdat de externe configuratie en complete liveflow opnieuw op productie zijn getest en de hieronder genoemde operationele punten zijn afgehandeld.

| Gebied | Status | Toelichting |
|---|---|---|
| Publieke webshop | Operationeel | Home, categorieën, zoeken, productdetail, winkelmand en checkout bestaan in vijf locales. |
| Pre-orders | Operationeel | Pre-order is bestelbaar bij voorraad nul; coming-soon is geblokkeerd. |
| Klantaccount | Operationeel | Registratie loopt via de centrale serverroute, toont een duidelijke bevestigings- en spammapmelding, ondersteunt resend na 60 seconden, en bevat login, herstel, profiel, orderhistorie, orderdetails en eigen factuurdownload. Accountbevestigingsmail blijft afhankelijk van Supabase SMTP/Resend/DNS-configuratie. |
| Orders | Operationeel | Serverprijzen, IVA, idempotency, orderregels, ordernummer, klantkoppeling en adminbeheer. Admin kan orderregels corrigeren voordat betaling is ontvangen, levering definitief is of een verzonden/betaalde factuur bestaat. E-mail is secundair en blokkeert orderopslag niet. |
| Voorraad | Operationeel met beperking | Afboeken bij bevestiging en terugboeken bij annulering; geen reservering tijdens status `new`. |
| Facturatie | Operationeel voor normale facturen | Maximaal één actieve factuur per order, snapshots, Spaans/Engelse PDF, admin- en klantdownload, e-mail. Een nog niet verzonden/onbetaalde factuur kan via een gecontroleerde adminactie op `void` worden gezet voor ordercorrectie; nummer en regels blijven historisch zichtbaar en worden niet hergebruikt. |
| E-mail | Operationeel mits extern geconfigureerd | Resend voor order/factuur met professionele responsive HTML, plain-text fallback en correcte Reply-To; Supabase SMTP voor accountmail; geen queue of automatische retry. |
| Admin | Gemengd | Producten, orders, voorraad en facturen functioneel; Orders/Customers laden backwards-compatible wanneer cleanupkolommen in productie nog ontbreken en tonen altijd JSON-fouten met diagnose-id. Inkoop, leveranciersfacturen, goederenontvangst en rapportages zijn lokaal toegevoegd en wachten op handmatige migratie `202608120001_purchasing_supplier_invoice_workflow.sql`. |
| Leveranciersimport | Operationeel voor draftimport | Migratie `202607120001` staat live. Tindale, Europ Foods, De Hollandse Bakker en Messiaen-lijsten kunnen veilig als draft/importbatch worden vastgelegd met supplier offers, reviewflags en zonder publieke verkoopprijs. Tindale blijft bewust offline zolang ophalen in La Nucia nodig is; importproducten blijven draft tot handmatige review. |
| Sales-unit prijsveiligheid | Code gereed, productiecontrole nodig | Geïmporteerde leveranciersproducten moeten expliciet sales unit en prijsbasis bevestigd hebben voordat ze publiek zichtbaar of bestelbaar zijn. Meer-unit verpakkingen worden server-side als effectieve units berekend. |
| Europ Foods/Eurodrop prijsreview | Lopend | Eurodrop is referentiebron voor Europ Foods-consumentenprijzen. Alleen betrouwbare matches krijgen `Eurodrop + EUR 0,10`; onzekere records blijven zonder verkoopprijs/review. De audit van 28 juli telt 107 verwerkt en 220 reviewrecords. |
| Betaling | Handmatig | Alleen Bizum en bankoverschrijving zijn zichtbaar/selecteerbaar voor klanten. Stripe, kaart en contant staan niet actief in de klantflow. |
| Bezorging | Gedeeltelijk | Beleid wordt getoond, maar minimum, radius en fee zijn niet volledig server-authoritatief. |
| Tests/CI | Onvoldoende geautomatiseerd | Lint en build slagen; geen vaste geautomatiseerde regressiesuite of CI-gate. |

# Afgeronde mijlpalen

## Webshop

- Next.js App Router-webshop met responsive merkstijl en locales `en`, `nl`, `de`, `es`, `sv`.
- Homepage, categorieoverzicht, categoriepagina, zoeken, filters en productdetail op stabiele `NC-xxxxx`-productcode.
- Publieke catalogus toont uitsluitend producten met lifecycle-status `active` en `is_visible=true`; gearchiveerde, disabled en draftproducten blijven uit de shop.
- Productzoekvelden filteren live en doorzoeken productnaam, vertaalde categorienamen, zichtbare productomschrijving en productcode.
- Productfoto-upload via Supabase Storage, meerdere categorieën, verpakkingsopties, uitgebreide productinformatie en sociale deelactie.
- Persistente winkelmand met badge, aantallen wijzigen, regels verwijderen, duidelijke verpakkingslabels, subtotalen, IVA en totaal.
- Checkout met klantgegevens, fulfilment en betaalvoorkeur; bij afhalen wordt geen bezorgadres getoond, bij lokale bezorging wel.
- Gedeelde beschikbaarheidsregels: `preorder` bestelbaar zonder voorraad, `coming-soon` niet bestelbaar en `available` met inventorytracking gecontroleerd.
- Veilige vertaling van bekende productnamen en klantgerichte productbeschrijvingen in publieke kaarten, productdetail, zoeken, cart, account, e-mail en factuur; onbekende niet-vertaalde beschrijvingen vallen per locale terug op een korte vertaling-volgt-melding in plaats van willekeurige leveranciersspraak.

## Bestellingen en klantaccount

- Supabase Auth-registratie via `POST /api/auth/register`, e-mailverificatie, resend van bevestigingsmail met 60 seconden wachttijd, login, logout en wachtwoordherstel.
- Klantprofiel met naam, e-mail, telefoon, adres en leidende taalvoorkeur.
- Server-side prijs-, verpakking-, beschikbaarheids-, voorraad- en IVA-validatie.
- Idempotente ordercreatie met UUID, oplopend nummer `NC-000001`, klantkoppeling en orderregelsnapshot. Een order wordt alleen als opgeslagen behandeld wanneer een echte database-id en ordernummer bevestigd zijn; null-idempotency-success wordt geblokkeerd en als serverfout teruggegeven.
- Orderopslag blijft werken wanneer e-mail faalt; e-mails worden pas gestart na bevestigde order-id en ordernummer. De checkout toont specifieke foutmeldingen voor onder meer verouderde verpakkingen, ontbrekende gegevens, onbevestigde opslag en tijdelijke serviceproblemen. De API geeft bij fouten een diagnose-id en backendmelding terug en kan bij herstelbare RPC-problemen direct via de service-role REST API opslaan.
- Klantorderhistorie met uitklapbare orderdetails, producten, verpakkingen, aantallen, status, betaalstatus, totalen en factuurdownload.
- Transactionele voorraadafboeking bij bevestiging, terugboeking bij annulering en movement-audittrail.

## Admin en backoffice

- Verborgen adminlogin met environmentcredentials en HttpOnly-sessiecookie.
- Dashboard met product-, online-, verborgen- en lagevoorraadtellingen.
- Volledig productbeheer: toevoegen, wijzigen, verwijderen, publiceren, zoeken, filteren, prijzen, IVA, verpakking, voorraad, afbeeldingen en productdetails zoals ingrediënten/allergenen, bereidingswijze en bewaaradvies. Op mobiel is er een compacte `Snel product toevoegen`-drawer die standaard bestaande geïmporteerde leveranciersproducten zoekt en afwerkt, met handmatig nieuw product als aparte secundaire optie.
- Productarchivering voor livegang: oude catalogus kan in bulk naar `archived` onder batch `IMPORT_2026_PRELAUNCH`, zonder producten, afbeeldingen, categorieën, codes, relaties of voorraadhistorie te verwijderen.
- Vervolg-migratie `202607110003_product_catalogue_conflict_protection.sql` bereidt bescherming voor tegen gewone database-updates op archived producten; oude importbestanden of toekomstige importtools mogen ze niet stil overschrijven of heractiveren. Supplier code en EAN zijn duplicaatsignalen, geen unieke productsleutels.
- Productbeheer toont standaard alleen actieve producten en heeft filters voor Active, Archived, Disabled, Draft en All; individuele archived producten kunnen veilig worden hersteld.
- Productbeheer toont in de lijst directe kwaliteitsindicatoren voor foto, prijs, omschrijving, ingrediënten en IVA. Filters helpen om actieve producten zonder prijs, foto, omschrijving of ingrediënten snel te vinden.
- Supplier Imports-module toegevoegd voor Europ Foods PDF en Tindale XLS/XLSX: leverancier selecteren, batchnaam, dry-run preview, conflicten/waarschuwingen, importgeschiedenis, confirmed import naar draft, publish approved batch en veilige rollback naar draft/archive.
- `IMPORT_2026_LIVE_TINDALE_JULY` is in productie als draft geïmporteerd: 924 producten, 924 supplier offers, geen voorraadmutaties en geen live publicatie.
- Tindale-producten blijven offline en worden door migratie `202607250001_keep_tindale_products_offline.sql` op `draft` en `is_visible=false` gehouden; Tindale-batches mogen niet via batchpublicatie online komen zolang ophalen in La Nucia nodig is.
- `IMPORT_2026_LIVE_EUROPFOODS_JULY` is in productie als draft geïmporteerd: 713 veilige unieke producten, 713 supplier offers, 466 regels overgeslagen/conflict-review en 483 conflictregels.
- Europ Foods-conflictlogica is aangescherpt: verschillende supplier codes of verpakkingen worden als geldige varianten behandeld, terwijl exacte herhalingen geen dubbele Nancy-producten maken en dezelfde supplier code met afwijkende naam/verpakking/prijs conflict-review blijft.
- Supplier Imports heeft een herstelpaneel voor bestaande Europ Foods-conflicten. Pending conflictregels kunnen opnieuw worden geclassificeerd en geselecteerde importeerbare varianten kunnen alsnog als nieuwe hidden draftproducten met nieuwe NC-codes worden aangemaakt.
- Sales-unit prijsveiligheid is toegevoegd na de Magners-controle: leveranciersdoosprijs, bron-eenheidsprijs en publieke verkoopeenheid worden apart opgeslagen en geïmporteerde producten blijven onzichtbaar/onbestelbaar totdat verpakking en prijsbasis expliciet zijn bevestigd.
- Nieuwe importarchitectuur voorbereid met `product_import_runs`, `supplier_product_offers`, reviewvelden, transactionele Nancy-productcode-reservering vanaf de actuele hoogste `NC-xxxxx`, en batch-RPC's voor publiceren/rollback.
- Op 30 juli 2026 zijn drie extra actuele leverancierslijsten als draft/onzichtbaar geïmporteerd zonder verkoopprijzen of voorraadmutaties: `IMPORT_2026_LIVE_HOLLANDSE_BAKKER_JULY` met 73 producten/offers, `IMPORT_2026_LIVE_MESSIAEN_BEER_JULY` met 60 producten/offers en `IMPORT_2026_LIVE_MESSIAEN_FOOD_JULY` met 386 producten/offers. Messiaen Food heeft 8 supplier-codeconflicten in `product_import_conflicts`; 1 exacte herhaalde bronregel is niet dubbel aangemaakt.
- Categorieoverzicht, klantoverzicht, leveranciersoverzicht, inkooporderoverzicht, IVA-samenvatting, rapportagekaarten, instellingen en integratieregister.
- Orderoverzicht en responsieve orderdetails met klantgegevens, adres, opmerkingen, regels, verpakking, aantallen, prijzen, IVA en totalen.
- Status, betaalstatus en interne notities wijzigen; bellen, WhatsApp en e-mail openen.
- Ordercorrectie vóór definitieve facturatie: admins gebruiken één zichtbare knop `Order aanpassen`, waarna een nog niet verzonden/onbetaalde factuur intern veilig wordt ingetrokken en een legacy `inventory_committed`-vlag zonder movements intern wordt hersteld. Daarna kunnen orderregels worden verwijderd, aantallen gewijzigd en vervangende actieve producten gezocht/toegevoegd. De browser stuurt alleen productcode, verpakking en aantal; de server rekent actuele prijs, gekozen verpakking, IVA en totalen opnieuw uit en schrijft auditmetadata. Meer-unit verpakkingen zoals `12 stuks` worden server-side gevalideerd tegen de actuele package options en via effectieve units berekend.
- Een ingetrokken factuur blijft met nummer en regels zichtbaar in historie; na correctie maakt de admin via `Order definitief maken en factuur aanmaken` een nieuwe factuur met nieuw nummer. Definitief verzonden/betaalde/geleverde orders blijven vergrendeld.
- Compact orderbeheer met zoeken, statusfilter, betaalfilter, datumfilter en onderscheid tussen echte, test- en gearchiveerde orders.
- Klantenbeheer met detailweergave, zoeken, filters voor actief/gearchiveerd/test/met account/zonder account, archiveren, testmarkering en veilige deleteblokkades.
- Klanten- en orderbeheer gebruiken veilige JSON-responses met `diagnosticId` en vallen terug op basisvelden wanneer productie nog niet alle cleanup-/factuurseriekolommen bevat; data wordt in dat geval niet gewijzigd.
- Facturenbeheer met filters voor productie, test, gearchiveerd en geannuleerd; facturen kunnen worden gemarkeerd als test of gearchiveerd zonder nummering te wijzigen.
- Voorraadoverzicht en handmatige correcties.

## Facturatie

- Factuurcreatie vanuit factureerbare orders via transactionele databasefunctie.
- Maximaal één actieve normale factuur per order; historische `void`-facturen blijven gekoppeld zichtbaar en krijgen nooit een hergebruikt nummer. De globale teller gebruikt externe notatie `NC-{jaar}-{zes cijfers}`.
- Onveranderlijke klant-, adres-, product-, prijs-, IVA- en betaalmethodesnapshots.
- Professionele Spaans/Engelse PDF met logo, handelsnaam, titular/autónomo, NIF/NIE, factuur- en ordernummer, productregels, IVA per tarief en totalen.
- Beveiligde admin- en klantspecifieke PDF-download.
- Facturenlijst, e-mailstatus en opnieuw verzenden via Resend.
- Nieuwe factuurseries voorbereid: `TEST-{jaar}-{zes cijfers}` voor prelaunch/test en `NC-{jaar}-{zes cijfers}` voor live productie. Bestaande factuurnummers blijven intact en worden nooit automatisch hergebruikt of hernummerd.
- Admin-auditlog voorbereid voor cleanupacties zoals archiveren, testmarkeren en veilige testorderverwijdering.

## E-mail en platform

- Branded responsive order-, status- en factuurmails met logo, ordertabellen, betaalinformatie, contactknoppen, WhatsApp, website, Facebook, correcte Reply-To en tekstfallback.
- Adminmelding en klantbevestiging na ordercreatie.
- Statusmails voor bevestigd, betaald, klaar voor afhalen, onderweg, afgeleverd en geannuleerd.
- Mailfalen verwijdert geen order of factuur en wordt aan admin teruggekoppeld.
- Vercel-deployment, Supabase PostgreSQL/Auth/Storage, Resend en Webpack-build zijn ingericht.
- SEO-basis met metadata, canonical, Open Graph, robots en sitemap.
- Complete faviconset toegevoegd op basis van het bestaande Nancy's Castalla-logo: browserfavicon, Apple touch icon, Android icons, webmanifest en donkergroene theme-color.

# TODO vóór livegang

Uitsluitend punten die nog daadwerkelijk openstaan voor betrouwbare eerste klantorders:

Aanvullende productiecontrole 12 juli 2026: Orders en Customers laden nu ook wanneer productie nog cleanup-/factuurseriekolommen uit `202607110001_admin_cleanup_and_invoice_series.sql` mist. Test-/archiefacties en nieuwe factuurserievelden blijven in dat geval beperkt totdat die migratie bewust in Supabase productie is uitgevoerd.

1. Controleer in Vercel alle vereiste environmentvariabelen voor Production én Preview, zonder waarden in Git te zetten.
2. Werk de Europ Foods/Eurodrop-reviewlijst af: 220 niet-bevestigde records hebben nog handmatige match-, prijs-, verpakking-, IVA-, categorie- en beeldcontrole nodig. Houd Tindale-producten offline zolang ophalen in La Nucia nodig is.
3. Voer één volledige productieflow uit met een nieuw klantaccount: verificatie, login, checkout, adminbevestiging, voorraadmutatie, factuur, PDF, e-mail, klantdownload en annulering/terugboeking.
4. Controleer Resend-domein, SPF, DKIM, DMARC, API-key en Supabase Custom SMTP; verifieer ontvangst van account-, order-, status- en factuurmails.
5. Controleer operationeel met Nancy/boekhouder dat betalingen daadwerkelijk binnenkomen via Bizum `+34 644 21 22 57` en bankrekening `ES89 2100 1460 6002 0010 3972`.
6. Laat fiscale gegevens, factuurlayout, nummerreeks en teksten vóór officieel gebruik controleren door een Spaanse gestor/boekhouder.
7. Maak bezorgminimum, bezorgkosten en leveringsgebied server-side autoritatief of communiceer tijdens de pre-orderfase expliciet dat bezorgkosten handmatig worden bevestigd.
8. Voeg rate limiting/botbescherming toe aan adminlogin, registratie, ordercreatie, profielmutaties en uploads.
9. Richt individuele adminaccounts met MFA of minimaal een operationeel beleid voor credentialrotatie en sessiebeheer in.
10. Voeg geautomatiseerde regressietests en een CI-gate voor lint/build toe; behandel de bekende dependency-auditmeldingen gericht.
11. Beslis of open orders voorraad moeten reserveren; tot die tijd moet admin beschikbaarheid controleren vóór bevestiging.
12. Controleer juridische teksten, privacy/cookiebeleid, bewaartermijnen, allergeneninformatie en consumentenvoorwaarden met passende deskundigen.
13. Gebruik het Europ Foods recovery-paneel om geldige overgeslagen varianten als draft te importeren, los daarna resterende importconflicten en reviewflags op, en publiceer alleen producten met gecontroleerde verkoopprijs, IVA, categorie, verpakking, sales unit en prijsbasis.
14. Voer migratie `202607120002_sales_unit_price_basis_safety.sql` handmatig uit in Supabase productie zodat databasepublicatie dezelfde sales-unit prijsveiligheid afdwingt als de applicatiecode.
15. Voer migratie `202607250001_keep_tindale_products_offline.sql` handmatig uit in Supabase productie als deze nog niet aantoonbaar live staat, zodat Tindale-producten offline blijven en Tindale-batches niet per ongeluk gepubliceerd kunnen worden.
16. Voer na publicatie van een kleine Europ Foods-selectie een echte cart/order-smoketest uit met Bizum en bankoverschrijving.
17. Review de nieuwe batches `IMPORT_2026_LIVE_HOLLANDSE_BAKKER_JULY`, `IMPORT_2026_LIVE_MESSIAEN_BEER_JULY` en `IMPORT_2026_LIVE_MESSIAEN_FOOD_JULY`: verkoopprijs, IVA, categorie, verpakking/sales unit, afbeelding en vertaling moeten handmatig worden gecontroleerd voordat iets gepubliceerd mag worden.

## Niet blokkerend voor de eerste gecontroleerde pre-orders

- Handmatige productie-uitvoering en verificatie van `202608120001_purchasing_supplier_invoice_workflow.sql` voor inkoopbeheer en goederenontvangst.
- Creditnota's, boekhoudexport en automatische betalingsmatching.
- POS/SumUp/Stripe/WhatsApp Business-integraties.
- Volledig vertaalde leveranciersinhoud en backoffice.
- Product-JSON-LD, uitgebreidere sitemap en geavanceerde rapportages.

## Laatste technische verificatie

Op 9 juli 2026 is de registratieflow aangepast om Supabase-signup via de centrale serverroute te laten lopen, zodat de bevestigingslink de productiebase-URL en locale gebruikt. De productdetail-bestelkaart rendert geen tweede productfoto meer, om Android/Chrome overlap bij onder andere Potato Scones te voorkomen. De checkout is getest met actuele Potato Scones-verpakking: Collection is opgeslagen als `NC-000008`, Local delivery als `NC-000009`, en een verouderde verpakking geeft nu `package_unavailable` met een duidelijke boodschap. Daarna is extra testerfeedback verwerkt: registratie wist velden na succes, toont expliciet inbox/spammap, biedt resend na 60 seconden, het accountdashboard heeft een sessie-fallback wanneer profieldata traag of afwezig is, en Nederlandse productkaarten/details tonen geen Engelse of Spaanse leveranciersomschrijvingen meer maar Nederlandse bekende teksten of `Vertaling volgt binnenkort`. Een mobiele productlijstcontrole op 390px breed gaf geen horizontale overflow en geen browserconsole-errors. Een live-productietest liet zien dat `POST /api/cart/validate` werkte maar `POST /api/orders` op de live deployment 500 terugstuurde met alleen `order_failed`; de repository is daarop uitgebreid met staplogging, diagnose-id, echte foutmelding in de API-response en een REST-fallback wanneer de order-RPC in productie faalt of achterloopt. Lokaal is na deze patch een testorder opgeslagen als `NC-000012`. Op 10 juli 2026 zijn uitsluitend frontend-UX-verbeteringen toegevoegd: zoeken doorzoekt nu ook locale-categorieën en zichtbare omschrijvingen, verpakkingsinformatie staat duidelijker op productkaarten, productdetail, winkelmand en klantorderdetails, en het checkoutformulier verbergt het bezorgadres bij afhalen. `npm run lint` en `npm run build` zijn succesvol uitgevoerd.

Op 12 juli 2026 is de veilige leveranciersimportworkflow voorbereid met een nieuwe migratie, server-side PDF/XLS(X)-parsers, admin dry-run preview, confirmed import naar draft, batchpublicatie/rollback en faviconset. Productiecontrole bevestigde dat migratie `202607120001_supplier_import_workflow.sql` live staat. Tindale is geïmporteerd als 924 draftproducten en 924 supplier offers vanaf `NC-01581`. Europ Foods geeft geen JSON-crash meer, gebruikt compacte JSON-responses en is geïmporteerd als 713 veilige draftproducten en 713 supplier offers vanaf `NC-02505`; 466 regels bleven in skip/conflict-review. De twee oude actieve prelaunchproducten `NC-00001` en `NC-00002` zijn veilig gearchiveerd. Daarna is de Europ Foods-conflictlogica gecorrigeerd zodat varianten zoals `8775 MAGNERS CIDER 24x500ml` en `8780 MAGNERS CIDER 12x568ml` apart als drafts kunnen worden geïmporteerd, terwijl exacte herhalingen en echte supplier-codeconflicten gescheiden blijven. `npm run lint` en `npm run build` zijn succesvol uitgevoerd.

Een laatste read-only productiecontrole op 12 juli 2026 telde 13 Supabase Auth-users, 22 customers, 18 orders, 42 orderregels, 9 facturen en 31 factuurregels. Er zijn geen ontbrekende auth-koppelingen, verweesde orders, verweesde orderregels of verweesde facturen gevonden. Productie mist nog cleanup-/factuurserievelden uit `202607110001_admin_cleanup_and_invoice_series.sql`; de admin-API's voor Customers en Orders zijn daarom backwards-compatible gemaakt met fallbackselecties, veilige JSON-foutvormen en `diagnosticId`. De applicatie staat standaard in live-businessmode tenzij `BUSINESS_MODE=prelaunch` expliciet in de omgeving staat. `npm run lint` en `npm run build` zijn succesvol uitgevoerd.

Op 12 juli 2026 is een urgente prijs-/verpakkingscontrole uitgevoerd op actieve zichtbare producten uit `IMPORT_2026_LIVE_%`. Twee Magners-producten stonden publiek met leverancierdoosverpakking maar een verkoopprijs rond bron-eenheidsprijs: `NC-03174 MAGNERS CIDER DARK FRUIT 24x440ml` en `NC-03292 MAGNERS CIDER 24x500ml`. Beide zijn in productie teruggezet naar `draft`, `is_visible=false`, `featured=false`, `ready_for_publish=false` en `needs_package_review=true`. De code is uitgebreid zodat geïmporteerde producten niet publiek of bestelbaar zijn zonder expliciete bevestiging van sales unit en prijsbasis. De aanvullende database-migratie `202607120002_sales_unit_price_basis_safety.sql` moet nog handmatig in Supabase worden uitgevoerd voor database-level bescherming.

Op 13 juli 2026 is het bestaande productbeheer uitgebreid en daarna gecorrigeerd met mobiele snelle productinvoer op `/{locale}/admin/products`. De primaire flow is nu `Uit leverancierslijst`: de admin kiest een leverancier, zoekt server-side in bestaande imported products met supplier offer, selecteert het bestaande product en werkt prijs, IVA, categorie, foto, beschrijving, type en beschikbaarheid af zonder nieuwe NC-code, supplier offer of importrecord te maken. De secundaire optie `Nieuw handmatig product` blijft bedoeld voor producten die niet in leverancierslijsten staan. De drawer gebruikt dezelfde products-tabel, foto-upload en product-create API, zonder databasewijzigingen. `npm run lint` en `npm run build` zijn succesvol uitgevoerd.

Op 16 juli 2026 is een publieke i18n-audit uitgevoerd zonder productdata of Supabase-records te wijzigen. Verouderde teksten die nog spraken over geen checkout, geen database en geen accounts zijn vervangen door de actuele orderrequest/cart-flow. De Zweedse/Scandinavische klantteksten zijn aangevuld met natuurlijk Zweeds, checkout-foutmeldingen komen nu volledig uit het cart-woordenboek, en de productnaam-/beschrijvingshelpers herkennen meer veilige importvarianten zonder onbekende producten automatisch te vertalen. `npm run lint` voert nu eerst een automatische i18n-structuurcontrole uit; `npm run lint` en `npm run build` zijn succesvol uitgevoerd.

Op 18 juli 2026 is admin-ordercorrectie voorbereid en daarna in productie gemigreerd voor de pre-orderpraktijk. Orders zijn aanvraagregels totdat Nancy beschikbaarheid, vervanging, verpakking, prijzen en IVA heeft gecontroleerd. De backoffice kan orderregels vóór definitieve facturatie server-side vervangen of aanpassen, inclusief productzoekactie en auditreden. De zichtbare UI gebruikt één knop `Order aanpassen`; een nog niet verzonden/onbetaalde factuur wordt intern op `void` gezet, factuur en invoice_items blijven bestaan, de factuursnapshot wordt in de auditlog bewaard en het factuurnummer wordt niet hergebruikt.

Aanvulling 18 juli 2026: dezelfde migratie onderscheidt nu twee voorraadcorrecties. Normale voorraadcommits met aantoonbare negatieve `sale`-movements kunnen via positieve `correction_release`-movements worden teruggeboekt voordat orderregels worden gecorrigeerd. Legacy/bug-orders met `inventory_committed=true` maar exact nul `inventory_movements` krijgen een aparte adminactie die alleen de foutieve commit-vlag reset, zonder productvoorraad of movements te wijzigen, en dit volledig audit met orderregels, stocksnapshot, actor en reden.

Op 28 juli 2026 is de Europ Foods/Eurodrop-prijsreview gedocumenteerd als vaste werkwijze. Eurodrop-consumentenprijzen mogen alleen op Europ Foods-producten worden toegepast bij betrouwbare matches; Nancy's verkoopprijs is dan `Eurodrop + EUR 0,10` inclusief IVA. Onzekere matches, afwijkende verpakking, ontbrekende foto/omschrijving/ingrediënten/allergenen of twijfel over IVA blijven reviewwerk. De gegenereerde audit `outputs/europfoods-eurodrop-final-audit-20260728.*` controleerde 327 records: 327 gevonden, 0 duplicaat-/supplierconflicten, 107 verwerkt, 220 niet bevestigd, 326 zonder echte foto, 210 zonder bruikbare beschrijving en 263 zonder ingrediënten.

Op 30 juli 2026 is onderzocht waarom na losse Tindale-fotokoppelingen verkoopprijzen zichtbaar waren. De betrokken producten hadden hun verkoopprijzen al vóór de foto-import in de database of waren eerder via expliciete Tindale-prijsopdrachten geprijsd; de foto-import-PATCHes wijzigden alleen `image_url` en `images`. Voor toekomstige losse fotobatches is `scripts/link-product-photos.mjs` toegevoegd met een harde allowlist: standaard alleen afbeeldingsvelden, en alleen bij expliciete `--activate` ook `product_status`/`is_visible`. Prijs, IVA, verpakking, voorraad, categorie, beschrijving en suppliermetadata mogen nooit via foto-import worden aangepast.

Op 4 augustus 2026 is de Tindale-map `JUICES & CONCENTRATE` opnieuw als foto-only batch verwerkt met `scripts/link-product-photos.mjs`. De verwerking koppelde 61 afbeeldingen aan bestaande Tindale-producten en wijzigde uitsluitend `image_url` en `images`; prijzen, IVA, verpakking, voorraad, categorie, productnaam, beschrijvingen en zichtbaarheid zijn niet aangepast. De volgende aangeleverde bestanden hadden geen exacte productmatch op `supplier=Tindale` + `supplier_code` en moeten handmatig worden gecontroleerd voordat er een foto kan worden gekoppeld:

| Supplier | Supplier code | Filename | Resultaat | Vervolgactie |
| --- | --- | --- | --- | --- |
| Tindale | 10937 | `10937.1.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |
| Tindale | 10939 | `10939.1.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |
| Tindale | 10941 | `10941.1.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |
| Tindale | 57066 | `57066.1.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |
| Tindale | 57067 | `57067.1.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |

Op 4 augustus 2026 zijn de Tindale-mappen `sparkling wines` en `SPIRITS & VARIOUS` als foto-only batches verwerkt met `scripts/link-product-photos.mjs`. De verwerking koppelde 16 afbeeldingen aan bestaande Tindale-producten en wijzigde uitsluitend `image_url` en `images`; prijzen, IVA, verpakking, voorraad, categorie, productnaam, beschrijvingen en zichtbaarheid zijn niet aangepast. Alle 4 sparkling-wines bestanden zijn gekoppeld. De volgende aangeleverde spirits/various-foto had geen exacte productmatch op `supplier=Tindale` + `supplier_code`:

| Supplier | Supplier code | Filename | Resultaat | Vervolgactie |
| --- | --- | --- | --- | --- |
| Tindale | 13516 | `13516.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |

Op 4 augustus 2026 is de Tindale-map `DRINKS - SOFT DRINKS` als foto-only batch verwerkt met `scripts/link-product-photos.mjs`. De verwerking koppelde 51 aangeleverde afbeeldingsbestanden aan bestaande Tindale-producten en wijzigde uitsluitend `image_url` en `images`; prijzen, IVA, verpakking, voorraad, categorie, productnaam, beschrijvingen en zichtbaarheid zijn niet aangepast. Drie niet-numerieke bestandsnamen zijn expliciet gemapt: `cherry coke 330ml.1.jpg-600x600.jpg` naar supplier code `10919`, `dr pepper.1.jpg-600x600.jpg` naar supplier code `10905`, en `+.jpg` naar supplier code `57096`. De volgende aangeleverde soft-drinks-foto's hadden geen exacte productmatch op `supplier=Tindale` + `supplier_code`:

| Supplier | Supplier code | Filename | Resultaat | Vervolgactie |
| --- | --- | --- | --- | --- |
| Tindale | 119136 | `119136.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |
| Tindale | 56195 | `56195.1.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |

Op 4 augustus 2026 zijn de Tindale-mappen `ciders`, `cereals` en `breads and naan` als foto-only batches verwerkt met `scripts/link-product-photos.mjs`. De verwerking koppelde 23 afbeeldingen aan bestaande Tindale-producten en wijzigde uitsluitend `image_url` en `images`; prijzen, IVA, verpakking, voorraad, categorie, productnaam, beschrijvingen en zichtbaarheid zijn niet aangepast. Vier niet-numerieke Kopparberg-bestandsnamen zijn expliciet gemapt: `kopp. Strawberry Lime.1.jpg-600x600.jpg` naar supplier code `12009`, `kopp. mixed fruit.1.jpg-600x600.jpg` naar `12052`, `kopp. wildberry.1.jpg-600x600.jpg` naar `12010`, en `kopp. pear.1.jpg-600x600.jpg` naar `12008`. Drie cereal-bestanden zonder artikelnummer zijn read-only gematcht op bestaande Tindale-producten: `WEETABIX_ORIGINAL_430.jpg-600x600.jpg` naar `11599`, `oats superfast-500g.2.png-600x600.jpg` naar `853`, en `mornflake crunchy raisin.1.jpg-600x600.jpg` naar `11102`. Alle `cereals`- en `breads and naan`-bestanden zijn gekoppeld. De volgende aangeleverde cider-foto had geen exacte productmatch op `supplier=Tindale` + `supplier_code`:

| Supplier | Supplier code | Filename | Resultaat | Vervolgactie |
| --- | --- | --- | --- | --- |
| Tindale | 120110 | `120110.2.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |

Op 4 augustus 2026 zijn de Tindale-mappen `biscuits and crackers`, `beer ale` en `bakery` als foto-only batches verwerkt met `scripts/link-product-photos.mjs`. De verwerking koppelde 53 afbeeldingen aan bestaande Tindale-producten en wijzigde uitsluitend `image_url` en `images`; prijzen, IVA, verpakking, voorraad, categorie, productnaam, beschrijvingen en zichtbaarheid zijn niet aangepast. De kleine `115202.1.jpg-100x100.jpg` thumbnail is bewust niet verwerkt zodat de 600px-foto voor supplier code `115202` behouden blijft. Twee niet-numerieke beer-bestandsnamen zijn expliciet gemapt: `John Smith.1.jpg-600x600.jpg` naar supplier code `12006`, en `guiness can 440.1.jpg-600x600.jpg` naar supplier code `12033`. Alle `bakery`-bestanden zijn gekoppeld. De volgende aangeleverde foto's hadden geen exacte productmatch op `supplier=Tindale` + `supplier_code`:

| Supplier | Supplier code | Filename | Resultaat | Vervolgactie |
| --- | --- | --- | --- | --- |
| Tindale | 115207 | `115207.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |
| Tindale | 12082 | `12082.1.jpg-600x600.jpg` | PRODUCT_NOT_FOUND | Controleer of dit Tindale-product ontbreekt of onder een andere code bestaat. |

Op 30 juli 2026 zijn drie nieuwe supplier-PDF's verwerkt via een veilige scriptmatige draftimport: De Hollandse Bakker (`dehollandsebakker.pdf`), Messiaen Beer (`lista cerevza.pdf`) en Messiaen Food (`ListapreciosESP_merged.pdf`). Alle nieuwe producten staan `product_status='draft'`, `is_visible=false`, `sale_price_incl_vat=0`, zonder voorraadmutatie en met gekoppelde `supplier_product_offers`. De oude archived Hollandse Bakker-catalogus is niet gewijzigd. Een eerste importer-run stopte veilig door een schema/ID-mismatch en is als failed geaudit met 0 producten; de 73 tijdelijk fout geformatteerde draft-id's uit de tweede poging zijn direct hersteld naar normale `NC-03468`-achtige codes voordat de resterende imports zijn uitgevoerd.
