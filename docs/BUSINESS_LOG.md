# Business Log: Nancy's Castalla

**Doel:** actueel overzicht van zakelijke keuzes en hun motivatie.  
**Peildatum:** 8 juli 2026
**Eigenaar:** Nancy's Castalla

Dit document legt uit waarom het bedrijf bepaalde product-, verkoop- en operationele keuzes maakt. Het is geen technisch changelog. De actuele functionele status staat in `../PROJECT_STATUS.md`. Wanneer een zakelijke keuze verandert, moet de oude keuze als vervangen worden gemarkeerd en moet de actuele keuze duidelijk bovenaan de betreffende sectie staan.

## Bedrijfsmodel

### Kleinschalig starten vanuit pre-orders

**Keuze:** Nancy's Castalla start met kleine voorraad, pre-orders en handmatige bevestiging.

**Motivatie:** hiermee blijven voorraadrisico, verspilling en benodigde investering beperkt terwijl de vraag onder internationale inwoners rond Castalla wordt getest. Vooral brood, diepvriesproducten en leveranciersverpakkingen kunnen zo worden ingekocht nadat voldoende vraag bestaat.

**Gevolg voor de website:** producten hebben statussen `available`, `preorder` en `coming-soon`. De website vermeldt duidelijk “Starting soon / pre-order phase”. Een order is eerst een aanvraag en wordt handmatig bevestigd.

### Internationale focus

**Keuze:** de eerste doelgroep bestaat uit Britse, Ierse, Nederlandse en overige Europese expats, aangevuld met Zuid-Amerikaanse en Aziatische/Indonesische producten.

**Motivatie:** deze doelgroepen hebben rond Castalla aantoonbare behoefte aan producten die niet altijd in reguliere Spaanse supermarkten verkrijgbaar zijn. De Zuid-Amerikaanse categorie is belangrijk voor Spaanstalige klanten en mag daarom niet alleen in Engelse of Nederlandse communicatie voorkomen.

### Engels als hoofdtaal

**Keuze:** Engels is de hoofdtaal. Nederlands, Duits, Spaans en Zweeds/Scandinavisch worden daarnaast ondersteund.

**Motivatie:** Engels bereikt de breedste internationale doelgroep. Spaans is essentieel voor lokale en Zuid-Amerikaanse klanten. Nederlands en Duits ondersteunen belangrijke expatgroepen. De huidige code `sv` vertegenwoordigt voorlopig de Scandinavische uitbreiding, maar is nog geen volledige dekking van alle Scandinavische talen.

## Producten en leveranciers

### Volledige leverancierslijsten importeren, standaard verborgen

**Keuze:** leverancierscatalogi worden zo volledig mogelijk geïmporteerd, maar producten staan standaard uitgeschakeld voor de publieke winkel.

**Motivatie:** hierdoor hoeft productdata later niet opnieuw handmatig te worden ingevoerd, terwijl de klant alleen een zorgvuldig gekozen en verrijkt assortiment ziet. Foto's, beschrijvingen, klantverpakkingen en actuele verkoopprijzen worden toegevoegd voordat een product online gaat.

### Leveranciersinformatie is intern

**Keuze:** leveranciersnamen, leverancierscodes en inkoopprijzen worden niet publiek getoond.

**Motivatie:** deze gegevens zijn onderdeel van de interne inkoopstrategie en niet relevant voor de klant. De publieke productpagina toont alleen klantgerichte informatie.

### Eigen Nancy-productcodes

**Keuze:** ieder product krijgt een oplopende code vanaf `NC-00001`.

**Motivatie:** leveranciers gebruiken verschillende en soms dubbele codes. Een eigen stabiele code maakt zoeken, productlinks, orderregels, labels en toekomstige kassakoppelingen betrouwbaar.

### Meerdere categorieën per product

**Keuze:** één product kan meerdere categorieën hebben.

**Motivatie:** producten kunnen tegelijk een land-, cultuur- en producttype vertegenwoordigen. Kipsaté kan bijvoorbeeld Nederlands, Aziatisch/Indonesisch en diepvries zijn. Dit verbetert vindbaarheid zonder dubbele productrecords te maken.

### Klantverpakkingen naast leveranciersverpakkingen

**Keuze:** de leverancierseenheid en de verkoopeenheid worden afzonderlijk beheerd.

**Motivatie:** een doos van 40 frikandellen is voor veel particuliere klanten te groot. Nancy's Castalla kan kleinere pakketten van bijvoorbeeld 4, 8 of 12 stuks aanbieden. De kostprijs per stuk en verkoopprijs per klantverpakking moeten daarom expliciet kunnen worden vastgelegd.

### Geen verplichte 50%-margeregel

**Keuze:** de beheerder bepaalt de uiteindelijke verkoopprijs; een vaste marge van 50% wordt niet automatisch afgedwongen.

**Motivatie:** marge verschilt per categorie, concurrentie, verpakking, handling, verspilling en prijsgevoeligheid. De prijshelper mag marge en winst tonen, maar mag geen zakelijk besluit vervangen.

## Bestellen en betalen

### WhatsApp als primaire ondersteuning

**Keuze:** WhatsApp blijft een prominente CTA voor vragen en bestellingen.

**Motivatie:** de doelgroep gebruikt WhatsApp veel en het past bij een kleinschalige persoonlijke start. Het zakelijke nummer `+34 644 05 97 69` houdt werk en privé gescheiden.

**Aandachtspunt:** WhatsApp-orders worden niet automatisch als databaseorder opgeslagen. Operationeel moet duidelijk zijn wanneer een medewerker zo'n order handmatig registreert.

### Geen Stripe in versie 1

**Keuze:** Stripe en online kaartbetaling zijn niet actief.

