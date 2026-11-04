# AutomaLab — Automatismoak ikasi eta simulatzeko web-aplikazioa

> **Claude Code-rentzako garapen-dokumentua.** Dokumentu hau proiektuaren iturri nagusia da. Irakurri osorik lanean hasi aurretik eta jarraitu §13ko faseak hurrenez hurren.
> Izena (AutomaLab) behin-behinekoa da.

---

## 0. Claude Code-rentzako lan-arauak

1. **Fasez fase lan egin** (§13). Ez hasi fase bat aurrekoaren *onarpen-irizpide* guztiak bete arte. Fase bakoitzaren amaieran, idatzi **egiaztatze-gida** (§13.0), gelditu eta erabiltzaileari baieztapena eskatu. **MVP muga batera iristean, gelditu beti**, nahiz eta erabiltzaileak "jarraitu" esan, eta galdetu MVP-ko iritzien fitxategia prest dagoen.
2. **Simulazio-motorra lehenik eta testekin.** Motorrak (`src/engine/`) ez du UIrik ezagutzen: TypeScript hutsa, Vitest bidez probatua. Erreferentzia-zirkuitu bakoitzak (§11) bere testa izan behar du.
3. **Ez asmatu datu teknikorik.** Osagai baten portaera edo parametro bat zalantzazkoa bada, idatzi `// TODO(galdetu):` iruzkina eta galdetu erabiltzaileari.
4. **Hizkuntza:** kodea, aldagaiak eta commit-ak ingelesez; **interfazea euskara batuan** (i18n fitxategi bidez, gaztelania gero gehitu ahal izateko); dokumentazioa euskaraz.
5. **Ez kopiatu FluidSIM** (Festo) ez beste software komertzialen grafiko, ikono edo testurik. Ikurrak ISO 1219-1 eta IEC 60617 arauetan oinarrituta marraztu, SVG propio gisa. Ez erabili Festo marka.
6. **Sinpletasuna:** erabiltzaile bakarrerako tresna da. Ez dago backendik, kontu-sistemarik edo zerbitzaririk.
7. Eguneratu `CLAUDE.md` erabaki garrantzitsu bakoitzarekin, eta `CHANGELOG.md` fase bakoitzaren amaieran.

---

## 1. Helburua eta esparrua

**Helburua:** nabigatzailean exekutatzen den eta offline funtzionatzen duen aplikazio bat, honako hauek egiteko:

- Zirkuitu **pneumatikoak, elektropneumatikoak eta hidraulikoak** marraztu eta simulatu.
- Kontrol-logika **GRAFCET** (IEC 60848) eta **Ladder** (IEC 61131-3ren azpimultzo bat) bidez programatu, eta PLC simulatu batekin zirkuitura lotu.
- **Ikasi eta praktikatu:** ariketak, egiaztapen automatikoa eta fitxa teorikoak.
- **Zirkuitu-txantiloiak:** aurrez muntatutako zirkuituak, ireki, simulatu eta aztertzeko, bakoitza bere **galdetegiarekin** autoebaluaziorako (§8.5–8.6).
- **Teoria-atala:** kontzeptuak, formulak eta kalkulu-adibideak, txantiloiekin eta ariketekin lotuta (§8.3).

**Erabiltzailea:** pertsona bakarra (FPko irakaslea, Fabrikazio Mekanikoa). Norberaren ikaskuntza eta praktika.

**Esparrutik kanpo:** erabiltzaile anitz, hodeiko sinkronizazioa, PLC errealekin komunikazioa, CFD edo elementu finituen simulazioa.

---

## 2. Teknologia-hautaketa

| Arloa | Aukera | Arrazoia |
|---|---|---|
| Lengoaia | **TypeScript** (strict) | Datu-eredu konplexua; erroreak konpilazioan harrapatzen ditu |
| Build | **Vite** | Azkarra, eraikitze estatikoa |
| UI | **React 18+** | Ekosistema handia editoreetarako |
| Egoera | **Zustand** + **Immer** | Sinplea; desegin/berregin erraza |
| Eskema-oihala | **SVG** (React bidez) | Ikur bektorialak, zoom garbia, hit-testing erraza |
| Grafikoak (kurbak) | **uPlot** | Arina eta azkarra denbora errealeko datuetarako |
| Testak | **Vitest** (motorra) + **Playwright** (E2E) | Playwright ingurunean instalatuta dago jada |
| Formulak | **KaTeX** (offline, paketean sartuta) | Teoria-atalean LaTeX formulak errendatzeko |
| Markdown | **markdown-it** + KaTeX plugina | Teoria eta enuntziatuak Markdown-ean |
| Biltegiratzea | **IndexedDB** (`idb-keyval`) + JSON esportazioa/inportazioa | Offline eta iraunkorra |
| Offline | **PWA** (`vite-plugin-pwa`) | Instalagarria, sarerik gabe |
| Aukerakoa | `vite-plugin-singlefile` | HTML bakar batean banatzeko |
| Estiloak | CSS Modules edo Tailwind | Claude Code-k aukeratu eta `CLAUDE.md`n justifikatu |

Simulazio-motorra **Web Worker** batean exekutatuko da (4. fasetik aurrera, beharrezkoa bada), UI blokeatu ez dadin.

---

## 3. Arkitektura

```
┌──────────────────────── UI (React) ────────────────────────┐
│ Editorea (SVG) │ Liburutegia │ Propietateak │ Kontrolak    │
│ GRAFCET editorea │ Ladder editorea │ Kurbak │ Ariketak     │
└───────────────▲───────────────────────────────▲────────────┘
                │ store (Zustand)                │ snapshot-ak
┌───────────────┴────────────────────────────────┴───────────┐
│                  CORE: datu-eredua (TS hutsa)              │
│  Project ─ Circuit ─ ComponentInstance ─ Port ─ Connection │
└───────────────▲────────────────────────────────────────────┘
┌───────────────┴──────── ENGINE (TS hutsa) ─────────────────┐
│ Scheduler (urrats finkoa)                                  │
│  ├─ FluidSolver  [1. maila: logikoa | 2. maila: fisikoa]   │
│  ├─ ElectricSolver (kontrol-zirkuituak, 24 V DC)           │
│  ├─ PlcRuntime  (scan-zikloa: Ladder + GRAFCET)            │
│  └─ Coupling (sentsoreak ↔ sarrerak, irteerak ↔ bobinak)   │
└────────────────────────────────────────────────────────────┘
```

### 3.1 Direktorio-egitura

```
src/
  core/            # datu-eredua, serializazioa, balidazioa
  engine/
    fluid/logic/   # 1. maila
    fluid/physics/ # 2. maila
    electric/
    plc/ladder/
    plc/grafcet/
    coupling/
    scheduler.ts
  components/      # osagaien definizioak (bat fitxategi bakoitzeko)
    pneumatic/  hydraulic/  electric/  plc/
  symbols/         # SVG ikurrak (ISO 1219-1 / IEC 60617)
  ui/
    editor/  grafcet/  ladder/  panels/  plots/  exercises/
  learning/
    exercises/     # diseinu-ariketak (JSON) — §8.1
    templates/     # aurrez muntatutako zirkuituak + galdetegiak — §8.5–8.6
    theory/        # kontzeptuak eta formulak (Markdown + KaTeX) — §8.3
    calculators/   # formula-kalkulagailuak (TS) — §8.3.3
  generator/       # sekuentzia-sortzailea (TS hutsa) — §8.8
  scenes/          # 2D prozesu animatuak — §7.6
  analysis/        # ziklo-analisia (TS hutsa) — §7.5
  i18n/eu.json  i18n/es.json
tests/
  engine/          # erreferentzia-zirkuituak (§11)
  e2e/
```

### 3.2 Osagai-definizioaren kontratua

