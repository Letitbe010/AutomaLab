# CLAUDE.md — AutomaLab

Proiektuaren espezifikazio osoa `SPEC.md` fitxategian dago. **Irakurri osorik edozein lan hasi aurretik.**

## Arau nagusiak

- Jarraitu `SPEC.md` §13ko faseak hurrenez hurren; ez hasi fase berri bat aurrekoaren onarpen-irizpideak bete eta erabiltzaileak baieztatu arte.
- Fase bakoitzaren amaieran idatzi `docs/egiaztapena/fase-N.md` (eskuzko egiaztatze-gida euskaraz) eta gelditu.
- MVP mugetan (`mvp-1`: 3. fasearen ondoren; `mvp-2`: 7. fasearen ondoren) gelditu beti eta itxaron `docs/mvpN-iritzia.md` fitxategiari.

## Uneko egoera

- 0. fasea: baieztatuta (2026-11-04).
- 1. fasea: amaituta (1a datu-eredua + ikurrak, 1b SVG editorea, 1c gordetzea eta babeskopia), etiketa `fase-1`. Erabiltzailearen egiaztapena pendiente.
- Hurrengoa: **2. fasea** (pneumatika, 1. maila: scheduler, FluidSolver logikoa, P1 osagai pneumatikoak, simulazio-kontrolak, espazio-fase diagrama, laguntza testuinguruan). Planifikatu azpi-fasetan eta proposatu plana erabiltzaileari hasi aurretik.
- **Berrikuspenak:** erabiltzaileak 1a eta 1b-ko egiaztapenak geroago egitea erabaki zuen (2026-11-04). Zerrenda: `docs/berrikuspenak.md`. Eguneratu fase bakoitzean eta gogorarazi MVP 1 mugan.
- Simulazio-motorra (`src/engine/`) TypeScript hutsa da, UIrik gabe, eta testekin garatzen da (Vitest).
- Kodea ingelesez; interfazea euskara batuan (`src/i18n/eu.json`); dokumentazioa euskaraz.
- Ez asmatu datu teknikorik: zalantzan, `// TODO(galdetu):` eta galdetu.
- Ikur eta testu guztiak propioak (ISO 1219-1 / IEC 60617); ez kopiatu FluidSIM edo beste software komertzialik.

## Komandoak

- `npm run dev` — garapen-zerbitzaria, http://localhost:5173 (ataka finkoa, `strictPort`)
- `npm test` — Vitest testak (`tests/**/*.test.ts(x)`, jsdom ingurunea)
- `npm run test:coverage` — testak estaldura-txostenarekin
- `npm run test:e2e` — Playwright (Chromium); dev zerbitzaria automatikoki abiarazten du
- `npm run build` — `tsc --noEmit` + `vite build` → `dist/`
- `npm run lint` / `npm run format` / `npm run format:check` — ESLint eta Prettier

Oharra (Windows): Node.js eta Git winget bidez instalatu ziren 2026-11-04an. PowerShell saio zaharretan PATH ez badago eguneratuta, ireki terminal berri bat.

## Egitura

