# Egiaztatze-gida — 5. fasea: PLCa eta Ladder

**Data:** 2026-11-05
**Git etiketa:** `fase-5`

## Helburua

PLC simulatu bat (SPEC §5.4, §6.5), S7-1200 estiloan:

- **PLC blokea** eskema elektrikoan kableatuta. CPU 1214C: 14 sarrera (I0.0–I1.5) eta 10 irteera (Q0.0–Q1.1).
- **Ladder** programa: kontaktu NA/NI, flankoak P/N, bobina, Set/Reset, M markak, TON/TOF/TP eta CTU/CTD.
- **I/O taula**, izen sinbolikoekin.
- **Scan-zikloa**, urratsez urrats ikusteko aukerarekin.

Edukia: 4 txantiloi, 3 teoria-fitxa, 20 galdera eta 3 ariketa, **zirriborro** gisa.

Zure erabakiak (2026-11-05): PLCa kableatuta; CPU 1214C (14/10); TIA KOP estiloa, «Segmentua» izenarekin, eta T1/C1 instantziak.

## Probak

| #   | Egin                                                                                                                                                               | Espero da                                                                                                      | Emaitza           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Editorea → fitxak: **Eskema / Ladder / I/O taula**                                                                                                                 | Hiru fitxak; Ladder eta I/O taula pantaila osoan.                                                              | ☐ Ondo / ☐ Gaizki |
| 2   | Liburutegia → **PLCa** atala → jarri CPU 1214C oihalean                                                                                                            | Blokea 14 sarrerarekin (goian) eta 10 irteerarekin (behean). Konektatu gabeko borneek ez dute abisurik ematen. | ☐ Ondo / ☐ Gaizki |
| 3   | Txantiloiak → «Martxa eta geldialdia PLCarekin» → Ireki → **Ladder** fitxa                                                                                         | 3 segmentu, izen sinbolikoekin («Martxa», I0.1…).                                                              | ☐ Ondo / ☐ Gaizki |
| 4   | **I/O taula** fitxa                                                                                                                                                | Sarrerak, irteerak eta M0.0; «Kableatuta» zutabean S0, S1, Y1, H1.                                             | ☐ Ondo / ☐ Gaizki |
| 5   | Simulatu → Eskeman klik S1 → **Ladder** fitxa                                                                                                                      | Korrontea igarotzen den kontaktuak berdez; PLCaren LEDak eskeman.                                              | ☐ Ondo / ☐ Gaizki |
| 6   | Pausatu → **Scan bat** hainbat aldiz                                                                                                                               | Scan-kontagailua igotzen da; programa scan-ez scan ikusten da.                                                 | ☐ Ondo / ☐ Gaizki |
| 7   | «Tenporizazioa PLCarekin (TON)» → Simulatu → S1 → Ladder                                                                                                           | T1 kutxako **ET** 0 → 3 s; gero zilindroa itzultzen da.                                                        | ☐ Ondo / ☐ Gaizki |
| 8   | **Programatu zuk** proiektu berri batean: Ladder fitxan, «Segmentu berria», kontaktu NA (I0.0) eta bobina (Q0.0); eskeman PLCa, pultsadorea I0.0-ra, argia Q0.0-ra | Simulatzean, pultsadoreak argia pizten du.                                                                     | ☐ Ondo / ☐ Gaizki |
| 9   | Ladder-en, idatzi operando oker bat (adib. Q9.9)                                                                                                                   | Abisua: «ez da helbide baliozkoa».                                                                             | ☐ Ondo / ☐ Gaizki |
| 10  | Hautatu kontaktu bat → **Adar paraleloa**                                                                                                                          | Kontaktu berri bat paraleloan (OR).                                                                            | ☐ Ondo / ☐ Gaizki |
| 11  | Ariketak → «Martxa eta geldialdia PLCarekin» → Hasi → egin eta egiaztatu                                                                                           | Baldintzak ✓ / ✗.                                                                                              | ☐ Ondo / ☐ Gaizki |
| 12  | Teoria → 3 PLC fitxak irakurri eta zuzendu                                                                                                                         | Zuzenketak bidali.                                                                                             | ☐ Ondo / ☐ Gaizki |

## Erreferentzia-zirkuituak (testak)

- **R8** — Ladder TON 2 s: S1 → I0.0 → TON T1 (2 s) → Q0.0 → H1. Irteera 2 s ± scan bat ondoren aktibatzen da.
- **R7-Ladder** — A+ B+ A− B− PLCarekin: testak erreleekin egindako R7 eta PLCarekin egindakoa alderatzen ditu, eta **sekuentzia bera** ematen dute.

Fitxategiak: `docs/egiaztapena/fitxategiak/r8-ladder-ton.automalab.json` eta `r7-ladder.automalab.json`.

## Mugak eta erabakiak (berrikusteko)

- CPUaren elikadura (L+/M) eta sarreren komuna (1M) **ez dira marrazten**: PLCa elikatuta dagoela suposatzen da.
- **Scan-denbora** lehenetsia 10 ms da (PLCaren propietateetan aldatzen da). Scan bat baino laburragoa den bulkada bat ez du PLCak ikusten: errealista da. Saguarekin egindako klik batek scan asko irauten du.
- Segmentuak **serie/paralelo zuhaitzak** dira (SPEC). Ez dago sare librerik, ez elementuak arrastatzerik (P2).
- TIA-ren instantzia-DBen ordez, **T1, C1** izenak erabiltzen dira; irteera kontaktu gisa: T1.Q.
- Liburuek ez dute scan-zikloa xehetasunez azaltzen, ezta S7-1200aren datuak ere. Fitxetan hori «berrikusteko» gisa markatuta dago.
- GRAFCET hurrengo fasean (6. fasea).