**Motivatie:** in de pre-orderfase worden beschikbaarheid, levermoment en totaal eerst handmatig bevestigd. Een online betaling vóór die bevestiging kan terugbetalingen en extra administratie veroorzaken. De software bevat wel een providerstructuur zodat later Stripe, SumUp of een andere oplossing kan worden aangesloten.

### Bizum, overschrijving en contant eerst

**Keuze:** ondersteunde V1-methoden zijn Bizum, bankoverschrijving, contant bij afhalen en contant bij bezorgen.

**Motivatie:** deze methoden zijn eenvoudig, lokaal herkenbaar en vereisen geen complete betaalcheckout. De klant ontvangt instructies nadat de order is gecontroleerd.

**Open zakelijk besluit:** het Bizum-nummer en de bankrekening moeten definitief worden bevestigd. De bankrekening is nog een placeholder; het Bizum-nummer kan nog naar het eerdere telefoonnummer verwijzen.

### Betaalvoorkeur vastleggen zonder online afrekening

**Keuze:** de checkout mag `Bizum`, `Bank transfer`, `Cash`, `Card` of `Pending` als klantvoorkeur vastleggen. Dit is informatie voor orderafhandeling en factuur; het is geen bewijs van betaling en activeert geen externe checkout.

**Motivatie:** de klant en beheerder zien direct hoe betaling waarschijnlijk wordt afgehandeld, terwijl Nancy's Castalla eerst beschikbaarheid kan controleren. `payment_status` blijft afzonderlijk de bron voor de vraag of daadwerkelijk is betaald.

### Factuur uit bevestigde order

**Keuze:** een normale factuur wordt vanuit een geschikte order gemaakt en gebruikt onveranderlijke klant-, product-, prijs-, IVA- en betaalmethodesnapshots. De factuur is Spaans/Engels en toont de fiscale gegevens uit de centrale bedrijfsconfiguratie.

**Motivatie:** administratie moet de situatie op factuurdatum bewaren, ook wanneer klant- of productdata later wijzigt. Eén normale factuur per order voorkomt dubbele boeking; correcties en creditnota's worden pas in een volgende fase toegevoegd.

## Afhalen en bezorgen

### Afhalen in Castalla

**Keuze:** afhalen bij Calle Murcia 111, 03420 Castalla is de standaard fulfilmentmethode.

**Motivatie:** afhalen heeft de laagste operationele kosten en past bij kleine voorraad en vooraf afgesproken levermomenten.

### Lokale bezorging tegen vergoeding

**Keuze:** de huidige communicatie noemt een minimumorder van EUR 25, een radius van circa 15 km en bezorgkosten vanaf EUR 3,50.

**Motivatie:** kleine orders bezorgen is door tijd en brandstof niet rendabel. Een minimum en fee houden de dienst praktisch uitvoerbaar.

**Status gratis bezorging:** gratis bezorging in Castalla is momenteel geen vastgelegde of technisch geïmplementeerde regel. Als dit commercieel gewenst wordt, moeten drempel, postcodegebied en uitzonderingen eerst zakelijk worden vastgesteld en daarna server-side worden gebouwd.

### Brood alleen bij voldoende vraag

**Keuze:** brood is beschikbaar via pre-order wanneer de minimale vraag wordt bereikt.

**Motivatie:** vers brood heeft korte houdbaarheid en vaste leveranciersmomenten. Bundeling beperkt verspilling en transportkosten.

## Klantrelatie en communicatie

### Gescheiden e-mailadressen

**Keuze:**

- `info@nancys.es` voor algemene informatie en contact.
- `orders@nancys.es` voor orders, bevestigingen en status.
- `account@nancys.es` voor registratie, login en wachtwoordherstel.

**Motivatie:** klanten herkennen direct het doel van een bericht en interne verwerking kan later per mailbox of team worden georganiseerd.

### Eigen merk in accountmails

**Keuze:** accountmails moeten van Nancy's Castalla lijken te komen en niet als generieke Supabase-mail worden gepresenteerd.

**Motivatie:** vertrouwen en merkconsistentie zijn belangrijk bij registratie en wachtwoordherstel. Supabase blijft de technische verzender, maar Resend SMTP, eigen afzender en branded templates verzorgen de klantbeleving.

### Klantaccounts zijn ondersteunend, niet verplicht voor bestellen

**Keuze:** gasten mogen bestellen; ingelogde klanten krijgen vooraf ingevulde gegevens en orderhistorie.

**Motivatie:** een verplichte registratie verhoogt de drempel in een vroege verkoopfase. Accounts leveren wel gemak en vormen de basis voor herhaalbestellingen en toekomstige facturen.

## Groei en uitgestelde functies

### Backoffice modulair voorbereiden

**Keuze:** producten, orders en voorraad worden eerst operationeel gemaakt; leveranciers, inkoop, facturatie, rapportages en integraties worden stapsgewijs afgebouwd.

**Motivatie:** het bedrijf heeft vroeg behoefte aan catalogus- en orderbeheer, maar een volledige ERP-implementatie zou de start onnodig vertragen.

### API-ready zonder vroege externe koppelingen

**Keuze:** architectuur voorbereiden op POS, SumUp, boekhouding, leveranciers, verzending, WhatsApp Business en mobiele apps, maar nog geen koppelingen activeren.

**Motivatie:** providerinterfaces beperken toekomstige herbouw. Tegelijk worden abonnementskosten en integratierisico uitgesteld tot het verkoopproces stabiel is.

## Onderhoudsregel

Bij iedere wijziging met zakelijke gevolgen moet dit document worden gecontroleerd. Voorbeelden zijn nieuwe betaalmethoden, andere bezorgvoorwaarden, gewijzigde doelgroepen, leveranciersstrategie, prijsbeleid of een verandering van de pre-orderfase.