- `src/i18n/` — `eu.json` (iturri nagusia), `es.json` (hutsik oraingoz), `index.ts` (`t('menu.editor')`; falta den gakoa → euskara → gakoa bera).
- `src/ui/App.tsx` — goiko menu nagusia (5 atal). Atalen zerrenda: `src/ui/sections.ts`.
- `tests/` — Vitest testak domeinuka (`i18n/`, `ui/`, `engine/`); `tests/e2e/` Playwright-entzat.
- `src/core/` — `types.ts` (Project, ComponentInstance, Connection...), `componentDef.ts` (§3.2 kontratua), `geometry.ts` (GRID = 10 px, biraketa/ispilua, portuen posizioa), `serialization.ts` (`parseProject`, migrazioak `MIGRATIONS`-en), `validation.ts` (`validateProject` → `Issue[]`, mezuak `validation.<code>` i18n gakoetan).
- `src/components/` — osagai bakoitza fitxategi bat; `registry.ts`-n erregistratu. `src/symbols/primitives.tsx` — ikur-pieza komunak (kaxa, gezia, blokeoa, malgukia, eragingailuak).
- `src/ui/editor/` — editorea. `store.ts` (Zustand: proiektua, historia, hautapena, ikuspegia, modua), `actions.ts` (komandoak), `model/` (logika hutsa eta testatua: `ops.ts`, `routing.ts`, `labels.ts`), `Canvas.tsx` (interakzioak: keinuen egoera-makina), panelak.
- `src/storage/` — `db.ts` (IndexedDB: `project:<id>`, `meta`), `backup.ts` (babeskopia-formatua, aurrebista, abisua; funtzio hutsak), `persistence.ts` (abiaraztea, autosave, proiektu-kudeaketa, esportazio/inportazioa; `useStorage` egoera). UI: `src/ui/storage/`.
- `#/symbols` — ikur-galeria (garapen-orria, §9). Portuen markak `portPosition()`-ekin marrazten dira, geometria ikusiz egiaztatzeko.
- `tests/core/fixtures/` — proba-zirkuituak (`.automalab.json`); irakurri `readFixture()`-rekin (jsdom-en `import.meta.url` ez da `file:`).
- §3.1eko gainerako karpetak `.gitkeep`-ekin sortuta daude, hutsik.

## Erabakien erregistroa

