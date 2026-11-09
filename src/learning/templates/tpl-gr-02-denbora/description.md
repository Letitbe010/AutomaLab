## Funtzionamendua

Zilindroa **3 segundoz** geratzen da aurrean. Denbora GRAFCETaren hartzailetasun batean dago, ez tenporizadore bereizi batean.

- **2. urratsa:** `A_atera`: [Y1](comp:Y1), [1A](comp:1A) ateratzen da [S1](comp:S1) sakatu ondoren.
- **T2:** [1B2](comp:1B2) (`A_aurrean`) → 3. urratsa.
- **3. urratsa:** ekintzarik gabe: itxaron.
- **T3** (`t/X3/3s`): 3. urratsa aktibatu zenetik 3 s igaro direnean → 4. urratsa.
- **4. urratsa:** `A_itzuli`: [Y2](comp:Y2), zilindroa itzultzen da. [1B1](comp:1B1) iristean, 1. urratsera.

[PLC1](comp:PLC1)-ek GRAFCETa exekutatzen du; [1V1](comp:1V1) biegonkorra da; [0Z1](comp:0Z1) iturria.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | GRAFCETa exekutatu |
| [S1](comp:S1) | Pultsadorea NA → I0.0 | Martxa |
| [1B1](comp:1B1) | Reed sentsorea → I0.1 | 1A atzean |
| [1B2](comp:1B2) | Reed sentsorea → I0.2 | 1A aurrean |
| [Y1](comp:Y1) / [Y2](comp:Y2) | Bobinak ← Q0.0 / Q0.1 | Atera / itzuli |
| [1V1](comp:1V1) | 5/2 elektrobalbula biegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu, egin klik [S1](comp:S1)-en eta begiratu 3. urratsa aktibo 3 s-z.
2. Aldatu T3 `t/X3/1s` batera eta errepikatu.
3. Bihurtu Ladder-era: zer sortu da denbora neurtzeko?

Ikus [dibergentziak, hartzailetasunak eta denbora](theory:gr-dibergentziak).