Osagai bakoitza **plugin** bat da, interfaze bakar baten bidez:

```ts
interface ComponentDef<P = Record<string, number | boolean | string>, S = unknown> {
  type: string;                 // 'pn.cyl.double', 'el.relay', ...
  domain: 'pneumatic' | 'hydraulic' | 'electric' | 'plc';
  ports: PortDef[];             // izena, mota (fluid|electric|signal), posizio erlatiboa
  params: ParamDef<P>[];        // balio lehenetsiak, unitateak, mugak
  symbol: SymbolRenderer<S>;    // egoeraren araberako SVG (adib. balbularen posizioa)
  initState(p: P): S;
  logic?: LogicBehavior<P, S>;      // 1. maila
  physics?: PhysicsBehavior<P, S>;  // 2. maila (aukerakoa)
  electric?: ElectricBehavior<P, S>;
  interactive?: InteractionDef;     // klikatu daitekeen pultsadorea, eskuzko eragingailua...
}
```

Osagai berri bat gehitzea = fitxategi bat `src/components/`-n + bere SVGa + testa. Motorrak ez du osagai zehatzik ezagutu behar.

---

## 4. Datu-eredua eta fitxategi-formatua

Proiektua JSON gisa gordeko da (`.automalab.json`), `schemaVersion` eremuarekin migrazioak egin ahal izateko.

```json
{
  "schemaVersion": 1,
  "name": "A+ B+ B- A- kaskada",
  "simulation": { "level": "logic", "dtMs": 1, "supplyPressureBar": 6 },
  "components": [
    { "id": "c1", "type": "pn.cyl.double", "x": 200, "y": 80, "rot": 0, "mirror": false,
      "params": { "boreMm": 32, "rodMm": 12, "strokeMm": 100, "label": "1A" } },
    { "id": "v1", "type": "pn.valve.5-2.sol-spring", "x": 200, "y": 220, "rot": 0,
      "params": { "label": "1V1", "solenoids": ["Y1"] } }
  ],
  "connections": [
    { "id": "w1", "kind": "fluid", "from": ["v1", "4"], "to": ["c1", "A"],
      "points": [[210, 200], [210, 120]] }
  ],
  "tags": { "Y1": { "kind": "solenoid" }, "1S2": { "kind": "sensor" } },
  "plc": { "io": [], "ladder": [], "grafcet": null }
}
```

**Etiketak (tags)** dira domeinuen arteko lotura: elektrobalbula baten `Y1` bobina eta Ladder-eko `Y1` irteera izen beraren bidez lotzen dira. Gauza bera sentsoreekin (`1S1`, `1S2`).

Balidazioa: portu libreak, lotura bikoitzak, domeinu nahasiak (fluido-portu bat kable elektriko batekin) eta etiketa errepikatuak; erroreak eta abisuak panel batean erakutsi.

---

## 5. Osagai-liburutegia

Lehentasuna: **P1** = MVP, **P2** = gero, **P3** = aukerakoa.

### 5.1 Pneumatika (ISO 1219-1)

| Osagaia | Lehent. | Oharrak |
|---|---|---|
| Aire-iturria / konpresorea | P1 | Presio konfiguragarria (bar) |
| Ihesa (atmosferara) | P1 | |
| Zerbitzu-unitatea (iragazkia + erregulagailua + manometroa) | P2 | |
| Eragin bakuneko zilindroa (malgukiz itzulera) | P1 | Diametroa, zurtoina, ibilbidea |
| Eragin bikoitzeko zilindroa | P1 | Moteltzaileak P3 |
| Balbula banatzaileak: 3/2, 5/2, 5/3 (zentro itxia, ihesean, presioan) | P1 | |
| Eragingailuak: pultsadorea, pedala, palanka, rodilloa, rodillo abatigarria, malguki-itzulera, pilotaje pneumatikoa, solenoidea | P1 | Monoegonkorra / biegonkorra |
| Antzezpen-balbula (atzera-ezinezkoa) | P1 | |
| Emari-erregulagailu bakuna (antzezpenarekin) | P1 | 2. mailan ondorioa du; 1. mailan abiadura-faktore bat |
| Balbula hautatzailea (OR) | P1 | |
| Bi presioko balbula (AND) | P1 | |
| Ihes azkarreko balbula | P2 | |
| Tenporizadore pneumatikoa (NC/NA) | P2 | |
| Presio-sekuentzia balbula | P2 | |
| Manometroa | P1 | Lerroaren presioa erakutsi |
| Motor pneumatikoa, bentosa / hutsa | P3 | |

### 5.2 Elektropneumatika eta kontrol elektrikoa (IEC 60617, 24 V DC)

| Osagaia | Lehent. |
|---|---|
| Elikadura +24 V / 0 V | P1 |
| Pultsadore NA / NI (klik bidez eragina) | P1 |
| Etengailua (atxikimenduarekin), larrialdi-geldialdia | P1 |
| Errelea (bobina + kontaktu NA/NI anitz, etiketaz lotuak) | P1 |
| Tenporizadore-errelea (konexioan / deskonexioan) | P2 |
| Kontagailu-errelea | P3 |
| Amaiera-etengailu mekanikoa (zilindroaren posizioari lotua) | P1 |
| Sentsore magnetikoa (reed), induktiboa, kapazitiboa | P1 (reed) / P2 |
| Presostatoa | P2 |
| Elektrobalbularen bobina (Y1, Y2...) | P1 |
| Pilotu-argia, buzzerra | P1 |

### 5.3 Hidraulika

| Osagaia | Lehent. |
|---|---|
| Ponpa (emari konstantea) + motorra, depositua | P1 |
| Presio-mugatzeko balbula (segurtasunekoa) | P1 |
| Zilindroak (bakuna, bikoitza, zurtoin bikoitzekoa) | P1 |
| Balbula banatzaileak: 4/2, 4/3 (zentro itxia, tandema, irekia) | P1 |
| Antzezpen-balbula, antzezpen pilotatua | P1 / P2 |
| Emari-erregulagailua (2 bidekoa, konpentsatua P3) | P1 |
| Presio-erreduktorea, sekuentzia-balbula, kontrapresio-balbula | P2 |
| Metagailua | P3 |
| Motor hidraulikoa | P2 |
| Manometroa, emari-neurgailua | P1 |

### 5.4 PLC

| Osagaia | Lehent. |
|---|---|
| PLC bloke bat: sarrerak `I0.0…I1.7`, irteerak `Q0.0…Q1.7` | P1 |
| Sarrerak/irteerak etiketekin lotzea (I/O taula) | P1 |
| Ladder: NA/NI kontaktuak, bobina, Set/Reset, flanko positiboa/negatiboa | P1 |
| Ladder: TON, TOF, TP, CTU, CTD, barneko markak (M) | P2 |
| GRAFCET: urratsak, trantsizioak, ekintzak, dibergentzia/konbergentzia OR eta AND | P1 |
| GRAFCET: denbora-ekintzak, ekintza memorizatuak, makro-urratsak | P2 / P3 |

---

## 6. Simulazio-motorra

### 6.1 Antolatzailea (scheduler)

- Denbora-urrats finkoa: `dt` = 1 ms lehenetsita (konfiguragarria). 2. mailako hidraulikak azpi-urratsak behar ditu (§6.3).
- Abiadura: ×0,1 … ×10, pausa, **urratsez urrats** (scan bat edo ms bat).
- Urrats bakoitzaren ordena:
  1. Erabiltzailearen ekintzak irakurri (pultsadoreak, eragingailuak).
  2. `ElectricSolver` → bobinen eta argien egoera.
  3. `PlcRuntime` (bere scan-denboraren arabera, adib. 10 ms): sarrerak irakurri → programa → irteerak idatzi.
  4. `Coupling` → solenoideak → balbula-posizioak.
  5. `FluidSolver` → presioak eta zilindroen posizioa.
  6. `Coupling` → sentsoreak eta amaiera-etengailuak eguneratu.
  7. Snapshot-a UIra (gehienez 60 Hz-tan).
