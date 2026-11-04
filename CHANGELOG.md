# Aldaketen erregistroa

Formatua: [Keep a Changelog](https://keepachangelog.com/) estiloan, fase bakoitzeko sarrera batekin.

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
