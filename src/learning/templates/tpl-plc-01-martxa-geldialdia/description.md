## Funtzionamendua

Martxa/geldialdia, logika **PLCaren programan** dagoela (ez erreleetan).

- **Kableatzea:** [S0](comp:S0) (NI) → I0.0, [S1](comp:S1) (NA) → I0.1; Q0.0 → [Y1](comp:Y1), Q0.1 → [H1](comp:H1). [PLC1](comp:PLC1) CPU 1214C bat da.
- **1. segmentua:** (I0.1 «Martxa» **edo** M0.0) **eta** I0.0 «Geldialdia» → M0.0. M0.0 markak bere buruari eusten dio: autoatxikimendua.
- **2. segmentua:** M0.0 → Q0.0: [Y1](comp:Y1) aktibatzen da, [1V1](comp:1V1) kommutatzen da eta [1A](comp:1A) ateratzen da.
- **3. segmentua:** M0.0 → Q0.1: [H1](comp:H1) argia pizten da.
- [0Z1](comp:0Z1) iturriak balbula elikatzen du.

**Kontuz:** [S0](comp:S0) NI kableatuta dago. Atsedenean I0.0 = 1, eta Ladder-en **NA** kontaktu batekin irakurtzen da: sakatzean 0 bihurtzen da eta M0.0 desaktibatzen da.

Ikusi programa editoreko **Ladder** fitxan, eta helbideen izenak **I/O taula** fitxan.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | Logika (Ladder) |
| [S0](comp:S0) | Pultsadorea NI → I0.0 | Geldialdia |
| [S1](comp:S1) | Pultsadorea NA → I0.1 | Martxa |
| [Y1](comp:Y1) | Bobina ← Q0.0 | Zilindroa atera |
| [H1](comp:H1) | Argia ← Q0.1 | «Martxan» |
| [1V1](comp:1V1) | 5/2 elektrobalbula monoegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu eta egin klik [S1](comp:S1)-en. Joan **Ladder** fitxara: korrontea igarotzen den elementuak berdez ageri dira.
2. **I/O taula** fitxan, begiratu sarreren egoera: I0.0 = 1 atsedenean.
3. Pausatu eta erabili **«Scan bat»**: [S0](comp:S0) sakatu ondoren, zenbat scan behar dira Q0.0 itzaltzeko?

Ikus [PLCaren oinarriak](theory:plc-oinarriak) eta [Ladder](theory:plc-ladder).
