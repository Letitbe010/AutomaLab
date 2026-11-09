# Egiaztatze-gida — 6. fasea: GRAFCET

**Data:** 2026-11-09
**Git etiketa:** `fase-6`

## Helburua

GRAFCET editorea eta interpretatzailea (SPEC §6.6, IEC 60848), eta GRAFCET → Ladder bihurketa. Edukia: 5 txantiloi, 3 teoria-fitxa, 25 galdera eta 3 ariketa, **zirriborro** gisa.

Zure erabakiak (2026-11-09):

- PLCak programa bakarra exekutatzen du, «Ladder / GRAFCET» hautagailuarekin.
- Urratsak saretan, komando azkarrekin eta arrastatzeko aukerarekin.
- Hartzailetasunak: helbideak edo I/O taulako izenak; `*` ETA, `+` EDO, `/` EZ, `^x` eta `_x` flankoak, `t/X3/2s` denbora.

## Probak

| #   | Egin                                                                                                                                                                                                         | Espero da                                                                               | Emaitza           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ----------------- |
| 1   | Txantiloiak → «Sekuentzia lineala GRAFCETekin» → Ireki → **GRAFCET** fitxa                                                                                                                                   | 3 urrats, 1.a karratu bikoitzaz; atzera-jauzia geziarekin.                              | ☐ Ondo / ☐ Gaizki |
| 2   | Eskema → Simulatu → klik S1 → GRAFCET fitxa                                                                                                                                                                  | Urrats aktiboak puntu berdearekin; gaitutako trantsizioak laranjaz.                     | ☐ Ondo / ☐ Gaizki |
| 3   | Pausatu → **Scan bat**                                                                                                                                                                                       | Scan-kontagailua igotzen da.                                                            | ☐ Ondo / ☐ Gaizki |
| 4   | «AND dibergentzia: bi zilindro batera» → Simulatu → S1                                                                                                                                                       | Bi puntu berde aldi berean; barra bikoitzak; konbergentziak biak itxaroten ditu.        | ☐ Ondo / ☐ Gaizki |
| 5   | «OR dibergentzia» → S1, gero S2                                                                                                                                                                              | Joan-etorri bat eta bi. `/Bat` goi-marrarekin ageri da.                                 | ☐ Ondo / ☐ Gaizki |
| 6   | **Marraztu zuk** proiektu berri batean: «Urrats berria», «Gehitu behean» bi aldiz, trantsizioei hartzailetasunak, urratsei ekintzak; azken trantsizioa hautatu → «Lotu hurrengo urratsa» → klik 1. urratsean | GRAFCET osoa, atzera-jauzia eta guzti. Eragiketa guztiak Ctrl+Z-rekin desegin daitezke. | ☐ Ondo / ☐ Gaizki |
| 7   | Urrats bat hautatu → «OR adarra»; trantsizio bat hautatu → «AND adarra»                                                                                                                                      | Adar berriak, barra egokiekin.                                                          | ☐ Ondo / ☐ Gaizki |
| 8   | Idatzi hartzailetasun oker bat (`I0.0 *`) edo izen ezezagun bat                                                                                                                                              | Errorea eremuan bertan eta «Abisuak»-en.                                                | ☐ Ondo / ☐ Gaizki |
| 9   | «PLCak exekutatzen du: Ladder / GRAFCET» aldatu eta simulatu                                                                                                                                                 | Aukeratutako programa exekutatzen da; bestea ez.                                        | ☐ Ondo / ☐ Gaizki |
| 10  | «A+ B+ A− B− GRAFCETekin» → **Bihurtu Ladder-era** → Simulatu                                                                                                                                                | Ladder fitxan Set/Reset segmentuak; sekuentzia bera.                                    | ☐ Ondo / ☐ Gaizki |
| 11  | Ariketak → «Joan-etorria GRAFCETekin» → Hasi → egin eta egiaztatu                                                                                                                                            | Baldintzak ✓ / ✗, «PLCak GRAFCETa exekutatzen du» barne.                                | ☐ Ondo / ☐ Gaizki |
| 12  | Teoria → 3 GRAFCET fitxak irakurri eta zuzendu. **Hartzailetasunen idazkera klasekoa den egiaztatu**                                                                                                         | Zuzenketak bidali.                                                                      | ☐ Ondo / ☐ Gaizki |

## Erreferentzia-zirkuituak (testak)

- **R9** — AND dibergentzia eta konbergentzia; 1.–5. arauak banan-banan, 5.a kasu berezi batekin.
- **A+ B+ A− B−** — erreleekin, GRAFCETekin eta bihurtutako Ladder-ekin: hirurek sekuentzia bera ematen dute.

Fitxategiak: `docs/egiaztapena/fitxategiak/r9-grafcet-and.automalab.json` eta `r7-grafcet.automalab.json`.

## Mugak eta erabakiak (berrikusteko)

- **Bihurtutako Ladder-ak ez du bilaketa egonkorrik:** trantsizio-urrats bat scan bakoitzean. Urrats iragankor bat scan batez aktibo dago. Sekuentzia arruntetan emaitza bera da. Fitxan azalduta dago.
- Flanko ukatuak (`/^x`) interpretatzailean badabiltza, baina ez dira bihurtzen.
- GRAFCETen ez dago makro-urratsik, ez denbora-ekintzarik (SPEC: P2/P3).
- Bilaketa egonkorra eta arauen formulazioa SPEC-etik datoz (IEC 60848). Arauaren testua ez dago `Liburuak/` karpetan.
- Ladder eta I/O taula fitxek orain lekua uzten diote txantiloiaren panelari (lehen estalita geratzen ziren: 5. faseko akatsa, orain zuzenduta).
