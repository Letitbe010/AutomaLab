# Berrikuspen pendienteak

Erabiltzaileak geroago egiteko utzitako egiaztapenak eta erabakiak. Fase bakoitzean eguneratzen da. **MVP 1 muga baino lehen (3. fasearen amaiera) dena berrikustea gomendatzen da**, ikur eta balio okerrak txantiloi eta galdetegietara zabaldu ez daitezen.

Egoera: ☐ pendiente · ☑ eginda

## Eskuzko egiaztatze-gidak

| Gida                                                           | Data       | Egoera |
| -------------------------------------------------------------- | ---------- | ------ |
| [fase-1a.md](egiaztapena/fase-1a.md) — datu-eredua eta ikurrak | 2026-11-04 | ☐      |
| [fase-1b.md](egiaztapena/fase-1b.md) — SVG editorea            | 2026-11-04 | ☐      |

`fase-0` gida baieztatuta (2026-11-04).

## Erabaki teknikoak (`TODO(galdetu)` kodean)

| #   | Gaia                                                                                                    | Kodean                                              | Egoera |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| 1   | Aire-iturriaren ikurra: presio-iturria edo konpresorea (ISO 1219-1)? Orain: zirkulua + triangelu hutsa. | `src/components/pneumatic/source.tsx`               | ☐      |
| 2   | Pultsadore-eragingailuaren forma, ISO 1219-1ekin bat?                                                   | `src/symbols/primitives.tsx` (`PushButtonOperator`) | ☐      |
| 3   | Hornidura-presio lehenetsia (orain 6 bar, SPEC §4ko adibidea)                                           | `src/core/project.ts`                               | ☐      |
| 4   | Zilindroaren neurri lehenetsiak (orain Ø32 / Ø12 / 100 mm, SPEC §4ko adibidea)                          | `src/components/pneumatic/cylinderSingle.tsx`       | ☐      |
| 5   | Etiketen konbentzioa: 1A, 2A (zilindroak); 1V1, 1V2 (balbulak); 0Z1 (hornidura). Klasekoa bera?         | `src/ui/editor/model/labels.ts`                     | ☐      |

## SPEC §14ko informazioa (oraindik jaso gabe)

- ☐ Terminologia / glosarioa
- ☐ Klaseko ariketa pneumatiko eta elektropneumatikoak (10–15)
- ☐ Balio tipikoak (presioak, zilindro-neurriak, ponparen emaria)
- ☐ PLC nomenklatura (`I0.0` vs `%I0.0`) eta lantegiko PLCa
- ☐ GRAFCET konbentzioak
- ☐ Txantiloi lehenetsiak eta galdera tipikoak
- ☐ Teoriako formulak eta koefizienteak (η, karga-faktorea…)

## Nola erabili

Berrikuspen bat egitean: markatu ☑, eta zuzenketak badaude, esan Claude-ri. Hark kodea eta `TODO(galdetu)` iruzkina eguneratuko ditu.
