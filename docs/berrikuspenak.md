# Berrikuspen pendienteak

Erabiltzaileak geroago egiteko utzitako egiaztapenak eta erabakiak. Fase bakoitzean eguneratzen da. **MVP 1 muga baino lehen (3. fasearen amaiera) dena berrikustea gomendatzen da**, ikur eta balio okerrak txantiloi eta galdetegietara zabaldu ez daitezen.

Egoera: ☐ pendiente · ☑ eginda

## Eskuzko egiaztatze-gidak

| Gida                                                                                                                                | Data       | Egoera |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| [fase-1a.md](egiaztapena/fase-1a.md) — datu-eredua eta ikurrak                                                                      | 2026-11-04 | ☐      |
| [fase-1b.md](egiaztapena/fase-1b.md) — SVG editorea                                                                                 | 2026-11-04 | ☐      |
| [fase-1c.md](egiaztapena/fase-1c.md) — gordetzea eta babeskopia                                                                     | 2026-11-04 | ☐      |
| [fase-2a.md](egiaztapena/fase-2a.md) — simulazio-motorra (logikoa)                                                                  | 2026-11-04 | ☐      |
| [fase-2c.md](egiaztapena/fase-2c.md) — simulazioa pantailan                                                                         | 2026-11-04 | ☐      |
| [fase-2b.md](egiaztapena/fase-2b.md) — rodilloak, R4, R5 (**zuk R5 marraztu**)                                                      | 2026-11-04 | ☐      |
| [fase-3a.md](egiaztapena/fase-3a.md) — teoria-atala (**5 fitxak irakurri eta zuzendu**)                                             | 2026-11-04 | ☐      |
| [fase-3b.md](egiaztapena/fase-3b.md) — txantiloiak (**5 azalpenak irakurri eta zuzendu**)                                           | 2026-11-04 | ☐      |
| [fase-3c.md](egiaztapena/fase-3c.md) — galdetegiak eta aurrerapena (**25 galderak egin eta zuzendu**)                               | 2026-11-04 | ☐      |
| [fase-E.md](egiaztapena/fase-E.md) — ariketak (**ariketak egin eta enuntziatuak zuzendu**)                                          | 2026-11-04 | ☐      |
| [fase-4.md](egiaztapena/fase-4.md) — elektropneumatika (**R6 zuk marraztu**; ikurrak eta 3 fitxa berrikusi)                         | 2026-11-05 | ☐      |
| [fase-5.md](egiaztapena/fase-5.md) — PLCa eta Ladder (**programa bat zuk idatzi**; 3 fitxa berrikusi)                               | 2026-11-05 | ☐      |
| [fase-6.md](egiaztapena/fase-6.md) — GRAFCET (**GRAFCET bat zuk marraztu**; idazkera eta 3 fitxa berrikusi)                         | 2026-11-09 | ☐      |
| [fase-7.md](egiaztapena/fase-7.md) — Sortzailea eta galdetegi osoa (**zure zirkuitu bat alderatu**; 13 galdera bihurtuak berrikusi) | 2026-11-09 | ☐      |

`fase-0` gida baieztatuta (2026-11-04).

## Erabaki teknikoak (`TODO(galdetu)` kodean)

