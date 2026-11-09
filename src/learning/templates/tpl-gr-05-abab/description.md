## Funtzionamendua

**A+ B+ A− B−** GRAFCETekin, erreleekin eta Ladder-ekin egindako zirkuituen **sekuentzia bera**: testek hirurak alderatzen dituzte.

Bi GRAFCET independente batera exekutatzen dira (hasierako bi urrats):

- **Sekuentzia nagusia (1.–5. urratsak):** 1 zain; 2 A+ ([Y1](comp:Y1)); 3 B+ ([Y3](comp:Y3)); 4 A− ([Y2](comp:Y2)); 5 B− ([Y4](comp:Y4)). Trantsizioak sentsoreak dira: [1B1](comp:1B1), [1B2](comp:1B2), [2B1](comp:2B1) eta [2B2](comp:2B2).
- **Martxa/geldialdia (10.–11. urratsak):** [S1](comp:S1)-ek 11. urratsa aktibatzen du (`Zikloa` marka, M0.0), eta [S0](comp:S0)-k 10. urratsera itzultzen du.
- T1-ek `Zikloa` behar du: geldialdia sakatzean, une horretako zikloa amaitzen da eta ez da berriro hasten.

[PLC1](comp:PLC1)-ek exekutatzen du; [1V1](comp:1V1) eta [2V1](comp:2V1) biegonkorrek [1A](comp:1A) eta [2A](comp:2A) mugitzen dituzte; [0Z1](comp:0Z1) iturria.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | GRAFCETa exekutatu |
| [S0](comp:S0) / [S1](comp:S1) | Pultsadoreak NI / NA | Geldialdia / martxa |
| [1B1](comp:1B1) / [1B2](comp:1B2) | Reed sentsoreak, 1A − / + | A-ren posizioa |
| [2B1](comp:2B1) / [2B2](comp:2B2) | Reed sentsoreak, 2A − / + | B-ren posizioa |
| [Y1](comp:Y1) / [Y2](comp:Y2) | Bobinak | A+ / A− |
| [Y3](comp:Y3) / [Y4](comp:Y4) | Bobinak | B+ / B− |
| [1V1](comp:1V1) / [2V1](comp:2V1) | 5/2 biegonkorrak | Balbula nagusiak |
| [1A](comp:1A) / [2A](comp:2A) | Eragin bikoitzeko zilindroak | Eragingailuak |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu, egin klik [S1](comp:S1)-en eta jarraitu puntu berdea.
2. Editatze-moduan, sakatu **«Bihurtu Ladder-era»**. **Ladder** fitxan, begiratu Reset eta Set segmentuak.
3. Simulatu berriro: sekuentzia bera egiten du.

Ikus [GRAFCETetik Ladder-era](theory:gr-ladder).
