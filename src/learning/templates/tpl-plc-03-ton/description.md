## Funtzionamendua

Zilindroa **3 segundoz** aurrean geratzen da, eta gero itzultzen da. Denbora PLCaren **TON** tenporizadore batek neurtzen du.

- **Kableatzea:** [S1](comp:S1) → I0.0, [1B1](comp:1B1) → I0.1, [1B2](comp:1B2) → I0.2; Q0.0 → [Y1](comp:Y1), Q0.1 → [Y2](comp:Y2). [PLC1](comp:PLC1) CPU 1214C da.
- **1. segmentua:** I0.0 eta I0.1 → Q0.0: [1A](comp:1A) ateratzen da.
- **2. segmentua:** I0.2 «A_aurrean» → **TON T1** (PT = 3 s). Zilindroa aurrean dagoen bitartean, ET handitzen doa.
- **3. segmentua:** T1.Q → Q0.1: 3 s igarotzean, [Y2](comp:Y2) aktibatzen da eta zilindroa itzultzen da.
- [1V1](comp:1V1) biegonkorra da; [0Z1](comp:0Z1) iturriak elikatzen du.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | Logika eta tenporizazioa |
| [S1](comp:S1) | Pultsadorea NA → I0.0 | Martxa |
| [1B1](comp:1B1) | Reed sentsorea, 1A atzean → I0.1 | Hasierako posizioa |
| [1B2](comp:1B2) | Reed sentsorea, 1A aurrean → I0.2 | Tenporizadorea abiarazi |
| [Y1](comp:Y1) | Bobina ← Q0.0 | Atera |
| [Y2](comp:Y2) | Bobina ← Q0.1 | Itzuli |
| [1V1](comp:1V1) | 5/2 elektrobalbula biegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu eta egin klik [S1](comp:S1)-en. **Ladder** fitxan, begiratu T1 kutxaren **ET** balioa 0tik 3 s-ra igotzen.
2. Editatze-moduan, aldatu PT 1 s-ra eta errepikatu.
3. Pentsatu: TON-aren ordez TOF jarriz gero, zer gertatuko litzateke?

Ikus [tenporizadoreak eta kontagailuak](theory:plc-tenporizadoreak).