| #   | Gaia                                                                                                                                                                                                               | Kodean                                                      | Egoera                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------- |
| 1   | Aire-iturriaren ikurra: presio-iturria edo konpresorea (ISO 1219-1)? Orain: zirkulua + triangelu hutsa.                                                                                                            | `src/components/pneumatic/source.tsx`                       | ☐                                              |
| 2   | Pultsadore-eragingailuaren forma, ISO 1219-1ekin bat?                                                                                                                                                              | `src/symbols/primitives.tsx` (`PushButtonOperator`)         | ☑ liburua (Creus): bat dator                   |
| 3   | Hornidura-presio lehenetsia (orain 6 bar, SPEC §4ko adibidea)                                                                                                                                                      | `src/core/project.ts`                                       | ☐                                              |
| 4   | Zilindroaren neurri lehenetsiak (orain Ø32 / Ø12 / 100 mm, SPEC §4ko adibidea)                                                                                                                                     | `src/components/pneumatic/cylinderSingle.tsx`               | ☐                                              |
| 5   | Etiketen konbentzioa: 1A, 2A (zilindroak); 1V1, 1V2 (balbulak); 0Z1 (hornidura). Klasekoa bera?                                                                                                                    | `src/ui/editor/model/labels.ts`                             | ☐                                              |
| 6   | Amaiera-balbulen etiketak: `1S1/1S2` (SPEC §4, §11) ala `a0/a1/b0/b1` (SPEC §8.8)? Orain: 1S                                                                                                                       | `src/components/pneumatic/valveSpecs.ts`                    | ☑ a0/a1 automatikoki                           |
| 7   | Eragingailuen ikurrak: pedala, palanka, rodilloa, rodillo abatigarria, pilotajea, solenoidea, malgukia                                                                                                             | `src/symbols/primitives.tsx` (`OperatorSymbol`)             | ◐ Creus-era hurbilduta; aire-iturria pendiente |
| 8   | Antzezpen-balbularen orientazioa eta marrazkia (1 → 2 libre)                                                                                                                                                       | `src/components/pneumatic/misc.tsx`                         | ☑ liburua (Creus): bat dator                   |
| 9   | AND/OR balbulen portu-izenak (orain X, Y → 2) eta marrazkia                                                                                                                                                        | `src/components/pneumatic/misc.tsx`                         | ☐                                              |
| 10  | Emari-erregulagailuaren abiadura-faktore lehenetsia (orain 0,5)                                                                                                                                                    | `src/components/pneumatic/misc.tsx`                         | ☐                                              |
| 11  | Pilotaje-portuen izenak: 3/2 NI → 12, 3/2 NA → 10, 5/x → 14 (ezkerra) / 12 (eskuina)                                                                                                                               | `src/components/pneumatic/valveSpecs.ts`                    | ☐                                              |
| 12  | P2/P3 ikurrak: iragazkia, erregulagailua, zerbitzu-unitatea, isilgailua, itxiera-giltza, moteltzaileak, motorra, ejektorea, bentosa, ihes azkarrekoa, itogunea, sekuentzia-balbula, tenporizadoreak                | `src/components/pneumatic/extra.tsx`, `valveSpecs.ts`       | ☐                                              |
| 13  | Lehenetsiak: sekuentzia-balbularen kommutazio-presioa (3 bar), tenporizadorearen atzerapena (2 s), erregulagailua (6 bar)                                                                                          | `valveSpecs.ts`, `extra.tsx`                                | ☐                                              |
| 14  | 1. mailako arauak: ihes-portu libreak (3, 5) atmosferara doaz; zilindroaren ibilbide-denbora lehenetsia 1 s (SPEC §6.2); bi seinale biegonkorrean → aurreko posizioa; erregulagailuak ez du presio-balioa aldatzen | `src/engine/fluid/logic/behaviors.ts`                       | ☐                                              |
| 15  | Rodillo abatigarriaren eremua (orain ibilbidearen azken % 5a) eta rodilloak etiketaz lotzea (Zilindroa: 1A, Posizioa: −/+)                                                                                         | `src/engine/coupling/mechanical.ts`                         | ☐                                              |
| 16  | Txantiloien diseinua: 4. txantiloiaren abiadura-faktoreak (1V2 = 0,7, 1V3 = 0,4) eta 1V1 pultsadorezko 5/2 monoegonkorra; 3. txantiloiak ez du aldiberekotasun-denbora egiaztatzen (didaktikoa)                    | `src/learning/templates/`                                   | ☐                                              |
| 17  | Ariketen egiaztapen-denborak: ex-pn-05 (ateratzea ≥ 1,5 s, itzulera ≤ 1,2 s), ex-pn-07 (1A+ → 1A− 2,8–3,5 s); maila logikoan ibilbidea 1 s. Meter-in/out ezin da bereizi maila logikoan                            | `src/learning/exercises/`                                   | ☐                                              |
| 18  | Osagai elektrikoen ikurrak (IEC 60617 propioak): kontaktuak, pultsadorea, etengailua, larrialdi-geldialdia, amaiera-etengailua, reed, bobinak, argia, buzzerra                                                     | `src/components/electric/index.tsx`                         | ☐                                              |
| 19  | Erreleen kommutazio-denbora 0 (SPEC: aukerako 10 ms); sentsoreak muturrean bakarrik aktibo; Creus-ek a0/a1 erabiltzen du, guk 1B1/1B2                                                                              | `src/engine/electric/`, `coupling/mechanical.ts`            | ☐                                              |
| 20  | PLCa: L+/M eta 1M ez dira marrazten; scan 10 ms; T1/C1 instantziak (TIAko DBen ordez); scan-zikloaren eta S7-1200aren datuak liburuetan ez daude (fabrikatzailearen dokumentazioarekin egiaztatu)                  | `src/components/plc/`, `src/learning/theory/plc/`           | ☐                                              |
| 21  | GRAFCET: hartzailetasunen idazkera klasekoa den (`*`, `+`, `/`, `^x`, `_x`); bihurtutako Ladder-ak ez du bilaketa egonkorrik                                                                                       | `src/core/grafcet.ts`, `src/engine/plc/grafcet/toLadder.ts` | ☐                                              |
| 22  | Sortzailea: azken eta lehen taldeak batzea klaseko ohitura den; memorien konexioa kate gisa (nire diseinua, simulazioan probatua, ez liburuko eskema batekin alderatua)                                            | `src/generator/sequence.ts`, `src/generator/cascade.ts`     | ☐                                              |

## SPEC §14ko informazioa (oraindik jaso gabe)

- ☐ Terminologia / glosarioa
- ☐ Klaseko ariketa pneumatiko eta elektropneumatikoak (10–15)
- ☐ Balio tipikoak (presioak, zilindro-neurriak, ponparen emaria)
- ☑ PLC: **Siemens S7-1200** (2026-11-04) → `I0.0` / `Q0.0` helbideratzea, TIA Portal estiloa
- ☐ GRAFCET konbentzioak
- ☐ Txantiloi lehenetsiak eta galdera tipikoak
- ☐ Teoriako formulak eta koefizienteak (η, karga-faktorea…)

## Nola erabili

Berrikuspen bat egitean: markatu ☑, eta zuzenketak badaude, esan Claude-ri. Hark kodea eta `TODO(galdetu)` iruzkina eguneratuko ditu.
