# Aldaketen erregistroa

Formatua: [Keep a Changelog](https://keepachangelog.com/) estiloan, fase bakoitzeko sarrera batekin.

## [fase-3a] — 2026-11-04

### Gehituta

- «Teoria» atala: fitxen zerrenda, bilaketa (izenburua, etiketak, testua), domeinu-iragazkia, fitxaren bista (Markdown + KaTeX, sarerik gabe), ikurrak txertatuta, lotutako edukia, iturriak eta «Zirriborroa — berrikusteko» etiketa.
- 5 teoria-fitxa pneumatiko (zirriborroak, Creus aipatuta): presioa, zilindroaren indarra eta kontsumoa, balbula banatzaileak, funtzio logikoak, espazio-fase diagrama eta kaskada.
- Kalkulu-funtzioak (`src/learning/calculators/`): indarra, konpresio-erlazioa, aire-kontsumoa; testekin, eta fitxetako zenbakiak haiekin egiaztatuta.
- Editorean «Teoria gehiago →» (propietateak eta F1 txartela): fitxa alboko panelean.
- Edukiaren testak (SPEC §11): formulak errorerik gabe, estekak eta ikurrak existitzen dira.
- Teoria lazy-loading bidez kargatzen da (editorearen paketea ez da handitzen).

## [liburuak] — 2026-11-04

### Gehituta

- `docs/liburuen-egiaztapena.md`: orain arte egindakoa eta 3. faserako planak Creus, Editex eta Paraninfo liburuekin alderatuta.
- Simulazio-abisua: balbula biegonkor edo 5/3 batek bi aldeetako seinaleak aldi berean dituenean.

### Aldatuta

- Rodilloak zilindro bati lotzean, etiketa automatikoki a0/a1, b0/b1… (R4 eta R5 fitxategiak ere bai).
- Pilotaje-lerroak marratuta; simulazioan ihesa urdin argiz eta meheago (marrarik gabe).
- Ikurrak: palanka (zirkulua muturrean), pilotajea (laukia + triangelua), rodilloa (puntua erdian), rodillo abatigarria (beso artikulatua).

## [fase-2b] — 2026-11-04 (2. fasea osatuta)

### Gehituta

- Akoplamendu mekanikoa (SPEC §6.1, 6. urratsa): rodillo-balbulak zilindro baten posizioak eragiten ditu. Lotura etiketaren bidez, balbularen propietateetan: «Zilindroa» (1A…) eta «Posizioa» (sartuta − / aterata +).
- Rodillo abatigarria: pultsu laburra amaierara iristean (azken % 5ean), norabide bakarrean.
- Amaiera-markak zilindroen gainean, balbularen etiketarekin; simulazioan argitzen dira sakatuta daudenean.
- Propietate-mota berriak: hautatzailea (enum) eta zilindro-erreferentzia.
- Balidazio-abisuak: rodilloa lotu gabe / zilindro ezezaguna.
- Erreferentzia-zirkuituak R4 (joan-etorri automatikoa) eta R5 (A+ B+ B- A- kaskada, 2 talde) eta haien testak; E2E: R5 UItik.

## [fase-2c] — 2026-11-04

### Gehituta

- Simulazioa editorean: «Simulatu» moduak `Simulation` bat sortzen du (erroreak badaude, ez da sartzen).
- Kontrolak: ▶ / ⏸, ⏭ (10 ms), ⏹ (hasieratu), abiadura ×0,1…×10, maila (logikoa; fisikoa desgaituta), `t = …` kontagailua. `requestAnimationFrame` begizta.
- Hodien koloreak egoeraren arabera: presioa urdin iluna, ihesa urdin argia marratuta, blokeatua grisa.
- Balbulen eta zilindroen animazioa; manometroek presioa erakusten dute.
- Eragingailu manual klikagarriak (pultsadorea, pedala, palanka, rodilloak, solenoideak eskuz): klik-mantendu. 5/3 eta solenoide bikoitzekoetan, klikaren aldeak erabakitzen du. Itxiera-giltza: klikak irekitzen/ixten du.
- Espazio-fase diagrama (desplazamendua–urratsa), amaiera-gertaeretatik zuzenean.
- Simulazio-abisuak «Abisuak» panelean (oszilazioa, hornidura ihesera, simulatzen ez dena).
- Laguntza testuinguruan (SPEC §7.4): liburutegian eta oihalean hover eginda, eta F1 hautatutako osagaiarekin.

### Aldatuta

- Motorrak urrats bakoitzean puntu finkoa behin bakarrik ebazten du (azkarrago).
- Beste proiektu bat irekitzean simulazioa gelditu eta editatze-modura itzultzen da.

## [fase-2a] — 2026-11-04

### Gehituta

- Simulazio-motorra, 1. maila (`src/engine/`, TypeScript hutsa, UIrik gabe):
  - Sareak (union-find), presio- eta ihes-hedapena norabidearekin eta emari-faktorearekin (widest-path), PRESSURE / EXHAUST / BLOCKED.
  - Puntu finkoa (balbula-posizioak eta nodo-egoerak), 50 iterazioko muga eta «oszilazioa» abisua; «hornidura ihesera» abisua.
  - Denbora-urrats finkoko scheduler-a (`Simulation`: `step`, `run`, `runUntil`, `press/release`, gertaerak `1A+`/`1A-`), determinista.
  - Portaerak: balbula guztiak (mono/biegonkorrak, 5/3 zentratuak, pilotajeak, tenporizadoreak, sekuentzia-balbula), zilindroak, AND/OR, antzezpena, emari-erregulagailuak, ihes azkarrekoa, motorra, prestaketa-unitateak.
- Erreferentzia-zirkuituak R1, R2, R3 (`tests/engine/fixtures/`) eta haien testak; motorraren estaldura % 94.
- Zilindroetan «Ibilbide-denbora (1. maila)» parametroa (lehenetsia 1 s).

### Aldatuta

- Balbulen ihes-portu libreak (3, 5) atmosferara doaz eta ez dute «portu librea» abisurik ematen.

## [liburutegia-p2] — 2026-11-04

### Gehituta

- SPEC §5.1eko P2/P3 osagai pneumatikoak (ikurrak, simulaziorik gabe): iragazkia, presio-erregulagailua, zerbitzu-unitatea, isilgailua, itxiera-giltza (2/2), moteltzailedun zilindroa, zurtoin bikoitzekoa, motor pneumatikoa, huts-sorgailua, bentosa, ihes azkarreko balbula, bi noranzkoko itogunea, presio-sekuentzia balbula, tenporizadore pneumatikoak (NI/NA), 5/3 balbulak palankarekin (3 zentro).
- Eragingailu berriak: malguki doigarria, pilotaje tenporizatua (itogunea + depositua).
- Liburutegian «Hutsa» taldea. Guztira 51 osagai.

## [liburutegia-p1] — 2026-11-04 (2. fasearen aurretik, erabiltzaileak eskatuta)

### Gehituta

- SPEC §5.1eko P1 osagai pneumatiko guztiak liburutegian (33), ikur, portu, propietate eta laguntza-testuarekin. **Simulaziorik gabe oraindik** (2. fasea).
  - Elikadura: aire-iturria, ihesa. Zilindroak: eragin bakunekoa eta bikoitzekoa.
  - 3/2 balbulak (NI: pultsadorea, pedala, palanka, rodilloa, rodillo abatigarria, pilotajea, solenoidea; NA: pultsadorea, pilotajea).
  - 5/2 balbulak (monoegonkorrak: pultsadorea, palanka, rodilloa, pilotajea, solenoidea; biegonkorrak: pilotajea, solenoidea).
  - 5/3 balbulak (zentro itxia / ihesera / presioan × pilotajea / solenoidea).
  - Antzezpen-balbula, emari-erregulagailu bakuna, OR, AND, manometroa.
- Balbula-fabrika modularra: bide-taulak datu hutsak dira (`valveSpecs.ts`, Reactik gabe), motorrak 2a-n berrerabiltzeko.
- Liburutegia azpi-taldeetan (tolesgarriak) eta izen/laguntza-testu dinamikoak.
- Testak: 247 unitate-test (balbula bakoitzaren posizio guztiek portu guztiak erabiltzen dituztela barne).

## [fase-1c] — 2026-11-04 (1. fasea osatuta)

### Gehituta

- Proiektuak IndexedDB-n (`idb-keyval`), gordetze automatikoarekin 5 s-ro eta orria ixtean/ezkutatzean; egoera-adierazlea (Gordeta / Aldaketak… / Gordetzen…).
- Proiektu anitz: berria, ireki, ezabatu (berrespenarekin), izena aldatu.
- Proiektu bakarraren esportazioa/inportazioa (`.automalab.json`; inportatzean beti proiektu berri gisa).
- Babeskopia osoa: «Esportatu dena» (`automalab-babeskopia-AAAA-HH-EE.json`) eta «Inportatu dena» aurrebistarekin (berriak / gainidatziko direnak, datekin).
- Babeskopia-abisua: aldaketak daudenean eta N egunetan babeskopiarik ez (lehenetsia 7, konfiguragarria).
- `navigator.storage.persist()` abiaraztean.
- Editoreak gordetako proiektua kargatu arte itxaroten du (karga aurreko aldaketak ez galtzeko).
- Proba-fitxategia: `docs/egiaztapena/fitxategiak/r1-zilindro-bakuna.automalab.json`.
- Testak: 79 unitate-test (fake-indexeddb), 7 E2E (berriro kargatzea eta profil arteko babeskopia barne).

## [fase-1b] — 2026-11-04

### Gehituta

- SVG editorea «Editorea» atalean: liburutegia (bilaketa, domeinuka, klik edo arrastatu), oihala (sareta, zoom, pan), propietateak eta abisuen panela.
- Osagaiak: jarri, mugitu (saretara), biratu (R), ispilatu (M), ezabatu (Supr), kopiatu/itsatsi (Ctrl+C/V), hautapen anitza (Shift, laukizuzena), Ctrl+A.
- Hodiak: portutik portura, bide ortogonal automatikoa, angelu-puntu editagarriak, T loturak (hodi baten erdian amaituz).
- Desegin/berregin (Ctrl+Z / Ctrl+Y), 100 urrats; arrastatze bat = urrats bat.
- Etiketen iradokizun automatikoa (1A, 2A; 1V1, 1V2; 0Z1).
- Editatze- eta simulazio-modua bereizita (simulazioan eskema blokeatuta).
- `docs/berrikuspenak.md`: berrikuspen pendienteen zerrenda.
- Testak: 65 unitate-test, 4 E2E.

### Konponduta

- Hodi berrien angelu-puntuak ez ziren ondo saretara egokitzen (`map(snapPoint)`-ek indizea urrats gisa pasatzen zuen).

## [fase-1a] — 2026-11-04

### Gehituta

- Datu-eredua (`src/core/`): motak, osagai-definizioaren kontratua (§3.2), geometria (sareta, biraketa, ispilua), proiektu hutsa.
- Serializazioa `schemaVersion`-ekin: kargatzea, balio lehenetsiak, bertsio berriagoen eta eremu okerren erroreak, migrazioetarako egitura.
- Balidazioa: ID bikoitzak, mota ezezagunak, osagai/portu faltak, domeinu nahasiak, auto-loturak, lotura bikoitzak, portu libreak eta etiketa errepikatuak.
- Hiru proba-osagai beren SVG ikurrekin: aire-iturria, 3/2 balbula (pultsadorea + malgukia) eta eragin bakuneko zilindroa.
- Ikurren galeria `#/symbols` helbidean (egoerak, biraketak, ispilua eta portuak).
- `t()` funtzioak `{aldagaiak}` onartzen ditu.
- Testak: 38 unitate-test, 2 E2E.

### Aldatuta

- Logo berria: «A» letra eskema-lerro ortogonalekin.

## [fase-0] — 2026-11-04

### Gehituta

- Proiektuaren oinarria: Vite 8 + React 19 + TypeScript 6 (strict).
- Testak: Vitest 5 (jsdom, Testing Library) eta Playwright 1.64 (Chromium).
- Kalitatea: ESLint 10 (flat config, typescript-eslint, react-hooks) eta Prettier.
- SPEC §3.1eko direktorio-egitura (karpeta hutsak `.gitkeep`-ekin).
- i18n oinarria: `src/i18n/eu.json`, `src/i18n/es.json` (hutsik) eta `t()` funtzioa, euskarara itzultzeko ordezkoarekin.
- Goiko menu nagusia bost atalekin (Editorea, Txantiloiak, Ariketak, Teoria, Nire aurrerapena), edukirik gabe.
- Testak: 6 unitate-test (i18n eta menua) eta E2E test 1 (menua eta nabigazioa).
- Ikus-estiloa erabiltzailearen erreferentziatik (ERP LSB): paleta, Archivo eta IBM Plex Mono letra-tipoak (paketean, offline), goiko barra lausotua, txartelak eta sareta-hondoa.
- `CLAUDE.md` eguneratua (komandoak eta erabakiak) eta egiaztatze-gida `docs/egiaztapena/fase-0.md`.
