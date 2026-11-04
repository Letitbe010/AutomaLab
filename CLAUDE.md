# CLAUDE.md — AutomaLab

Proiektuaren espezifikazio osoa `SPEC.md` fitxategian dago. **Irakurri osorik edozein lan hasi aurretik.**

## Arau nagusiak

- Jarraitu `SPEC.md` §13ko faseak hurrenez hurren; ez hasi fase berri bat aurrekoaren onarpen-irizpideak bete eta erabiltzaileak baieztatu arte.
- Fase bakoitzaren amaieran idatzi `docs/egiaztapena/fase-N.md` (eskuzko egiaztatze-gida euskaraz) eta gelditu.
- MVP mugetan (`mvp-1`: 3. fasearen ondoren; `mvp-2`: 7. fasearen ondoren) gelditu beti eta itxaron `docs/mvpN-iritzia.md` fitxategiari.

## Uneko egoera

- Uneko fasea: 0 (amaituta, erabiltzailearen egiaztapenaren zain)
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
- §3.1eko gainerako karpetak `.gitkeep`-ekin sortuta daude, hutsik.

## Erabakien erregistroa

- **2026-11-04 — Estiloak: CSS Modules** (ez Tailwind). Arrazoia: mendekotasun gutxiago; editorearen zati handiena SVG da eta bere estiloak propietate/aldagai bidez kudeatuko dira; CSS aldagaiak (`src/index.css`) kolore-tokenetarako, simulazioaren koloreak (§7.3) gero bertan zentralizatzeko.
- **2026-11-04 — Bertsioak:** React 19 (SPEC: "18+"), Vite 8, TypeScript 6, Vitest 5, Playwright 1.64, ESLint 10 (flat config). Node.js 26 LTS.
- **2026-11-04 — Nabigazioa routerrik gabe** 0. fasean: `useState` hutsa atal aktiborako. Router bat (edo URL-hash) beharrezkoa denean gehituko da (adib. `/symbols` galeria, §9).
- **2026-11-04 — i18n propioa** (liburutegirik gabe): JSON habiaratua + `t()` funtzio txikia. Interpolazioa edo pluralak behar direnean berrikusi.
- **2026-11-04 — TS konfigurazio zorrotza:** `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Motorrean akatsak goiz harrapatzeko.
- Zustand, Immer, uPlot, KaTeX, markdown-it, idb-keyval eta vite-plugin-pwa ez dira oraindik instalatu: behar diren fasean gehituko dira.
