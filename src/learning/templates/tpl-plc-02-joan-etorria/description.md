## Funtzionamendua

Joan-etorri automatikoa, sentsoreak eta bobinak PLCari kableatuta.

- **Kableatzea:** [S1](comp:S1) → I0.0, [1B1](comp:1B1) → I0.1, [1B2](comp:1B2) → I0.2; Q0.0 → [Y1](comp:Y1), Q0.1 → [Y2](comp:Y2). [PLC1](comp:PLC1) CPU 1214C da.
- **1. segmentua:** I0.0 «Martxa» **eta** I0.1 «A_atzean» → Q0.0: [Y1](comp:Y1), [1A](comp:1A) ateratzen da.
- **2. segmentua:** I0.2 «A_aurrean» → Q0.1: [Y2](comp:Y2), zilindroa itzultzen da.
- [1V1](comp:1V1) biegonkorra da: bulkada labur bat nahikoa da. [0Z1](comp:0Z1) iturriak elikatzen du.

Erreleekin egindako bertsioarekin alderatu: kable gutxiago, eta logika aldatzeko nahikoa da programa aldatzea.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | Logika |
| [S1](comp:S1) | Pultsadorea NA → I0.0 | Martxa |
| [1B1](comp:1B1) | Reed sentsorea, 1A atzean → I0.1 | Hasierako posizioa |
| [1B2](comp:1B2) | Reed sentsorea, 1A aurrean → I0.2 | Itzulera |
| [Y1](comp:Y1) | Bobina (14) ← Q0.0 | Atera |
| [Y2](comp:Y2) | Bobina (12) ← Q0.1 | Itzuli |
| [1V1](comp:1V1) | 5/2 elektrobalbula biegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu eta egin klik [S1](comp:S1)-en: joan-etorri bat.
2. Editatze-moduan, **Ladder** fitxan, aldatu 1. segmentuko I0.0-ren kontaktua **flanko positibo** (P) batera. Zer aldatzen da Shift + klik S1-en eginez gero?

Ikus [Ladder](theory:plc-ladder).
