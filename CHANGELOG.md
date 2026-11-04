# Aldaketen erregistroa

Formatua: [Keep a Changelog](https://keepachangelog.com/) estiloan, fase bakoitzeko sarrera batekin.

## [fase-0] — 2026-11-04

### Gehituta

- Proiektuaren oinarria: Vite 8 + React 19 + TypeScript 6 (strict).
- Testak: Vitest 5 (jsdom, Testing Library) eta Playwright 1.64 (Chromium).
- Kalitatea: ESLint 10 (flat config, typescript-eslint, react-hooks) eta Prettier.
- SPEC §3.1eko direktorio-egitura (karpeta hutsak `.gitkeep`-ekin).
- i18n oinarria: `src/i18n/eu.json`, `src/i18n/es.json` (hutsik) eta `t()` funtzioa, euskarara itzultzeko ordezkoarekin.
- Goiko menu nagusia bost atalekin (Editorea, Txantiloiak, Ariketak, Teoria, Nire aurrerapena), edukirik gabe.
- Testak: 6 unitate-test (i18n eta menua) eta E2E test 1 (menua eta nabigazioa).
- `CLAUDE.md` eguneratua (komandoak eta erabakiak) eta egiaztatze-gida `docs/egiaztapena/fase-0.md`.
