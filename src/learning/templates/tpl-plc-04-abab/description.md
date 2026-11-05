## Funtzionamendua

**A+ B+ A− B−** ziklo jarraitua, logika PLCaren programan. Erreleekin egindako zirkuituaren (R7) **sekuentzia bera** egiten du: testek biak simulatzen eta alderatzen dituzte.

- **Sarrerak:** [S0](comp:S0) → I0.0 (NI kableatuta), [S1](comp:S1) → I0.1, [1B1](comp:1B1) → I0.2, [1B2](comp:1B2) → I0.3, [2B1](comp:2B1) → I0.4, [2B2](comp:2B2) → I0.5.
- **Irteerak:** Q0.0 → [Y1](comp:Y1) (A+), Q0.1 → [Y2](comp:Y2) (A−), Q0.2 → [Y3](comp:Y3) (B+), Q0.3 → [Y4](comp:Y4) (B−). [PLC1](comp:PLC1) CPU 1214C da.
- **1. segmentua:** (Martxa edo M0.0) eta Geldialdia → M0.0 (zikloa martxan).
- **2.–5. segmentuak:** mugimendu bakoitza bere sentsoretik: A+ ← M0.0 eta 2B1; B+ ← 1B2; A− ← 2B2; B− ← 1B1.
- [1V1](comp:1V1) eta [2V1](comp:2V1) biegonkorrak dira; [1A](comp:1A) eta [2A](comp:2A) zilindroak; [0Z1](comp:0Z1) iturria.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | Logika |
| [S0](comp:S0) / [S1](comp:S1) | Pultsadoreak NI / NA | Geldialdia / martxa |
| [1B1](comp:1B1) / [1B2](comp:1B2) | Reed sentsoreak, 1A − / + | A-ren posizioa |
| [2B1](comp:2B1) / [2B2](comp:2B2) | Reed sentsoreak, 2A − / + | B-ren posizioa |
| [Y1](comp:Y1) / [Y2](comp:Y2) | Bobinak | A+ / A− |
| [Y3](comp:Y3) / [Y4](comp:Y4) | Bobinak | B+ / B− |
| [1V1](comp:1V1) / [2V1](comp:2V1) | 5/2 biegonkorrak | Balbula nagusiak |
| [1A](comp:1A) / [2A](comp:2A) | Eragin bikoitzeko zilindroak | Eragingailuak |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu, egin klik [S1](comp:S1)-en eta jarraitu programa **Ladder** fitxan.
2. Ireki «A+ B+ A− B− erreleekin» txantiloia eta alderatu: zenbat kable eta errele aurrezten dira?
3. Sakatu [S0](comp:S0) ziklo baten erdian: zikloa amaitzen da eta gelditzen da.

Ikus [Ladder](theory:plc-ladder).
