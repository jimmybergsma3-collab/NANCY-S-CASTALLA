# Changelog: Nancy's Castalla

Alle belangrijke wijzigingen aan dit project worden in dit bestand vastgelegd. De structuur volgt [Semantic Versioning](https://semver.org/) zolang het project pre-1.0 is:

- `PATCH`: fixes, documentatie en kleine compatibele verbeteringen.
- `MINOR`: nieuwe compatibele functionaliteit.
- `MAJOR`: vanaf 1.0, incompatibele productiewijzigingen.

Categorieën: **Toegevoegd**, **Gewijzigd**, **Verbeterd**, **Opgelost**, **Beveiliging** en **Verwijderd**.

## [Unreleased]

### Documentatie

- Alle technische MD-bestanden opnieuw gesynchroniseerd naar peildatum 28 juli 2026, met de actuele regels voor Eurodrop/Europ Foods-prijsreview, Tindale-offlinebeleid, sales-unit/packaging, IVA-controle, ordercorrecties en handmatige betaalmethoden.
- `AI_CONTEXT.md`, `PROJECT_STATUS.md`, `TECHNICAL_HANDOVER.md`, `BUSINESS_LOG.md`, `ROADMAP.md` en `DECISIONS.md` zijn opgeschoond zodat uitgevoerde ordercorrectiemigratie `202607180001` niet meer als open livegangblokker wordt genoemd.
- Eurodrop-audituitkomst van 28 juli 2026 vastgelegd: 327 gecontroleerde records, 107 verwerkt, 220 review/niet-bevestigd, met expliciete regel dat onzekere prijs- of verpakkingsmatches niet automatisch worden gepubliceerd.
- Volledige Git-geschiedenis en actuele codebase opnieuw vergeleken met alle projectdocumentatie.
- Nieuw `PROJECT_STATUS.md` toegevoegd met een statusmatrix, afgeronde mijlpalen en uitsluitend werkelijke TODO's vóór livegang.
- README, technische overdracht, roadmap, businesslog, beslislog en AI-context gesynchroniseerd met de huidige webshop-, admin-, order-, voorraad-, factuur- en e-mailfunctionaliteit.
- Verouderde roadmapitems voor reeds opgeleverde klantorderdetails, factuursnapshots, PDF-facturen en meertalige transactionele mails verwijderd.

### Toegevoegd

- PWA-installatieprompt voor klanten toegevoegd met taalteksten voor Engels, Nederlands, Duits, Spaans en Zweeds; Android/Chrome gebruikt de browser-installatieprompt en iOS toont een beginscherm-instructie.
- Service worker en verbeterd webmanifest toegevoegd zodat Nancy's Castalla beter als telefoon-app installeerbaar is.
- Operationele adminflow voor inkoop: inkooporders aanmaken, leveranciersfacturen uploaden, goederenontvangsten registreren en ontvangen regels pas na expliciete verwerking naar voorraad boeken.
- Migratie `202608120001_purchasing_supplier_invoice_workflow.sql` voor inkooporderregels, leveranciersfacturen, goederenontvangsten, inkoopprijshistorie, private bucket `supplier-invoices` en de receipt-processing RPC.
- Adminrapportage voor verkoop- en inkoop-IVA; verkooprapportage sluit testfacturen standaard uit.
- Inventory-admin toont recente voorraadbewegingen zodat verwerkte leveranciersontvangsten traceerbaar zijn.
- Veilig PDF-importscript `scripts/import-pdf-supplier-lists.mjs` voor expliciet ondersteunde aanvullende leverancierslijsten. Het script draait standaard als dry-run, schrijft rapporten naar een tijdelijke map, en confirmed import maakt uitsluitend draft/onzichtbare producten plus supplier offers.
- Productie-draftimports uitgevoerd voor drie actuele PDF-lijsten: `IMPORT_2026_LIVE_HOLLANDSE_BAKKER_JULY` met 73 producten/offers, `IMPORT_2026_LIVE_MESSIAEN_BEER_JULY` met 60 producten/offers en `IMPORT_2026_LIVE_MESSIAEN_FOOD_JULY` met 386 producten/offers. Messiaen Food hield 8 supplier-codeconflicten in review en 1 exacte bronherhaling is niet dubbel aangemaakt.
- Veilig image-only hulpscript `scripts/link-product-photos.mjs` voor losse leveranciersfoto's. Het script koppelt foto's uitsluitend aan bestaande producten via leverancier + `supplier_code`, uploadt naar Supabase Storage en heeft een harde allowlist voor `image_url`/`images` plus optionele expliciete activatie.
- Migratie `202607250001_keep_tindale_products_offline.sql` om Tindale-producten offline te houden: bestaande Tindale-producten worden teruggezet naar `draft`/`is_visible=false` en Tindale-batchpublicatie wordt database-side geblokkeerd zolang ophalen in La Nucia nodig is.
- Server-side adminproductcontrole blokkeert individuele publicatie van Tindale-producten; ze kunnen nog als draft worden bewaard, maar niet actief en zichtbaar online worden gezet.
- Migratie `202607250002_activate_selected_europfoods_coming_soon.sql` om de door Nancy geselecteerde Europ Foods-producten zichtbaar te maken als `coming-soon`, zonder prijs of foto, met `Description coming soon.` en zo goed mogelijke categorie-indeling op basis van de Europ Foods PAG-sectie.
- Admin-ordercorrectie vóór definitieve facturatie: orderregels kunnen in `/{locale}/admin` worden verwijderd, aantallen kunnen worden aangepast en vervangende producten kunnen via server-side productzoekactie worden toegevoegd.
- Migratie `202607180001_admin_order_corrections.sql` met RPC's `replace_order_items_for_admin` en `reset_invoice_for_order_correction`. Deze functies blokkeren correcties bij betaalde, geleverde, geannuleerde, voorraad-gecommitte of actief gefactureerde orders en schrijven verplichte auditmetadata met actor en reden.
- Gecontroleerde actie `Factuur intrekken voor ordercorrectie` voor nog niet verzonden/onbetaalde facturen. De factuur krijgt status `void`, `invoice_items` blijven bestaan, het oude nummer blijft zichtbaar en de admin maakt daarna een nieuwe factuur met nieuw nummer.
- Aparte voorraadcorrectiepaden voor ordercorrecties: normale gecommitte voorraad met negatieve `sale`-movements wordt via positieve `correction_release`-movements teruggeboekt; legacy-orders met `inventory_committed=true` maar nul movements kunnen alleen de foutieve vlag resetten zonder voorraadmutatie, met volledige audit.

- De mobiele quick-edit voor bestaande leveranciersproducten toont en bewaart nu ook de bestaande velden `Ingrediënten / allergenen`, `Bereidingswijze` en `Bewaaradvies`, direct onder de korte beschrijving en zonder nieuwe databasevelden.
- Mobiele snelle productinvoer op `/{locale}/admin/products` gebruikt nu standaard `Uit leverancierslijst`: admin zoekt server-side bestaande geïmporteerde draft/disabled/active producten met supplier offer, werkt het bestaande product af en behoudt Nancy-code, supplier, supplier code, supplier offer, importbatch en bronprijsmetadata. `Nieuw handmatig product` blijft als secundaire optie bestaan.
- Migratie `202607120002_sales_unit_price_basis_safety.sql` voor expliciete scheiding tussen leveranciersdoos, bron-eenheidsprijs en publieke verkoopeenheid bij geïmporteerde producten.
- Productvelden voor sales-unitcontrole: `sales_unit_type`, `sales_unit_quantity`, `sales_unit_confirmed`, `price_basis_confirmed`, `supplier_case_price`, `supplier_unit_price`, `supplier_case_quantity` en `source_package_text`.
- Gedeelde sales-unit veiligheidscontrole die geïmporteerde producten blokkeert wanneer verpakking, verkoopprijs en prijsbasis nog niet expliciet door admin zijn gecontroleerd.
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
- Losse passantenfacturen in factuurbeheer: admin kan zonder bestaande order klantgegevens, regels, IVA en betaalmethode invoeren, waarna de factuur in de normale serie wordt opgeslagen en als PDF beschikbaar is.
- Losse adminfacturen kunnen nu ook aan een bestaande klant worden gekoppeld via klantzoeker; de factuur bewaart dan `customer_id` en vult naam, e-mail, telefoon en adres automatisch in.
- Productregels in losse adminfacturen hebben nu productzoeker met package-keuze, zodat producten zoals Magners direct vanuit het factuurformulier kunnen worden geselecteerd.
- Klantbestellingen zijn voortaan beperkt tot geregistreerde en ingelogde klanten; gasten zien in de winkelmand een login/registratieblok en de order-API weigert verzoeken zonder geldig klanttoken.
- Tindale-fotobatch van 29 juli 2026 vastgelegd met gecontroleerde verkoopprijzen per volledige doos/verpakking, sales-unit `case`, bevestigde prijsbasis en margegegevens; quantity 1 blijft een complete verkoopverpakking.
- Laatste concurrentieprijsbatch voor Europ Foods no-price producten vastgelegd: 22 resterende producten gecontroleerd, 7 veilig geprijsd en 15 bewust ongeprijsd gelaten vanwege onvoldoende marge, onzekere verpakking of ontbrekende betrouwbare match.
- Alle 77 niet-geprijsde producten uit de 100-producten concurrentieprijscontrole offline gezet, zodat alleen veilig geprijsde producten zichtbaar/publiceerbaar blijven.
- Eerste ingrediëntenbatch voor 20 actieve Tindale-dranken aangevuld met ingrediënten, bewaarinstructie, gebruiksinstructie en bronverwijzing.
- Tweede ingrediëntenbatch voor 20 actieve Tindale-dranken aangevuld met ingrediënten, bewaarinstructie, gebruiksinstructie en bronverwijzing.
- Derde ingrediëntenbatch voor 20 actieve Tindale-producten aangevuld met ingrediënten, bewaarinstructie, gebruiksinstructie en bronverwijzing.
- Vierde ingrediëntenbatch voor 20 actieve Tindale-producten aangevuld met ingrediënten, bewaarinstructie, gebruiksinstructie en bronverwijzing.
- Vijfde ingrediëntenbatch voor 20 actieve Tindale-producten aangevuld met ingrediënten, bewaarinstructie, gebruiksinstructie en bronverwijzing.
- Interne reviewnotities uit `Additional information` verwijderd bij actieve zichtbare producten; ingrediëntenbatches vullen dit klantgerichte veld voortaan niet meer.
- Zesde ingrediëntenbatch voor 20 actieve Tindale-producten aangevuld met ingrediënten, bewaarinstructie en gebruiksinstructie zonder `Additional information` te vullen.
- Zevende ingrediëntenbatch voor 20 actieve producten aangevuld met ingrediënten, bewaarinstructie en gebruiksinstructie; `Additional information` is voor deze batch leeg gehouden.
- Achtste ingrediëntenbatch voor 20 actieve producten aangevuld met ingrediënten, bewaarinstructie en gebruiksinstructie; `Additional information` is voor deze batch leeg gehouden.
- Negende ingrediëntenbatch voor 20 actieve producten aangevuld met ingrediënten, bewaarinstructie en gebruiksinstructie; `Additional information` is voor deze batch leeg gehouden.
- Tiende ingrediëntenbatch voor 20 actieve producten aangevuld met ingrediënten, bewaarinstructie en gebruiksinstructie; `Additional information` is voor deze batch leeg gehouden.
- Laatste ingrediëntenbatch voor 24 actieve producten aangevuld met ingrediënten, bewaarinstructie en gebruiksinstructie; `Additional information` is voor deze batch leeg gehouden.
- Negen zichtbare actieve producten die nog in de admintegel `No ingredients` meetelden alsnog aangevuld; resterende zichtbare `Additional information`-notities leeggemaakt.
- Eerste batch concurrentieprijscontrole voor 15 actieve Europ Foods-producten zonder prijs: 4 veilige prijsupdates vastgelegd met online bron, inkoopprijs, marge en verpakkingcontrole.
- Tweede batch concurrentieprijscontrole voor 20 actieve Europ Foods-producten zonder prijs: 3 veilige prijsupdates vastgelegd; producten met onzekere verpakking, te lage marge of ontbrekende actuele prijs zijn ongemoeid gelaten.
- Derde batch concurrentieprijscontrole voor 20 actieve Europ Foods-producten zonder prijs: 1 veilige prijsupdate vastgelegd; lage-marge en onzekere foodserviceproducten blijven voor eindcontrole open.
- Vierde batch concurrentieprijscontrole voor 20 actieve Europ Foods-producten zonder prijs: 5 veilige prijsupdates vastgelegd met bronprijzen en margecontrole.
- Actieve bulk-/horecaproducten met duidelijke verkoopverpakking boven 3,5 kg offline gezet via `202608090002_disable_bulk_products_over_3_5kg.sql`.
- Door admin geselecteerde actieve producten zonder verkoopprijs offline gezet via `202608090003_disable_selected_no_price_products.sql`.
- Door admin geselecteerde actieve producten zonder productfoto offline gezet via `202608090004_disable_selected_no_photo_products.sql`.
- Door admin geselecteerde actieve producten offline gezet via `202608090005_disable_selected_active_products.sql`.
- Eurodrop-prijscheck uitgevoerd op de 100 resterende actieve Europ Foods-producten zonder prijs; 3 veilige SKU/verpakkingsmatches bijgewerkt met Eurodrop + EUR 0,20 via `202608090006_eurodrop_no_price_safe_matches.sql`, 97 blijven review.
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

- Productkaarten tonen in elke klanttaal een taal-eigen producttekst; wanneer de database geen echte vertaling per taal bevat, gebruikt de site een lokale producttekst met productnaam, verpakking en bestelcontext in plaats van `Translation coming soon`.
- Klantgerichte orderfouten en orderhistorie lekken geen ruwe Engelse backend- of fulfilmenttekst meer wanneer een klant Nederlands, Duits, Spaans of Zweeds gebruikt.
- Admin productbeheer telt en labelt `Online` nu met exact dezelfde controle als de publieke webshop, inclusief sales-unitveiligheid. Producten die wel zichtbaar zijn aangevinkt maar door de webshop worden geblokkeerd krijgen een aparte `Blocked` status en filter.
- Leveranciersimportdocumentatie en importregels verduidelijken nu dat De Hollandse Bakker- en Messiaen-bronprijzen purchase-only zijn. `sale_price_incl_vat` blijft 0, producten blijven draft/onzichtbaar en publicatie vereist handmatige review van verkoopprijs, IVA, categorie, verpakking/sales unit, afbeelding en vertaling.
- Documentatie legt vast dat losse foto-imports nooit prijs, IVA, verpakking, voorraad, categorie, beschrijving of suppliermetadata mogen wijzigen. Zichtbare prijzen na fotokoppeling moeten uit een eerdere prijsbatch of bestaande databasewaarde komen, niet uit de foto.
- Documentatie verduidelijkt dat package options server-side als effectieve units worden berekend, bijvoorbeeld `1 verpakking x 12 flessen x EUR 3,00 = EUR 36,00`, en dat `order_items.quantity` het aantal gekozen klantverpakkingen bewaart.
- Documentatie verduidelijkt dat `ready_for_publish` publieke publicatie bewaakt, maar een reeds actief/zichtbaar/verkoopveilig product niet als enige reden mag blokkeren in admin-ordercorrecties.
- Livegang- en roadmapdocumentatie richt productpublicatie nu op Europ Foods; Tindale blijft intern beschikbaar maar niet publiek bestelbaar vanwege ophaallogistiek in La Nucia.
- Publieke catalogusfilter staat actieve zichtbare `coming-soon` producten toe zonder sales-unit/prijsbevestiging; ze blijven niet bestelbaar totdat de status en prijs later bewust worden aangepast.
- Productbeheer laat de beheerder nu zelf de publieke verkoopeenheid bevestigen. De automatische blokkade op basis van doosachtige verpakkingstekst is uit de admin-save gehaald, zodat gecontroleerde productupdates niet meer vastlopen op een tekstinferentie.
- Admin-ordercorrectie is vereenvoudigd naar één zichtbare knop `Order aanpassen`. Een nog niet verzonden/onbetaalde factuur wordt intern veilig ingetrokken, een legacy `inventory_committed`-vlag zonder movements wordt intern hersteld, en de admin ziet daarna direct de editor met één actie `Wijzigingen opslaan`.
- `ready_for_publish` blokkeert geen admin-ordercorrectie meer voor actieve, zichtbare, correct geprijsde producten met bevestigde IVA/verkoopeenheid; de vlag blijft bedoeld voor publieke publicatiecontrole.
- Admin productzoekactie `mode=order-search` levert alleen actieve, zichtbare en sales-unit-veilige producten aan de ordercorrectie-editor. Browserwaarden voor prijs, IVA en totaal worden genegeerd; de order-service valideert verpakkingen en rekent actuele bedragen opnieuw uit.
- Admin ordercorrecties valideren nu ook gekozen package options server-side in de Supabase RPC. Verpakkingen zoals `12 stuks` voor `NC-03263` worden berekend als effectieve units met de gevalideerde pakketprijs, waardoor totals zoals `1 x 12 x €3,00 = €36,00` niet meer worden afgewezen.
- `npm run lint` negeert expliciet lokale import-/runtime-mappen zoals `tmp/**`, zodat tijdelijke parserdependencies de codecontrole niet blokkeren.

- Publieke i18n-teksten zijn geactualiseerd voor de huidige winkelmand/orderrequest-flow: oude meldingen over geen checkout, geen database en geen accounts zijn vervangen door uitleg over server-gecontroleerde bestelaanvragen, Bizum/bankoverschrijving en WhatsApp-support.
- De `sv`/Scandinavische klantteksten zijn opgeschoond naar natuurlijk Zweeds met normale accenten en de taalkeuze gebruikt nu `Svenska / Scandinavian` waar passend.
- Cart- en checkoutfouten gebruiken nu verplichte locale-teksten voor ontbrekende velden, tijdelijke serviceproblemen, ongeldige orders en ontbrekend bezorgadres, zodat niet-Engelse klanten geen Engelse fallback krijgen.
- De productnaamvertalingshelper normaliseert nu hoofdletters, accenten, leestekens en veelvoorkomende importvarianten zoals saté, frikandel, back bacon, HP Sauce, Bisto, hash browns en Nederlandse snacks, zonder Supabase-productdata te wijzigen.
- Productbeschrijvingsfallbacks gebruiken nu correcte Duitse, Spaanse en Zweedse tekst en herkennen extra veilige aliassen; onbekende niet-Engelse beschrijvingen blijven terugvallen op een korte locale-eigen melding.
- `npm run lint` voert nu eerst `scripts/validate-i18n.mjs` uit om ontbrekende/extra dictionary-sleutels, lege vertalingen en kapotte accent-encoding in i18n-bronnen te blokkeren.
- `POST /api/admin/products` staat handmatige producten zonder supplier code toe, genereert indien nodig server-side een nieuwe `NC-xxxxx`-code, retourneert altijd JSON met `diagnosticId` bij fouten, blokkeert publicatie wanneer verplichte verkoopvelden ontbreken en beschermt bestaande imported products tegen wijziging van supplier/importmetadata.
- Admin productbeheer toont nu leverancierdoos/verpakking, doosinkoopprijs, bron-eenheidsprijs, publieke verkoopeenheid, sales-unit quantity en reviewvinkjes voor sales unit en prijsbasis.
- Nieuwe leveranciersimports blijven standaard in review: verkoopprijs wordt niet automatisch als veilige publieke prijs beschouwd en importproducten kunnen niet live zolang sales unit en prijsbasis niet bevestigd zijn.
- Publieke productqueries en cart/order-validatie blokkeren geïmporteerde producten wanneer de publieke verpakking nog een leveranciersdoos lijkt terwijl de prijs op een eenheidsprijs lijkt.
- Admin Customers en Orders gebruiken nu een gedeelde veilige JSON-lezer in de browser, zodat lege of niet-JSON serverresponses een nette foutmelding met diagnose-id tonen in plaats van een frontend-crash.
- `GET/PATCH/DELETE /api/admin/customers` en `GET/PATCH/DELETE /api/admin/orders` retourneren altijd een JSON-response met `success`, `data` en `diagnosticId` of een gestructureerde fout.
- Orders en Customers laden backwards-compatible wanneer productie nog cleanup-/factuurserievelden uit `202607110001_admin_cleanup_and_invoice_series.sql` mist; leesacties vallen terug op basisvelden en mutaties die ontbrekende kolommen nodig hebben stoppen met een duidelijke fout zonder data te wijzigen.
- `businessMode` valt nu standaard terug op `live`; alleen een expliciete environmentwaarde `BUSINESS_MODE=prelaunch` activeert nog de prelaunchmodus. Bestaande facturen worden niet aangepast.
- Duitse juridische en WhatsApp-betaalteksten noemen geen contante betaling meer; klantgerichte betaalcommunicatie blijft beperkt tot Bizum en bankoverschrijving.
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

- Taal-audit opgeschoond: resterende mojibake-accenten in productbeheer hersteld en publieke productdetails tonen geen losse vertaling-volgt-meldingen meer.
- Laatste omschrijvingsbatch afgerond: de resterende 19 actieve webshopproducten kregen een klantgerichte productomschrijving zonder `additional_info` te vullen; actieve webshopproducten zonder omschrijving: 0.
- Derde omschrijvingsbatch afgerond: nog eens 25 actieve webshopproducten kregen een korte klantgerichte productomschrijving zonder `additional_info` te vullen; resterende actieve webshopproducten zonder omschrijving: 19.
- Tweede omschrijvingsbatch afgerond: nog eens 25 actieve webshopproducten kregen een korte klantgerichte productomschrijving zonder `additional_info` te vullen; resterende actieve webshopproducten zonder omschrijving: 44.
- Eerste omschrijvingsbatch afgerond: 25 actieve webshopproducten kregen een korte klantgerichte productomschrijving zonder `additional_info` te vullen; resterende actieve webshopproducten zonder omschrijving: 69.
- Admin/webshop-zichtbaarheidsverschil hersteld: 10 Europ Foods-producten met correcte prijs en verpakking kregen sales-unit `single`; `NC-02773 Honey Roast Parsnips 1kg` is offline gezet omdat de verkoopprijs onder inkoop lag. Controle daarna: 267 admin online en 267 webshop online, 0 verschillen.
- `POST /api/orders` behandelt een RPC-resultaat met `order_id=null` of ontbrekend ordernummer niet meer als succesvolle orderopslag. De service controleert bij idempotency-retries nu eerst of de bestaande order werkelijk bestaat en retourneert anders een duidelijke `order_storage_unconfirmed` fout met diagnose-id.
- De Supabase RPC `create_validated_order` vangt `unique_violation` alleen nog als idempotency-herhaling af wanneer er aantoonbaar een bestaande order met id en ordernummer is; andere unieke fouten worden niet langer als `already_existed=true` met null ids teruggegeven.
- De checkout gebruikt per nieuwe verzendpoging een verse idempotency-key, zodat een mislukte poging niet stil een volgende echte bestelling kan wegvangen.
- De live Magners-prijs/verpakkingsfout is veilig geneutraliseerd: `NC-03174 MAGNERS CIDER DARK FRUIT 24x440ml` en `NC-03292 MAGNERS CIDER 24x500ml` zijn teruggezet naar draft/onzichtbaar en gemarkeerd voor package review, zonder producten, afbeeldingen, orders of historische data te verwijderen.
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
