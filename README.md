# AutomaLab

Automatismoak (pneumatika, elektropneumatika, hidraulika eta PLC) ikasi eta simulatzeko web-aplikazioa. Espezifikazioa: [SPEC.md](SPEC.md).

## Erabili

**Webean:** <https://letitbe010.github.io/AutomaLab/> — ez da ezer instalatu behar. `main` adarrera egindako push bakoitzean automatikoki eguneratzen da (GitHub Actions).

Zure proiektuak zure nabigatzailean gordetzen dira (IndexedDB); ez da ezer zerbitzarira igotzen. Helbide bakoitzak bere datuak ditu: localhost-etik webera pasatzeko, erabili «Proiektuak → Esportatu dena» eta «Inportatu dena».

## Nola abiarazi ordenagailuan (garapena)

**Klik bikoitza `AutomaLab.cmd` fitxategian.** Leiho beltz bat irekiko da (zerbitzaria), eta nabigatzailea bere kabuz <http://localhost:5173> helbidean. Utzi leiho beltza irekita aplikazioa erabiltzen duzun bitartean; ixtean, aplikazioa gelditzen da.

- **Ez ireki `index.html` zuzenean** (klik bikoitzez edo nabigatzailera arrastatuz): ez dabil, aplikazioak zerbitzaria behar du.
- Zerbitzaria martxan badago, nahikoa da <http://localhost:5173> irekitzea (edo `AutomaLab.cmd` berriro: nabigatzailea bakarrik irekiko du).
- Orri zuria edo «ez da kargatu» mezua: **Ctrl+Shift+R**; bestela, itxi leiho beltza eta ireki `AutomaLab.cmd` berriro.

Terminal batetik: `npm run dev`.

## Garapena

`npm test` (unitate-testak), `npm run test:e2e` (Playwright, 5174 atakan), `npm run build`, `npm run lint`. Xehetasunak: [CLAUDE.md](CLAUDE.md). Egiaztatze-gidak: [docs/egiaztapena/](docs/egiaztapena/).