- **Determinista:** sarrera berek emaitza bera eman behar dute (testetarako ezinbestekoa).

### 6.2 1. maila: simulazio logikoa (MVP)

Fluido-zirkuitua grafo gisa: **nodoak** = konektatutako portuen multzoak (hodi bat = nodo bat).

- Nodo bakoitzaren egoera: `PRESSURE` | `EXHAUST` | `BLOCKED` (eta hidraulikan `TANK`).
- Balbula bakoitzak, bere posizioaren arabera, barneko bideen taula bat ematen du (adib. 5/2 0 posizioan: 1→2, 4→5, 3 itxita).
- **Hedapena:** iturrietatik abiatu eta bide irekietatik hedatu, puntu finko bat lortu arte (pilotaje pneumatikoek balbula-posizioak alda ditzakete → iterazio-muga eta oszilazio-abisua).
- Zilindroa: ganbera bat `PRESSURE` eta bestea `EXHAUST` → `v = ibilbidea / t_ibilbidea` abiaduran mugitu (t lehenetsia: 1 s, emari-erregulagailuak faktore bat aplikatzen du). Bi ganberak presioan edo itxita → geldi.
- Pilotaje pneumatikoa: pilotu-portuaren nodoa `PRESSURE` bada, eragina aktibo.
- Bi presioko balbula (AND) eta hautatzailea (OR) logika boolear zuzenarekin.

### 6.3 2. maila: simulazio fisiko sinplifikatua

Parametro-eredu bilduak (*lumped*): nodo bakoitzak bolumen (V) eta presio (p) bat du.

**Pneumatika** (gas ideala, prozesu isotermoa — sinplifikazioa, `CLAUDE.md`n dokumentatu):

- Murrizketa bakoitzeko masa-emaria (ISO 6358, `C` konduktantzia eta `b` presio-erlazio kritikoa parametro gisa):
  - Itota (`p2/p1 ≤ b`): `qm = C · p1 · ρ0 · √(T0/T1)`
  - Azpisonikoa: `qm = C · p1 · ρ0 · √(T0/T1) · √(1 − ((p2/p1 − b)/(1 − b))²)`
- Ganberaren presioa: `dp/dt = (R·T/V) · (Σqm_sar − Σqm_irt) − (p/V) · dV/dt`
- Balio lehenetsiak: `b ≈ 0,3`, `T = 293 K`; `C` osagai-motaren arabera (parametro editagarria, ez inoiz hardcodeatua).

**Hidraulika** (konprimagarritasun txikia):

- Orifizioa: `Q = Cd · A · √(2|Δp|/ρ) · sign(Δp)`; `Δp → 0` inguruan linealizatu (eremu laminarra) zurruntasun numerikoa saihesteko.
- Nodoaren presioa: `dp/dt = (β/V) · (ΣQ_sar − ΣQ_irt − dV/dt)`, `β` ≈ 1,4·10⁹ Pa (olioa, editagarria).
- Ponpa: Q konstantea; presio-mugatzeko balbula: irekidura proportzionala `p > p_doik.` denean.
- Sistema zurruna da: azpi-urratsak (adib. 0,05–0,1 ms) edo integratzaile semi-inplizitua. Claude Code-k biak probatu eta egonkorrena aukeratu, testekin justifikatuz.

**Zilindroa** (bi domeinuetan):

- `m · ẍ = pA·A_A − pB·A_B − F_karga − F_marruskadura(ẋ)`
- Marruskadura: Coulomb + biskosoa (parametroak). Ibilbide-amaierak: posizioa mugatu eta abiadura 0 (talka inelastikoa).
- Karga: indar konstantea edo masa (zilindroaren propietateetan).

**Mailen arteko kontratua:** zirkuitu batek bi mailetan **sekuentzia logiko bera** eman behar du (denborak bakarrik alda daitezke). Hau §11ko testetan egiaztatu.

### 6.4 Kontrol elektrikoa

- Zirkuitua grafo gisa; kontaktu itxiak = ertz eroaleak.
- Bobina bat aktibo dago +24 V eta 0 V artean bide eroale bat badago (grafoan bilaketa).
- **Erreleen logika:** errele-egoerak aldatu → kontaktuak aldatu → berriro ebatzi, puntu finkora iritsi arte (gehienez N iterazio; gainditzen bada → "oszilazioa" abisua eta simulazioa gelditu).
- Erreleen eta tenporizadoreen aldaketa-denbora (adib. 10 ms) aukeran, lasterketa-baldintzak (*race conditions*) erakusteko.
- Zirkuitulaburra (+24 V zuzenean 0 V-ra) → errorea eta lerroa nabarmendu.

### 6.5 PLC: Ladder

- **Scan-zikloa:** sarrera-irudia irakurri → kateak (*rungs*) goitik behera eta ezkerretik eskuinera ebaluatu → irteera-irudia idatzi. Erreleen logikarekiko aldea **didaktikoki erakusgarria** da: aukera bat "scan-a urratsez urrats" ikusteko.
- Kate-eredua: serie/paralelo zuhaitza (ez sare libreak MVPan).
- Tenporizadoreak IEC estiloan (`IN`, `PT`, `Q`, `ET`).

### 6.6 PLC: GRAFCET (IEC 60848)

Bilakaera-arauak inplementatu eta testekin egiaztatu:

1. Hasierako egoera: hasierako urratsak aktibo.
2. Trantsizio bat **gaituta** dago aurreko urrats guztiak aktibo badaude; **gainditu** egiten da gaituta badago eta bere hartzailetasuna egia bada.
3. Gainditzeak ondorengo urratsak aktibatzen ditu eta aurrekoak desaktibatu, aldi berean.
4. Aldi berean gaindi daitezkeen trantsizio guztiak aldi berean gainditzen dira.
5. Urrats bat aldi berean aktibatu eta desaktibatu behar bada, aktibo geratzen da.

Gainera: **bilaketa egonkorra** (bilakaera iragankorrak; ekintza jarraituak ez dira exekutatzen egoera ezegonkorretan), ekintza jarraituak, baldintzatuak, memorizatuak (S/R), denbora-hartzailetasunak (`t/X3/2s`) eta flankoak (`↑1S2`).

GRAFCETa aukeran **Ladder bihurtu** (urrats bakoitza marka bat, Set/Reset metodoa) — oso erabilgarria ikasteko.

---

## 7. Erabiltzaile-interfazea

### 7.1 Diseinua

```
┌──────────┬───────────────────────────────────────┬────────────┐
│Liburute- │            OIHALA (SVG)               │Propietateak│
│gia       │   sareta, zoom, pan, hautaketa        │ / Ariketa  │
│(bilaketa,│                                       │            │
│ domeinuz)│                                       │            │
├──────────┴───────────────────────────────────────┴────────────┤
│ ▶ ⏸ ⏭  abiadura  maila: [logikoa|fisikoa]  t = 3,42 s  │ Kurbak│
└───────────────────────────────────────────────────────────────┘
```

Fitxak: **Eskema** | **GRAFCET** | **Ladder** | **I/O taula**.

Goiko menu nagusia (atalak): **Editorea** | **Txantiloiak** | **Ariketak** | **Teoria** | **Nire aurrerapena**.

### 7.2 Editorea

