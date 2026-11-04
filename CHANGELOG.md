# Aldaketen erregistroa

Formatua: [Keep a Changelog](https://keepachangelog.com/) estiloan, fase bakoitzeko sarrera batekin.

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