- **2026-11-04 — Ikus-estiloa: erabiltzailearen erreferentzia** (ERP LSB `index.html`). Paleta (`--bg`, `--panel`, `--ink*`, `--accent` #0c95b0...), Archivo + IBM Plex Mono letra-tipoak, txartelak, atal-izenburuak (maiuskulak + marra) eta sareta-hondoa. Tokenak `src/index.css`-n; egoera-koloreak izen neutroekin (`--c-blue`, `--c-red`...), simulazio-egoeretara gero lotzeko. Letra-tipoak `@fontsource` bidez paketean (ez Google Fonts CDN), offline funtzionatzeko (§2 PWA). Menu nagusia **goian** mantendu da (SPEC §7.1), ez erreferentziako alboko barran, editorearen liburutegi-panelarekin ez talka egiteko.
- **2026-11-04 — Estiloak: CSS Modules** (ez Tailwind). Arrazoia: mendekotasun gutxiago; editorearen zati handiena SVG da eta bere estiloak propietate/aldagai bidez kudeatuko dira; CSS aldagaiak (`src/index.css`) kolore-tokenetarako, simulazioaren koloreak (§7.3) gero bertan zentralizatzeko.
- **2026-11-04 — Bertsioak:** React 19 (SPEC: "18+"), Vite 8, TypeScript 6, Vitest 5, Playwright 1.64, ESLint 10 (flat config). Node.js 26 LTS.
- **2026-11-04 — Nabigazioa routerrik gabe** 0. fasean: `useState` hutsa atal aktiborako. Router bat (edo URL-hash) beharrezkoa denean gehituko da (adib. `/symbols` galeria, §9).
- **2026-11-04 — i18n propioa** (liburutegirik gabe): JSON habiaratua + `t()` funtzio txikia. Interpolazioa edo pluralak behar direnean berrikusi.
- **2026-11-04 — TS konfigurazio zorrotza:** `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Motorrean akatsak goiz harrapatzeko.
- **2026-11-04 — Logoa:** «A» letra eskema-lerro ortogonalekin (portuak eta T-loturen puntuak), erabiltzaileak aukeratua.
- **2026-11-04 — Datu-eredua (1a):** `Project` = fitxategia bera (SPEC §4); ez dago `Circuit` mota bereizirik oraingoz. Portuen posizioak sareta-unitateetan (osagai lokala), instantzien `x/y` pixeletan. Transformazioa: lehenik ispilua (Y ardatza), gero biraketa erlojuaren noranzkoan. Balidazioak `DefLookup` funtzioa jasotzen du, `core/`-k `components/` ez inportatzeko. Larritasuna: errorea = ID bikoitza, mota ezezaguna, osagai/portu falta, domeinu nahasiak, auto-lotura; abisua = portu librea, lotura bikoitza, etiketa errepikatua.
- **2026-11-04 — T loturak:** 1b-n lotune-osagai gisa (`*.junction`) ebatziko dira; datu-ereduak ez du ezer berezirik behar.
- **2026-11-04 — Balidazio-ordezkoa:** serializazioa eskuzko type-guard-ekin (zod gabe), mendekotasunik ez gehitzeko.
- **2026-11-04 — Editorearen historia (1b):** Immer `produce` + snapshot-pilak (`past`/`future`, 100 muga). Eragiketak (`model/ops.ts`) proiektua mutatzen duten funtzio hutsak dira, draft baten gainean deituak. Arrastatzeak: `beginGesture()` + `apply(fn, false)` + `endGesture()` → urrats bakarra.
- **2026-11-04 — Hodien bideratzea:** gordetako puntuak + izkina automatikoak (`routeWire`): lehen tartea bertikala (portuak goian/behean), gero txandakatuz. Puntu bat editatzean bidea «materializatu» egiten da (izkina guztiak puntu bihurtu).
- **2026-11-04 — T loturak:** `fluid.junction` osagaia (portu bakarra `j`, lotura anitz onartzen ditu), liburutegitik ezkutatua. Lotunerik gabe geratzen diren junction-ak automatikoki ezabatzen dira.
- **2026-11-04 — Pan:** zuriunea + arrastatu edo erdiko botoia (SPEC §7.2); simulazio-moduan ezkerreko botoiak ere pan egiten du. Hutsunean arrastatzeak hautapen-laukizuzena egiten du.
- **2026-11-04 — Biltegiratzea (1c):** `idb-keyval` (DB `automalab`, store `kv`). Proiektu bakoitzak IDa du (`p-…`); fitxategi bakarreko inportazioak beti proiektu berria sortzen du; «Inportatu dena»-k IDaren arabera gainidazten du, aurrebista erakutsi ondoren. Babeskopia-formatua (`automalab-backup`, v1) dagoeneko barne hartzen ditu `personalTemplates`, `customQuestions` eta `progress` (hutsik), formatua ez aldatzeko geroago. Abisua: `lastChangeAt > lastBackupAt` eta `backupWarnDays` egun igarota (babeskopiarik ez bada, lehen aldaketatik kontatuta). Inportatu ondoren `lastBackupAt` = orain.
- **2026-11-04 — Dataren formatua:** UIan AAAA-HH-EE hh:mm eskuz, nabigatzaileek ez baitute `eu` locale-a beti ezagutzen.
- **2026-11-04 — Liburutegia 2. fasearen aurretik:** erabiltzaileak P1 osagai pneumatiko guztiak (ikurrak) motorra baino lehen eskatu zituen. Balbulak `valveSpecs.ts`-en datu huts gisa (posizioak = bide-taulak, eragingailuak, pilotaje-portuak); `valves.tsx` fabrikak ikurrak sortzen ditu. Egoera: `{ position }` = portuen gainean dagoen laukiaren indizea (0 = ezkerrekoa). Mota-IDak egonkorrak (SPEC: `pn.valve.5-2.pilot`, `pn.valve.5-2.sol-spring`, `pn.valve.and`…). Izenak `nameKey` + `textVars` bidez (`componentName()`).
- **Windows oharra:** Vite-ren HMR-ak noizean behin aldaketa bat galtzen du (orri zuria, `X is not defined`). Konponbidea: dev zerbitzaria berrabiarazi. E2E aurretik, ziurtatu ez dagoela zerbitzari zaharrik 5173 atakan (`reuseExistingServer`).
- Zustand eta Immer 1b-n instalatuta. uPlot, KaTeX, markdown-it, idb-keyval eta vite-plugin-pwa ez dira oraindik instalatu: behar diren fasean gehituko dira.