- Arrastatu eta jaregin; saretara egokitu; biratu (R), ispilatu (M), ezabatu (Supr), kopiatu/itsatsi.
- Kableak/hodiak: portu batetik bestera klik eginez; bideratze ortogonala eta puntu editagarriak; T loturak automatikoki.
- Desegin/berregin (Ctrl+Z / Ctrl+Y), gutxienez 100 urrats.
- Zoom (gurpila), pan (zuriunea + arrastatu edo erdiko botoia).
- Osagaiak etiketatu (1A, 1V1, 1S1...) eta etiketak automatikoki iradoki.
- **Editatze modua** eta **simulazio modua** argi bereizita (simulazioan eskema blokeatuta).

### 7.3 Simulazioaren ikustaraztea

- Presiodun hodiak urdin ilunez, ihesean urdin argiz/marratuz; korrontedun kableak gorriz.
- Balbulak posizio aktiboa erakutsiz (ikurraren laukia mugituz, ISO estiloan).
- Zilindroaren zurtoina mugimenduan; sentsoreak aktibo daudenean argiztatuta.
- GRAFCETean urrats aktiboak puntu batez; Ladder-en kontaktu eroaleak nabarmenduta.
- **Kurbak:** zilindroaren posizioa, presioak, emariak, seinaleak (uPlot).
- **Espazio-fase diagrama** (desplazamendua–urratsa) automatikoki sortua: oso garrantzitsua sekuentziak aztertzeko.
- Abisuen panela: zirkuitulaburrak, portu libreak, oszilazioak, bi solenoideak aldi berean aktibo...

### 7.4 Laguntza testuinguruan

- Liburutegiko edo oihaleko osagai baten gainean (hover edo luze sakatuta): **txartel txiki bat** ikurra, izena, funtzioa (1–2 esaldi) eta portuen esanahiarekin (1, 2, 3, 4, 5, 12, 14...).
- "Teoria gehiago" esteka → lotutako teoria-fitxa alboko panelean irekitzen da, editorea utzi gabe.
- Testu laburra osagai-definizioan bertan (`ComponentDef.help`, i18n gakoa); fitxarekiko lotura `theoryRef` eremuaren bidez.
- F1 tekla: hautatutako osagaiaren laguntza.

### 7.5 Ziklo-analisia (kontsumoa eta denborak)

Simulazioaren ondoren (edo ziklo bat amaitzean) panel bat, emaitza hauekin:

| Magnitudea | 1. maila (logikoa) | 2. maila (fisikoa) |
|---|---|---|
| Ziklo-denbora eta urrats bakoitzaren iraupena | ✔ (eredu logikoaren denborekin) | ✔ (kalkulatuta) |
| Aire-kontsumoa zikloko (Nl) eta minutuko (Nl/min) | ✔ estimazio geometrikoa: ganberaren bolumena × (p_abs / p_atm) | ✔ masa-emarien integrazioa |
| Kontsumoa zilindroka banatuta | ✔ | ✔ |
| Hidraulika: ponparen energia, galerak mugatzailean (beroa) | — | ✔ |
| Gehieneko presioak eta indarrak | — | ✔ |

- Erabilitako formulak "Nola kalkulatu da?" atalean erakutsi, teoria-fitxetara estekatuta (formula berak, §8.3).
- Emaitzak CSV gisa esportagarriak.
- Ziklo-hasiera eta -amaiera: lehen urratsaren berrabiaraztea edo erabiltzaileak markatutako gertaera bat.

### 7.6 2D prozesu animatuak (eszenak)

Zirkuitua edo PLCa **makina simulatu txiki bati** lotzeko aukera: zilindroek piezak bultzatzen dituzte, sentsoreek piezak detektatzen dituzte, eta abar. Fisika-motorrik gabe: zinematika sinplea (abiadura konstanteko zintak, zurtoinaren posizioak bultzatzen ditu objektuak, talka-kutxa angeluzuzenak).

Eszena-formatua (`src/scenes/<id>/scene.json` + SVG grafikoak):

```json
{
  "id": "scn-sailkatzailea",
  "title": "Piezen sailkatzailea (metalikoak / ez-metalikoak)",
  "size": [800, 400],
  "actuators": [
    { "id": "pusher1", "bindTo": "1A", "kind": "linear", "from": [300, 200], "dir": [0, 1], "strokePx": 80 }
  ],
  "sensors": [
    { "id": "s-ind", "tag": "B1", "kind": "inductive", "zone": [250, 180, 20, 40], "detects": ["metal"] },
    { "id": "s-opt", "tag": "B2", "kind": "optical", "zone": [250, 180, 20, 40] }
  ],
  "conveyors": [ { "id": "c1", "tag": "M1", "rect": [0, 180, 600, 40], "speedPxS": 60 } ],
  "spawners": [ { "at": [10, 190], "everyMs": 4000, "pieces": ["metal", "plastic"], "random": true } ],
  "bins": [ { "id": "b-metal", "rect": [290, 300, 60, 60], "accepts": ["metal"] } ],
  "goals": { "sortedCorrectly": 10, "maxErrors": 0 }
}
```

- `bindTo` / `tag` bidez zirkuituarekin lotzen da (§4ko etiketa berak). Zilindroaren posizioa eszenara doa; eszenako sentsoreak zirkuituko sarrera bihurtzen dira (sentsore-osagai "birtualak").
- Eszena-bista eskemaren ondoan edo fitxa propio batean, eta abiadura simulazioarekin sinkronizatuta.
- **Helburuak** (`goals`) ariketa gisa erabil daitezke: "sailkatu 10 pieza akatsik gabe" → egiaztatzaile automatikoa.
- Akatsak eszenan: piezak talka egiten du, pieza erori da, zinta blokeatuta → abisuak.

Hasierako eszenak (P1 → P2):
1. Prentsa edo markatzailea (zilindro bat, eskuzko agintea / bi eskuko agintea).
2. Zinta garraiatzailea + bultzatzailea (sentsore optikoa).
3. Piezen sailkatzailea (induktiboa + optikoa, bi bultzatzaile).
4. Elikadura-biltegia (grabitatezko biltegia + kanporatzailea + zulagailua: A+ B+ B- A- sekuentzia klasikoa).

---

## 8. Ikaskuntza-modulua

Erabiltzaile bakarrerako da: ez dago notarik ez irakasle-panelik; **autoebaluazioa** bakarrik.

### 8.1 Ariketa-formatua (`src/learning/exercises/*.json`)

```json
{
  "id": "pn-03",
  "title": "Zilindro baten agintea bi eskuekin",
  "domain": "pneumatic",
  "level": 1,
  "statement_md": "Eragin bikoitzeko zilindro batek (1A) aurrera egin behar du bi pultsadoreak sakatuta daudenean bakarrik...",
  "allowedComponents": ["pn.cyl.double", "pn.valve.5-2.pilot", "pn.valve.and", "pn.valve.3-2.button-spring"],
  "starterCircuit": null,
  "checks": [
    { "type": "sequence", "stimuli": [["press", "1S1"], ["press", "1S2"]], "expect": ["1A+"] },
    { "type": "never", "stimuli": [["press", "1S1"]], "expect": ["1A+"], "withinMs": 3000 }
  ],
  "hints_md": ["Pentsatu zein balbulak egiten duen AND funtzio logikoa."],
  "theoryRefs": ["teoria/balbula-logikoak.md"]
}
```

**Egiaztatzailea:** zirkuitua burugabe (*headless*) simulatu, estimuluak aplikatu eta gertaerak (`1A+`, `1A-`, `Y1=1`...) espero diren sekuentziarekin alderatu. Emaitza: zein egiaztapen gainditu diren eta zergatik huts egin duten.

### 8.2 Edukia (hasierakoa; zerrenda zabalduko da)

