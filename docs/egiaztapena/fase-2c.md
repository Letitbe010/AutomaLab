# Egiaztatze-gida — 2c azpi-fasea: simulazioa pantailan

**Data:** 2026-11-04
**Git etiketa:** `fase-2c`

## Helburua

2a-ko motorrarekin simulatzea, editoretik: kontrolak, presioaren koloreak, balbula- eta zilindro-animazioa, eragingailu manual klikagarriak, espazio-fase diagrama eta laguntza-txartelak (SPEC §7.3–7.4).

## Nola abiarazi

1. Terminal berri batean: `npm run dev` → <http://localhost:5173> (Ctrl+Shift+R, cache zaharra ez erabiltzeko).
2. «Proiektuak» → «Inportatu proiektu bat» → `docs/egiaztapena/fitxategiak/` karpetako fitxategiak.

## Probak

| #   | Egin                                                                                                                                                                          | Espero da                                                                                                                             | Emaitza           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Inportatu `r1-single-button.automalab.json` eta sakatu «Simulatu»                                                                                                             | Denbora martxan (`t = …`). Iturritik balbulara doan hodia urdin ilunez (presioa); zilindrora doana urdin argiz eta marratuta (ihesa). | ☐ Ondo / ☐ Gaizki |
| 2   | Klik eta **mantendu** saguaren botoia 1S1 balbulan                                                                                                                            | Balbularen laukiak mugitzen dira; zilindroko hodia urdin ilun bihurtzen da; zurtoina ~1 s-tan ateratzen da.                           | ☐ Ondo / ☐ Gaizki |
| 3   | Askatu saguaren botoia                                                                                                                                                        | Balbula itzultzen da; hodia ihesera; malgukiak zilindroa sartzen du.                                                                  | ☐ Ondo / ☐ Gaizki |
| 4   | Ireki «Espazio-fase diagrama» fitxa (behean)                                                                                                                                  | `1A+` eta `1A-` urratsak, 1A lerroa gora eta behera.                                                                                  | ☐ Ondo / ☐ Gaizki |
| 5   | ⏸ (pausatu), ⏭ (urrats bat, 10 ms) eta ⏹ (hasieratu)                                                                                                                          | ⏸-k denbora gelditzen du; ⏭-k 0,01 s aurreratzen du; ⏹-k t = 0,00 s-ra eta hasierako egoerara itzultzen du.                           | ☐ Ondo / ☐ Gaizki |
| 6   | Aldatu «Abiadura» ×0,1 eta ×10 artean, eta errepikatu 2. proba                                                                                                                | Mugimendua motelago / azkarrago; denbora-kontagailua abiadura berean.                                                                 | ☐ Ondo / ☐ Gaizki |
| 7   | Inportatu `r2-double-bistable.automalab.json`, simulatu; klik labur 1S1-en, gero klik labur 1S2-n                                                                             | 1S1: balbula 14 aldera eta zilindroa ateratzen da eta **aterata geratzen da** (memoria). 1S2: sartzen da.                             | ☐ Ondo / ☐ Gaizki |
| 8   | Inportatu `r3-and-or.automalab.json`, simulatu; sakatu 1S1 bakarrik, 1S2 bakarrik, eta biak (Ctrl ez da behar: klik-mantendu batean, bestean ezin denez, probatu banan-banan) | Manometroetan: OR «6 bar» sarrera batekin; AND «6 bar» biak batera daudenean bakarrik (ikus oharra behean).                           | ☐ Ondo / ☐ Gaizki |
| 9   | Editatze-moduan, pasatu sagua liburutegiko elementu baten gainean (~0,5 s)                                                                                                    | Laguntza-txartela: ikurra, izena, funtzioa eta portuak.                                                                               | ☐ Ondo / ☐ Gaizki |
| 10  | Oihalean, pasatu sagua osagai baten gainean; edo hautatu bat eta sakatu **F1**                                                                                                | Txartel bera (F1-ekin goian-eskuinean finkatuta; `Esc`-ek ixten du).                                                                  | ☐ Ondo / ☐ Gaizki |
| 11  | Marraztu zirkuitu bat errore batekin (adib. ezer ez, edo inportatu fitxategi oker bat) eta sakatu «Simulatu»                                                                  | Mezua: «Ezin da simulatu: konpondu lehenik… erroreak». Editatze-moduan jarraitzen du.                                                 | ☐ Ondo / ☐ Gaizki |
| 12  | Simulazioan, «Fisikoa» botoia                                                                                                                                                 | Desgaituta («2. maila 9. fasean»).                                                                                                    | ☐ Ondo / ☐ Gaizki |

**Oharra (8. proba):** saguarekin pultsadore bakarra sakatu daiteke aldi berean. AND-a bi sarrerekin probatzeko, oraingoz erabili «Itxiera-giltza» bat edo 5/2 balbula bat sarrera gisa (klik batek irekitzen/ixten du). 2b edo geroago, beste aukera bat aztertuko dugu (adib. Shift+klik pultsadorea «blokeatzeko»).

## Azpi-fase honetan EZ dagoena

- Rodilloak ez dira zilindroaren posizioaz eragiten (2b). Oraingoz klik-mantenduz eragin daitezke.
- Kurbak (posizioa / presioa denboran, uPlot) eta ziklo-analisia: 9. fasean.
- «Teoria gehiago» esteka laguntza-txarteletan: 3. fasean (teoria-atala).
- Solenoideak: oraingoz eskuzko gainidazketa (klik); kontrol elektrikoa 4. fasean.
