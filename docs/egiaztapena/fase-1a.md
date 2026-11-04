# Egiaztatze-gida — 1a azpi-fasea: datu-eredua eta ikurrak

**Data:** 2026-11-04
**Git etiketa:** `fase-1a`

## Helburua

Azpi-fase honek ez du editorerik: datu-eredua (gordetzea, kargatzea, balidazioa) testen bidez egiaztatzen da, eta zure lana batez ere **ikurrak berrikustea** da, 1b-n editorean erabiliko baitira.

## Nola abiarazi

1. Terminal berri batean, proiektuaren karpetan: `npm run dev`
2. Ireki: <http://localhost:5173/#/symbols>

## Probak

| #   | Egin                                                                  | Espero da                                                                                                                                              | Emaitza           |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| 1   | Ireki <http://localhost:5173>                                         | Goiko barran logo berria: «A» lerro horizontal eta bertikalekin, puntuekin.                                                                            | ☐ Ondo / ☐ Gaizki |
| 2   | Ireki <http://localhost:5173/#/symbols>                               | «Ikurren galeria» orria, hiru txartelekin: Aire-iturria, 3/2 balbula eta Eragin bakuneko zilindroa.                                                    | ☐ Ondo / ☐ Gaizki |
| 3   | Begiratu **aire-iturriaren** ikurra                                   | Zirkulua, triangelu huts batekin eta 1 portua goian. **Berrikusi:** klasean erabiltzen duzun ikurra al da?                                             | ☐ Ondo / ☐ Gaizki |
| 4   | Begiratu **3/2 balbula** «Atsedenean»                                 | Eskuineko laukia portuen gainean: 2 → 3 gezia eta 1 blokeatuta (T). Ezkerrean pultsadorea, eskuinean malgukia.                                         | ☐ Ondo / ☐ Gaizki |
| 5   | Begiratu **3/2 balbula** «Eragindakoa»                                | Laukiak eskuinera mugitu dira: orain ezkerreko laukia portuen gainean dago, 1 → 2 gezia gora eta 3 blokeatuta. Portuak (puntu urdinak) ez dira mugitu. | ☐ Ondo / ☐ Gaizki |
| 6   | Berrikusi **pultsadorearen** forma (balbularen ezkerrean)             | ISO 1219-1ekin bat dator? Ez badator, esan nola marrazten duzuen.                                                                                      | ☐ Ondo / ☐ Gaizki |
| 7   | Begiratu **zilindroa**: Sartuta / Erdian / Aterata                    | Enboloa (lauki beltza) eta zurtoina eskuinera mugitzen dira; malgukia estutzen da; A portua ezkerreko ganberan dago, enboloaren ezkerrean.             | ☐ Ondo / ☐ Gaizki |
| 8   | Begiratu «Biraketak eta ispilua» lerroak                              | 0°, 90°, 180°, 270° eta M (ispilua): portu-puntu urdinak beti hodi-muturretan daude, ez ikurretik aparte.                                              | ☐ Ondo / ☐ Gaizki |
| 9   | Terminal berri batean: `npm test`                                     | `Test Files 6 passed`, `Tests 38 passed`.                                                                                                              | ☐ Ondo / ☐ Gaizki |
| 10  | `npm run test:e2e` (gelditu aurretik `npm run dev`, edo utzi martxan) | `2 passed`.                                                                                                                                            | ☐ Ondo / ☐ Gaizki |

## Zure erabakia behar duten datuak (`TODO(galdetu)`)

- **Aire-iturriaren ikurra:** presio-iturria edo konpresorea? (3. proba)
- **Pultsadorearen eragingailua:** forma zuzena? (6. proba)
- **Balio lehenetsiak:** hornidura-presioa 6 bar; zilindroa Ø32 / zurtoina Ø12 / ibilbidea 100 mm (SPEC §4ko adibideko balioak). Klasean erabiltzen dituzunak?

## Proba-fitxategiak

Oraindik ezin dira UItik kargatu (1c-n). Testetako zirkuitu-adibidea: `tests/core/fixtures/simple-circuit.automalab.json` (iturria → 3/2 balbula → zilindroa).

## Azpi-fase honetan EZ dagoena

- Ez dago editorerik: ezin da marraztu, mugitu edo konektatu (1b).
- Ez da ezer gordetzen nabigatzailean; ez dago esportazio/inportaziorik (1c).
- Ez dago simulaziorik: «Eragindakoa» eta «Aterata» egoera estatikoak dira (2. fasea).
- Ihesa (atmosferara) eta gainerako osagai pneumatikoak 2. fasean.