1. **Pneumatika:** agintea zuzena eta zeharkakoa, bi eskuko agintea (AND), bi lekutik agintea (OR), abiaduraren erregulazioa (sarreran eta irteeran), joan-etorri automatikoa, tenporizazioa, A+ B+ A- B- sekuentzia **kaskada metodoarekin** eta **urratsez urratseko metodoarekin**, seinale-gainjartzeak.
2. **Elektropneumatika:** autoatxikimendua (martxa/geldialdia lehentasunekin), elektrobalbula mono/biegonkorrak, sekuentziak erreleekin, tenporizadoreak, zikloa/ziklo jarraitua, larrialdi-geldialdia.
3. **Hidraulika:** oinarrizko zirkuitua, presio-mugatzeko balbula, 4/3 zentro-motak, abiaduraren erregulazioa, kargaren eustea (antzezpen pilotatua), sekuentzia-balbula.
4. **PLC:** I/O taula, Ladder oinarrizkoa, tenporizadoreak/kontagailuak, GRAFCET lineala, dibergentziak OR/AND, GRAFCET → Ladder.

### 8.3 Teoria-atala (kontzeptuak eta formulak)

Atal propioa menu nagusian. Edukia Markdown-ean (`src/learning/theory/<domeinua>/*.md`), frontmatter-arekin:

```markdown
---
id: pn-zilindro-indarra
title: Zilindroaren indarra eta kontsumoa
domain: pneumatic
tags: [zilindroa, indarra, kontsumoa]
related: { templates: [tpl-pn-02], exercises: [pn-05], calculators: [calc-cyl-force] }
status: draft        # draft | reviewed (erabiltzaileak berrikusi ondoren)
---
```

#### 8.3.1 Fitxa baten egitura
1. **Kontzeptua** — azalpen laburra eta ikurra (liburutegiko SVG bera txertatuta: `![[symbol:pn.cyl.double]]`).
2. **Formulak** — KaTeX bidez, aldagai bakoitzaren esanahia eta **SI unitateak** (eta praktikan ohikoak: bar, mm, l/min).
3. **Adibide ebatzia** — urratsez urrats, unitate-bihurketekin.
4. **Ohiko akatsak** — adib. zurtoinaren azalera kontuan ez hartzea atzerakoan.
5. **Lotura praktikoa** — "Ireki txantiloia" botoia (lotutako zirkuitua editorean kargatzen du) eta "Probatu kalkulagailua".

#### 8.3.2 Hasierako gai-zerrenda (zabalgarria)
- **Fluidoen oinarriak:** presioa (absolutua/manometrikoa), unitateak, Pascal-en printzipioa, emaria, jarraitutasun-ekuazioa.
- **Pneumatika:** airearen prestaketa; zilindroaren indarra (aurrera/atzera), errendimendua eta karga-faktorea; aire-kontsumoa; abiadura eta emari-erregulazioa (sarreran vs. irteeran); balbulen nomenklatura (bideak/posizioak) eta eragingailuak; funtzio logikoak (AND/OR/NOT/memoria); espazio-fase diagrama; seinale-gainjartzea; kaskada-metodoa eta urratsez urratseko metodoa.
- **Elektropneumatika:** NA/NI kontaktuak, autoatxikimendua, erreleak eta tenporizadoreak, sentsore-motak, segurtasun-printzipioak (larrialdi-geldialdia, lehentasunak).
- **Hidraulika:** olioaren propietateak; ponparen potentzia eta emaria; zilindroaren abiadura eta indarra; presio-balbulak; 4/3 zentro-motak eta erabilerak; galerak eta beroa (kontzeptuzko mailan).
- **PLC:** scan-zikloa; I/O irudia; Ladder oinarriak; tenporizadore/kontagailu IEC; GRAFCET: elementuak, bilakaera-arauak, dibergentziak; GRAFCET → Ladder bihurketa.

Formula-adibideak (fitxetan garatzeko; balio eta koefiziente zehatzak erabiltzaileak berrikusi):

$$F_{aurrera} = p \cdot \frac{\pi D^2}{4} \cdot \eta \qquad F_{atzera} = p \cdot \frac{\pi (D^2 - d^2)}{4} \cdot \eta$$

$$v = \frac{Q}{A} \qquad P_{hidr} = p \cdot Q \qquad P_{motor} = \frac{p \cdot Q}{\eta_{tot}}$$

#### 8.3.3 Kalkulagailuak (P2)
Formula garrantzitsuenen kalkulagailu interaktiboak (`src/learning/calculators/`): sarrerako balioak eta unitate-hautatzailea → emaitza, erabilitako formula eta tarteko urratsak. Kalkulagailu-funtzioak TS hutsean eta testekin. Hasierakoak: zilindroaren indarra, aire-kontsumoa, zilindroaren abiadura (hidraulika), ponparen potentzia.

#### 8.3.4 Bilaketa eta nabigazioa
Bilaketa testu osoan eta etiketaka; domeinuaren arabera iragazi; "lotutako edukia" alboko panelean.

**Edukiaren zuzentasuna:** Claude Code-k zirriborroak sor ditzake, baina beti `status: draft` gisa eta interfazean "Zirriborroa — berrikusteko" etiketarekin. Erabiltzaileak bakarrik aldatzen du `reviewed`-era.

### 8.4 Glosarioa

`src/i18n/glossary.json`: euskara–gaztelania–ingelesa terminoak (adib. *eragin bikoitzeko zilindroa / cilindro de doble efecto / double-acting cylinder*). **Hasierako zerrenda erabiltzaileak baieztatu behar du**; ez asmatu terminorik: zalantza dagoenean, markatu.

### 8.5 Zirkuitu-txantiloiak (aurrez muntatuak)

Atal propioa menu nagusian: zirkuitu osoak eta funtzionalak, ireki eta zuzenean simulatzeko. Ariketetatik (§8.1) bereizten dira: ariketetan erabiltzaileak zirkuitua **diseinatzen** du; txantiloietan zirkuitua **emanda** dago eta **aztertu** egiten da.

Txantiloi bakoitza karpeta bat da (`src/learning/templates/<id>/`):

```
tpl-pn-05-kaskada-ABBA/
  template.json      # metadatuak
  circuit.automalab.json   # zirkuitua (§4ko formatu bera)
  description.md     # funtzionamenduaren azalpena
  quiz.json          # galdetegia (§8.6)
```

`template.json`:
```json
{
  "id": "tpl-pn-05",
  "title": "A+ B+ B- A- sekuentzia, kaskada-metodoa",
  "domain": "pneumatic",
  "level": 2,
  "tags": ["sekuentzia", "kaskada", "seinale-gainjartzea"],
  "simulationLevel": "logic",
  "theoryRefs": ["pn-kaskada-metodoa", "pn-espazio-fase"],
  "status": "draft"
}
```

Funtzionalitateak:
- **Katalogoa:** txartelak aurrebista txiki batekin (SVG miniatura automatikoa), domeinu, maila eta etiketen iragazkiekin.
- **Ireki** → editorean kargatzen da **kopia** gisa (jatorrizkoa ez da inoiz aldatzen). "Berrezarri txantiloia" botoia.
- **Azalpen-panela** alboan (`description.md`), osagaien etiketak klikagarriak: klik → osagaia oihalean nabarmendu.
- **Ibilbide gidatua** (aukerakoa, P2): urratsez urratseko azalpena, urrats bakoitzean simulazioa egoera jakin batera eramanez ("sakatu 1S1 eta ikusi zer gertatzen den 1V1-ekin").
- **Akatsen modua** (P2): txantiloiaren aldaera bat akats baten bidez (kable bat falta, balbula okerra, sentsore lekuz kanpo), eta erabiltzaileak akatsa aurkitu behar du — mantentze-lanetako praktikarako oso baliagarria.
- Erabiltzaileak bere zirkuituak ere **txantiloi pertsonal** gisa gorde ditzake (IndexedDB), galdetegi propioarekin edo gabe.

