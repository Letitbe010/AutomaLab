## Funtzionamendua

**OR dibergentzia:** 1. urratsaren ondoren bi trantsizio daude, eta bakoitzak bide bat hasten du.

- **T1** (`Bat * A_atzean`): [S1](comp:S1) → ezkerreko bidea: joan-etorri bat.
- **T2** (`Bi * /Bat * A_atzean`): [S2](comp:S2) → eskuineko bidea: bi joan-etorri.
- `/Bat` baldintzak hartzailetasunak **elkar baztertzen** ditu: biak batera sakatuz gero, [S1](comp:S1)-ek lehentasuna du.
- Bi bideak 1. urratsean biltzen dira (OR konbergentzia).

Urrats bakoitzean, [Y1](comp:Y1) edo [Y2](comp:Y2) aktibatzen dira, eta [1B1](comp:1B1) eta [1B2](comp:1B2) sentsoreek aurrera egiten dute. [PLC1](comp:PLC1)-ek exekutatzen du; [1V1](comp:1V1) balbula biegonkorrak [1A](comp:1A) mugitzen du, eta [0Z1](comp:0Z1) iturriak elikatzen du.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [PLC1](comp:PLC1) | S7-1200 CPU 1214C | GRAFCETa exekutatu |
| [S1](comp:S1) | Pultsadorea → I0.0 | Ziklo bat |
| [S2](comp:S2) | Pultsadorea → I0.1 | Bi ziklo |
| [1B1](comp:1B1) / [1B2](comp:1B2) | Reed sentsoreak → I0.2 / I0.3 | 1A atzean / aurrean |
| [Y1](comp:Y1) / [Y2](comp:Y2) | Bobinak ← Q0.0 / Q0.1 | Atera / itzuli |
| [1V1](comp:1V1) | 5/2 elektrobalbula biegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |

## Proba ezazu

1. Simulatu eta sakatu [S1](comp:S1), gero [S2](comp:S2).
2. Egin Shift + klik bietan, zikloa hasi aurretik: zein bide hartzen du?
3. Editatze-moduan, kendu `/Bat` T2-tik eta probatu berriro. Zer gertatzen da bi urrats aktibo daudenean?

Ikus [dibergentziak](theory:gr-dibergentziak).
