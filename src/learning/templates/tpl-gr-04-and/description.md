## Funtzionamendua

**AND dibergentzia:** trantsizio bakar batek bi urrats aktibatzen ditu aldi berean, eta bi zilindroak batera mugitzen dira.

- **T1:** [S1](comp:S1) sakatuta eta bi zilindroak atzean → 2. eta 3. urratsak aktibo: [Y1](comp:Y1) eta [Y3](comp:Y3), [1A](comp:1A) eta [2A](comp:2A) ateratzen dira.
- Adar bakoitzak bere sentsorea du: [1B2](comp:1B2) eta [2B2](comp:2B2). Amaitzean, itxaron-urrats batera doa (4 eta 5).
- **T4 (AND konbergentzia):** 4. eta 5. urratsak **biak** aktibo daudenean → 6. eta 7. urratsak: [Y2](comp:Y2) eta [Y4](comp:Y4), biak itzultzen dira.
- [1B1](comp:1B1) eta [2B1](comp:2B1) sentsoreekin, 8. eta 9. urratsetara, eta azken konbergentziak 1. urratsera.

[PLC1](comp:PLC1)-ek GRAFCETa exekutatzen du; [1V1](comp:1V1) eta [2V1](comp:2V1) biegonkorrak dira; [0Z1](comp:0Z1) iturria.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | GRAFCETa exekutatu |
| [S1](comp:S1) | Pultsadorea → I0.0 | Martxa |
| [1B1](comp:1B1) / [1B2](comp:1B2) | Reed sentsoreak, 1A − / + | A-ren posizioa |
| [2B1](comp:2B1) / [2B2](comp:2B2) | Reed sentsoreak, 2A − / + | B-ren posizioa |
| [Y1](comp:Y1) / [Y2](comp:Y2) | Bobinak | A+ / A− |
| [Y3](comp:Y3) / [Y4](comp:Y4) | Bobinak | B+ / B− |
| [1V1](comp:1V1) / [2V1](comp:2V1) | 5/2 biegonkorrak | Balbula nagusiak |
| [1A](comp:1A) / [2A](comp:2A) | Eragin bikoitzeko zilindroak | Eragingailuak |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu, egin klik [S1](comp:S1)-en eta begiratu **GRAFCET** fitxan bi puntu berde aldi berean.
2. Pausatu aurrera iristean eta aurreratu **«Scan bat»**-ekin.
3. Pentsatu: zer gertatuko litzateke 4. eta 5. itxaron-urratsik gabe?

Ikus [dibergentziak](theory:gr-dibergentziak).