Hasierako txantiloiak: §8.2ko gai-zerrenda bera (domeinu bakoitzeko 4–6), eta §11ko erreferentzia-zirkuituak oinarri gisa berrerabili.

### 8.6 Galdetegiak (autoebaluazioa)

Txantiloi bakoitzak `quiz.json` bat du. Galderak **zirkuituari lotuta** daude: osagaiak nabarmendu, simulazioa egoera jakin batean jarri edo erantzuna simulatuz egiaztatu daiteke.

#### 8.6.1 Galdera-motak

| Mota | Deskribapena | Lehent. |
|---|---|---|
| `single` | Aukera anitzekoa, erantzun zuzen bakarra | P1 |
| `multiple` | Aukera anitzekoa, erantzun zuzen bat baino gehiago | P1 |
| `truefalse` | Egia/gezurra | P1 |
| `numeric` | Zenbakizko erantzuna, unitatea eta tolerantzia (adib. ±% 2) | P1 |
| `identify` | "Klik egin zirkuituan …-ren funtzioa betetzen duen osagaian" | P1 |
| `predict` | "Zer gertatuko da 1S1 sakatzean?" → erantzun ondoren, **simulazioak erakusten du** egia | P1 |
| `order` | Gertaerak ordenatu (adib. sekuentzia baten urratsak) | P2 |
| `fault` | Akatsen moduko txantiloian, akatsa duen osagaia/kablea aurkitu | P2 |

#### 8.6.2 Formatua

```json
{
  "templateId": "tpl-pn-05",
  "questions": [
    {
      "id": "q1",
      "type": "identify",
      "prompt_md": "Zein balbulak egiten du talde-aldaketa I → II?",
      "answer": { "componentIds": ["v3"] },
      "explanation_md": "1V3 memoria-balbula da...",
      "theoryRef": "pn-kaskada-metodoa"
    },
    {
      "id": "q2",
      "type": "predict",
      "prompt_md": "Zilindro biak hasierako posizioan daude. Zer gertatzen da martxa (1S1) sakatzean?",
      "setup": { "state": "initial" },
      "stimuli": [["press", "1S1"]],
      "options": ["1A+", "2A+", "Ezer ez", "1A+ eta 2A+ aldi berean"],
      "answer": { "index": 0 },
      "verifyBySimulation": true,
      "explanation_md": "..."
    },
    {
      "id": "q3",
      "type": "numeric",
      "prompt_md": "6 bar-etan, D = 32 mm, η = 0,9: zein da aurrerako indarra?",
      "answer": { "value": 434, "unit": "N", "tolerancePct": 2 },
      "explanation_md": "$F = p \\cdot \\frac{\\pi D^2}{4} \\cdot \\eta$ ..."
    }
  ]
}
```

- `verifyBySimulation: true` duten galderetan, testak egiaztatzen du simulazio-motorrak erantzun zuzen bera ematen duela (galdetegiaren eta motorraren arteko koherentzia).
- `numeric` galderen balioak, ahal denean, `calculators/`-eko funtzio beraren bidez kalkulatu testetan (zenbaki okerrik ez gordetzeko).

#### 8.6.3 Galdetegiaren funtzionamendua

- **Modu bi:** *ikasketa-modua* (galdera bakoitzaren ondoren zuzenketa eta azalpena) eta *azterketa-modua* (azkenean bakarrik zuzenketa, denbora-neurgailu aukerakoarekin).
- Galderen eta aukeren ordena nahastu aukeran.
- Emaitza: puntuazioa, gaizki erantzundakoen zerrenda azalpenekin eta lotutako teoriarako estekak.
- **Ausazko galdetegia:** domeinu/maila/etiketa batetik hainbat txantiloitako galderak nahastuta (adib. "20 galdera elektropneumatikakoak").
- **Errepasoa:** huts egindako galderak berriro agertzen dira hurrengo saioetan (errepikapen espaziatu sinplea, P2).
- Erabiltzaileak bere galderak sortu ditzake txantiloi pertsonaletan, galdera-editore sinple baten bidez (P2).

### 8.8 Sekuentzia-sortzailea

Sekuentzia bat testu gisa idatzi (adib. `A+ B+ B- A-`) eta aplikazioak automatikoki sortzen ditu:

1. **Espazio-fase diagrama** teorikoa.
2. **Seinale-gainjartzeen detekzioa:** zein urratsetan dagoen gainjartzea eta zergatik.
3. **Kaskada-taldeen banaketa** (I, II, III…) eta behar diren memoria-balbulen kopurua.
4. **Zirkuitu pneumatikoa** (kaskada-metodoa), editorean kargatzeko moduan.
5. **Urratsez urratseko zirkuitua** (P2).
6. **Zirkuitu elektropneumatikoa** erreleekin (P2).
7. **GRAFCETa** (eta, horren bidez, Ladder-a GRAFCET → Ladder bihurtzailearekin).

Notazioa:
- P1: zilindroak A–F letrekin, urrats bakoitzean mugimendu bat (`A+ B+ B- A-`).
- P2: mugimendu aldiberekoak parentesi artean (`A+ (B+ C+) A- (B- C-)`), tenporizazioak (`A+ T2s A-`), errepikapenak.
- Analizatzaile sintaktikoak errore argiak ematen ditu euskaraz ("3. urratsa: B+ bi aldiz jarraian, B- falta da").

**Zirkuituen kokapen automatikoa** (sinplea eta estandarra): zilindroak goiko errenkadan, beren balbulak azpian, kaskada-lerroak (taldeak) horizontalki behean, amaiera-etengailuak zilindroen ondoan etiketatuta (a0, a1, b0, b1...).

**Alderatze-modua:** erabiltzailearen zirkuitua eta sortutako sekuentzia alderatu → biak simulatu eta gertaera-sekuentziak alderatu ("zure zirkuituak A- egiten du B- baino lehen, 3. urratsean").

Arkitektura: `src/generator/` (TS hutsa: parser → analisia → zirkuitu/GRAFCET sortzaileak), testekin.

### 8.7 Nire aurrerapena

IndexedDB-n gordeta, eta JSON gisa esportagarria:
- Txantiloi bakoitzeko: irekita / galdetegia eginda / puntuazio onena / azken data.
- Ariketak: gaindituak eta saiakera-kopurua.
- Domeinuen araberako laburpena (adib. pneumatika % 80, hidraulika % 45) eta galdera-mota bakoitzeko asmatze-tasa.
- Teoria-fitxak: irakurrita/ez.

---

## 9. Ikurrak (SVG)

- ISO 1219-1 (fluidoak) eta IEC 60617 / EN 60617 (elektrikoak) arauetan oinarrituta; norberak marraztuak.
- Sareta-modulu komuna (adib. 10 px = 1 unitate), portuak sareta-puntuetan.
- Balbulak modularki osatu: laukiak (posizioak) + bideak + eragingailuak, horrela edozein konbinazio (3/2, 5/2, 5/3, 4/3...) sortzeko.
- Ikur bakoitzak egoera-aldaerak ditu (posizioa, aktiboa/ez-aktiboa).
- Ikurren galeria-orri bat (`/symbols` garapen-ibilbidea) ikusizko berrikuspenerako eta Playwright pantaila-argazkietarako.

---

## 10. Biltegiratzea eta esportazioa

- Proiektuak IndexedDB-n, gordetze automatikoarekin (adib. 5 s-ro).
- JSON esportatu/inportatu (`.automalab.json`).
- Eskema **SVG/PNG** gisa esportatu (dokumentazioan edo klaseetan erabiltzeko).
- Ariketen aurrerapena (gaindituak) IndexedDB-n.

