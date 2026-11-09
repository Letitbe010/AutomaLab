## Funtzionamendua

GRAFCET sinpleena: hiru urrats eta hiru trantsizio, zikloa itxita. Ikusi editoreko **GRAFCET** fitxan.

- **1. urratsa** (hasierakoa): zain.
- **T1** (`Martxa * A_atzean`): [S1](comp:S1) sakatuta eta [1B1](comp:1B1) itxita → 2. urratsa.
- **2. urratsa:** ekintza jarraitua `A_atera` (Q0.0): [Y1](comp:Y1) aktibo, [1A](comp:1A) ateratzen da.
- **T2** (`A_aurrean`): [1B2](comp:1B2) → 3. urratsa.
- **3. urratsa:** `A_itzuli` (Q0.1): [Y2](comp:Y2), zilindroa itzultzen da.
- **T3** (`A_atzean`): [1B1](comp:1B1) → 1. urratsa.

[PLC1](comp:PLC1)-ek GRAFCETa exekutatzen du. [1V1](comp:1V1) biegonkorra da, eta [0Z1](comp:0Z1) iturriak elikatzen du.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | GRAFCETa exekutatu |
| [S1](comp:S1) | Pultsadorea NA → I0.0 | Martxa |
| [1B1](comp:1B1) | Reed sentsorea → I0.1 | 1A atzean |
| [1B2](comp:1B2) | Reed sentsorea → I0.2 | 1A aurrean |
| [Y1](comp:Y1) | Bobina ← Q0.0 | Atera |
| [Y2](comp:Y2) | Bobina ← Q0.1 | Itzuli |
| [1V1](comp:1V1) | 5/2 elektrobalbula biegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu, egin klik [S1](comp:S1)-en eta joan **GRAFCET** fitxara: puntu berdea urratsez urrats mugitzen da.
2. Pausatu eta erabili **«Scan bat»**.
3. Sakatu **«Bihurtu Ladder-era»** editatze-moduan eta alderatu emaitza.

Ikus [GRAFCETaren oinarriak](theory:gr-oinarriak).