**Babeskopia (garrantzitsua):** nabigatzaileak IndexedDB ezaba dezake (cache-garbiketa, leku falta). Horregatik:
- "Esportatu dena" botoia: proiektuak, txantiloi pertsonalak, galdera propioak eta aurrerapena fitxategi bakar batean (`automalab-babeskopia-AAAA-HH-EE.json`). "Inportatu dena" botoia, aurreikuspenarekin (zer gainidatziko den).
- **Abisua:** azken babeskopiatik 7 egun igaro badira eta aldaketak badaude, banda diskretu bat ("Ez duzu babeskopiarik egin 9 egunetan — Esportatu orain"). Tartea konfiguragarria.
- `navigator.storage.persist()` eskatu lehen abiaraztean, biltegiratze iraunkorra lortzeko.

---

## 11. Erreferentzia-zirkuituak (testak)

Zirkuitu hauek `tests/engine/fixtures/`-en egongo dira, JSON gisa, eta testek simulazioa burugabe exekutatuko dute:

| # | Zirkuitua | Egiaztatu beharrekoa |
|---|---|---|
| R1 | Eragin bakuneko zilindroa + 3/2 pultsadorea | Sakatu → 1A+; askatu → 1A- |
| R2 | Eragin bikoitzekoa + 5/2 biegonkorra (pilotaje pneumatikoa) | Pultsu bakoitzak posizioa aldatzen du eta mantendu |
| R3 | AND / OR balbulak | Egia-taulak |
| R4 | Joan-etorri automatikoa rodilloekin | Ziklo jarraitua, denbora-tarte espero batean |
| R5 | A+ B+ B- A- kaskada (2 talde) | Sekuentzia zuzena, blokeorik gabe |
| R6 | Elektropneumatika: autoatxikimendua martxa/geldialdiarekin | Geldialdiak lehentasuna du |
| R7 | A+ B+ A- B- erreleekin eta reed sentsoreekin | Sekuentzia zuzena |
| R8 | Ladder: TON 2 s | Irteera 2 s ± scan-denbora ondoren |
| R9 | GRAFCET: dibergentzia AND + konbergentzia | 1-5 arauak; 5. araua kasu berezi batekin |
| R10 | Hidraulika: ponpa + mugatzailea + 4/3 + zilindroa | Presioa ≤ p_doik.; 2. mailan zilindroaren abiadura ≈ Q/A (±10 %) |
| R11 | Mailen koherentzia | R1–R7 bi mailetan: sekuentzia bera |
| R12 | Sekuentzia-sortzailea | Gutxienez 10 sekuentziatarako (2–4 zilindro), sortutako zirkuituak eta GRAFCETak sekuentzia zuzena egiten dute simulazioan |
| R13 | Eszenak | "Biltegia + zulagailua" eszena R5 zirkuituarekin: N pieza akatsik gabe prozesatuta |
| R14 | Ziklo-analisia | R1en aire-kontsumoa = eskuzko kalkulua (±% 1) |

Gainera: serializazio-testak (gorde → kargatu → berdina) eta E2E testak (zirkuitu bat marraztu eta simulatu UItik).

**Edukiaren testak (automatikoak, eduki guztiarentzat):**
- Txantiloi guztiak kargatu, balidatu (erroreak = 0) eta simulatu daitezke, blokeorik gabe.
- Galdetegi guztiak eskemaren aurka balidatuta; `componentIds` guztiak zirkuituan existitzen dira.
- `verifyBySimulation` duten galderen erantzuna = motorraren emaitza.
- `numeric` galderen balioa = dagokion kalkulagailu-funtzioaren emaitza (tolerantzia barruan).
- Teoria-fitxen `related` estekak existitzen diren IDetara doaz; KaTeX formula guztiak errorerik gabe errendatzen dira.

---

## 12. Kalitatea eta errendimendua

- 200 osagai arteko zirkuituak ≥ 30 fps-tan simulazio logikoan.
- TypeScript `strict`, ESLint, Prettier.
- Motorraren estaldura ≥ % 80.
- Irisgarritasuna: teklatuz erabil daitekeen oinarrizko nabigazioa; kolorez gain beste adierazle bat (marrak, ikonoak).
- UI testu guztiak `i18n/eu.json`-en; ez dago testu hardcodeaturik.

---

## 13. Garapen-plana: MVPak, faseak eta egiaztapena

Proiektua **bi MVP mugatan** eta **osatze-fase** batzuetan garatzen da. MVP bakoitza bera bakarrik erabil daitekeen tresna bat da: muga bakoitzean gelditu, aplikazioa benetan erabili eta gero erabaki nola jarraitu.

### 13.0 Fase guztietarako arauak

Fase bakoitzaren amaieran, Claude Code-k:

1. Testak berdean (`npm test`, `npm run test:e2e`) eta `npm run build` errorerik gabe utzi.
2. `CHANGELOG.md` eguneratu eta git-en etiketa bat sortu (`fase-2`, `mvp-1`…), atzera egin ahal izateko.
3. **Egiaztatze-gida bat idatzi** `docs/egiaztapena/fase-N.md` fitxategian, euskaraz, erabiltzaileak nabigatzailean eskuz egiaztatzeko:
   - Nola abiarazi (`npm run dev` eta URLa).
   - 5–10 proba zehatz, formatu honetan: **Egin:** … → **Espero da:** … → ☐ Ondo / ☐ Gaizki.
   - Proba-fitxategiak (`docs/egiaztapena/fitxategiak/*.automalab.json`), inportatu eta zuzenean probatzeko.
   - Fase honetan **ez** dagoena (nahasmenik ez sortzeko).
4. **Gelditu** eta erabiltzailearen erantzunaren zain egon. Erabiltzaileak akatsak aurkitzen baditu, fase berean konpondu eta gida berriro pasa, hurrengo fasera igaro aurretik.
5. Fase bat handiegia bada, azpi-fasetan zatitu (2a, 2b…) eta azpi-fase bakoitzak bere gida txikia izango du.

---

### 🟢 MVP 1 — «Pneumatika erabilgarria»

**Helburua:** zirkuitu pneumatikoak marraztu eta simulatu, lehen txantiloiak eta galdetegiak erabili eta oinarrizko teoria kontsultatu. Ikaskuntza-ziklo osoa, domeinu bakar batean.

#### 0. fasea — Proiektuaren oinarria
- Vite + React + TS + Vitest + Playwright + ESLint/Prettier; direktorio-egitura (§3.1); `CLAUDE.md`, `CHANGELOG.md`, i18n oinarria; menu nagusiaren hutsuneak (5 atalak, edukirik gabe).
- ✅ Aplikazioa irekitzen da euskarazko menuarekin; test bat berdean; build-a ondo.

#### 1. fasea — Datu-eredua, editorea eta babeskopia
- `core/` eredua, serializazioa (`schemaVersion`), balidazioa.
- SVG oihala: sareta, zoom/pan, hautaketa, mugitu, biratu, ispilatu, ezabatu, desegin/berregin; hodi ortogonalak.
- IndexedDB, JSON esportazioa/inportazioa, **babeskopia osoa eta abisua** (§10), `storage.persist()`.
- Proba-osagaiak: iturria, 3/2 balbula, zilindro bakuna (simulaziorik gabe).
- ✅ Zirkuitu bat marraztu, gorde, nabigatzailea itxi, ireki eta berdin dago; babeskopia esportatu eta beste profil batean inportatu.

#### 2. fasea — Pneumatika, 1. maila
- Scheduler-a, `FluidSolver` logikoa, P1 osagai pneumatiko guztiak eta ikurrak.
- Simulazio-kontrolak, koloreak, zilindroaren animazioa, pultsadore interaktiboak, espazio-fase diagrama.
- **Laguntza testuinguruan** (§7.4), teoria-estekarik gabe oraingoz.
- ✅ R1–R5 berdean; erabiltzaileak R5 UItik marraztu eta ondo simulatzen da.

#### 3. fasea — Lehen ikaskuntza-zikloa
- Teoria-atala: Markdown + KaTeX, nabigazioa, ikurrak txertatzea; **4–5 fitxa pneumatiko** (zirriborroak). Laguntza-txartelak fitxekin lotu.
- Txantiloi-katalogoa (kopia gisa ireki, azalpen-panela osagai klikagarriekin): **5 txantiloi pneumatiko**.
- Galdetegi-motorra mota hauekin: `single`, `truefalse`, `numeric`, `predict`; ikasketa-modua.
- «Nire aurrerapena» oinarrizkoa.
- ✅ Edukiaren testak (§11) berdean; E2E: txantiloia ireki → galdetegia egin → emaitza aurrerapenean.

> 🏁 **MVP 1 muga.** Etiketa: `mvp-1`. Gomendioa: 1–2 astez erabili, zuzenketak eta lehentasunak apuntatu, eta `docs/mvp1-iritzia.md`-n bildu. Claude Code-k fitxategi hori irakurri eta, behar bada, plana egokituko du MVP 2rekin hasi aurretik.

---

### 🔵 MVP 2 — «Elektropneumatika eta PLC»

**Helburua:** kontrol elektrikoa, Ladder eta GRAFCET, sekuentzia-sortzailea eta domeinu hauetako txantiloiak eta galdetegiak.

#### 4. fasea — Elektropneumatika
- `ElectricSolver`, P1 osagai elektrikoak, elektrobalbulak, sentsoreak, etiketen bidezko lotura; abisuak.
- 4–5 txantiloi eta fitxa elektropneumatiko.
- ✅ R6–R7 berdean.

#### 5. fasea — PLC: Ladder
- PLC blokea, I/O taula, Ladder editorea (kontaktuak, bobinak, S/R, flankoak, TON/TOF/CTU), scan-a urratsez urrats. Motorra Web Worker-era, beharrezkoa bada.
- ✅ R8 berdean; R7 Ladder-ekin errepikatuta, sekuentzia bera.

#### 6. fasea — PLC: GRAFCET
- GRAFCET editorea eta interpretatzailea (§6.6), GRAFCET → Ladder bihurtzailea.
- 4–5 txantiloi eta fitxa PLC/GRAFCET.
- ✅ R9 berdean; A+ B+ A- B- GRAFCETekin eta Ladder bihurtuarekin, emaitza bera.

#### 7. fasea — Sekuentzia-sortzailea eta galdetegi osoa
- Sekuentzia-sortzailea P1 (§8.8): parserra, espazio-fase diagrama, gainjartzeak, kaskada-zirkuitua, GRAFCETa, alderatze-modua.
- Galdera-mota guztiak P1 (`multiple`, `identify` gehituta), azterketa-modua, ausazko galdetegia, aurrerapen osoa.
- ✅ R12 berdean; E2E: `A+ B+ B- A-` idatzi → zirkuitua sortu → simulatu → ondo.

> 🏁 **MVP 2 muga.** Etiketa: `mvp-2`. Berriro: erabili, iritziak `docs/mvp2-iritzia.md`-n bildu, eta plana egokitu.

---

### ⚪ Osatze-faseak (MVP 2 ondoren, ordena alda daiteke)

#### 8. fasea — Hidraulika, 1. maila
- P1 osagai hidraulikoak eta ikurrak; `TANK` egoera; 4–5 txantiloi eta fitxa.
- ✅ R10en zati logikoa berdean.

#### 9. fasea — Simulazio fisikoa eta ziklo-analisia
- 2. mailako pneumatika eta hidraulika (§6.3), parametroak, manometroak, kurbak, maila-hautatzailea.
- **Ziklo-analisia** (§7.5) bi mailetan; kalkulagailuak (§8.3.3).
- ✅ R10 osoa, R11 eta R14 berdean; zenbakizko egonkortasuna dt-rekiko frogatuta.

#### 10. fasea — 2D prozesu animatuak
- Eszena-motorra eta -bista (§7.6), sentsore birtualak, helburuak ariketa gisa; 4 hasierako eszenak.
- ✅ R13 berdean; E2E: sailkatzailea PLCarekin, 10 pieza ondo sailkatuta.

#### 11. fasea — Diseinu-ariketak eta eduki osoa
- Ariketa-formatua eta egiaztatzailea (§8.1), glosarioa, gainerako teoria-fitxak eta txantiloiak.
- ✅ Ariketa bakoitzak soluzio zuzen bat eta oker bat ditu testetan.

#### 12. fasea — Akabera
- PWA (offline, instalagarria), SVG/PNG esportazioa, P2 osagaiak, errendimendua, HTML bakarreko build-a aukeran.
- P2 ikaskuntza-funtzioak: ibilbide gidatuak, akatsen modua, `fault`/`order` galderak, errepikapen espaziatua, galdera-editorea; sekuentzia-sortzailearen P2 (aldiberekoak, tenporizazioak, urratsez urratseko eta elektropneumatikako zirkuituak).
- ✅ Sarerik gabe funtzionatzen du; Lighthouse PWA egiaztapenak gaindituta.

---

## 14. Erabiltzaileak eman behar duen informazioa

Claude Code-k galdetuko du behar denean, baina aldez aurretik prestatzea komeni da:

- [ ] **Terminologia:** euskarazko termino ofizialak edo ikastetxean erabiltzen direnak (glosarioa).
- [ ] **Ariketak:** klasean erabiltzen diren ariketa pneumatiko/elektropneumatikoen enuntziatuak (lehentasuna duten 10–15).
- [ ] **Balio tipikoak:** hornidura-presioak, zilindro-neurri ohikoak, ponparen emaria eta hidraulikako presio tipikoak.
- [ ] **PLCaren nomenklatura:** `I0.0/Q0.0` (Siemens estiloa) edo `%I0.0/%Q0.0` (IEC); zein PLC erabiltzen den lantegian.
- [ ] **GRAFCET-konbentzioak:** nola idazten diren hartzailetasunak eta ekintzak klasean.
- [ ] Erreferentzia-dokumentazioa (arauen laburpenak, apunteak), eskuragarri baldin badago.
- [ ] **Txantiloiak:** lehentasuna duten zirkuituen zerrenda (klaseko apunteetakoak, adibidez), eta horiei buruzko galdera tipikoak.
- [ ] **Teoria:** erabiltzen dituzun formulak eta koefizienteak (errendimendua η, karga-faktorea…) eta haien jatorria, fitxak horiekin bat etor daitezen.
- [ ] **Berrikuspena:** `draft` egoeran dauden fitxa, txantiloi eta galdera guztiak berrikusi eta `reviewed` gisa markatu.

---

## 15. Arriskuak eta erabaki irekiak

| Gaia | Arriskua / zalantza | Proposamena |
|---|---|---|
| Hidraulika fisikoaren zurruntasuna | Simulazio ezegonkorra | Azpi-urratsak + laminarizazioa; testak dt desberdinekin |
| Ladder sare libreak | Konplexutasun handia | MVPan serie/paralelo zuhaitza bakarrik |
| Editorearen konplexutasuna | Denbora asko UIan | Lehenik funtzionala, gero itxura |
| Mailen arteko koherentzia | Emaitza desberdinak | R11 testa derrigorrezkoa |
| Edukiaren zuzentasuna | Akats teknikoak teorian | Erabiltzaileak dena berrikusi; "zirriborroa" etiketa |
| Galdera okerrak | Erantzun okerrak autoebaluazioan | `verifyBySimulation` eta kalkulagailuen bidezko testak; `draft` etiketa |
| Lizentzia/marka | Software komertzialaren kopia | §0.5 araua: dena propioa |
