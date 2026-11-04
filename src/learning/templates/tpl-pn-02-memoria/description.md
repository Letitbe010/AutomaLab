## Funtzionamendua

Eragin bikoitzeko zilindro baten **zeharkako agintea**: pultsadoreek ez dute zilindroa elikatzen, balbula nagusia pilotatzen baizik.

- [1V1](comp:1V1) 5/2 balbula **biegonkorra** da: pilotaje bakoitzak (14 eta 12) posizio bat aukeratzen du, eta balbulak posizio horri eusten dio seinalea desagertu arren. Hori da **memoria**.
- [1S1](comp:1S1) sakatzean, 14 pilotajera seinale bat iristen da: 1 → 4 bidea irekitzen da eta [1A](comp:1A) ateratzen da.
- [1S2](comp:1S2) sakatzean, 12 pilotajea aktibatzen da: 1 → 2 bidea irekitzen da eta zilindroa itzultzen da.
- [0Z1](comp:0Z1) iturriak balbula nagusia eta bi pultsadoreak elikatzen ditu.

Bulkada labur bat nahikoa da: pultsadorea askatu ondoren zilindroak bere mugimendua amaitzen du.

## Osagaiak

| Etiketa         | Osagaia                                       | Zeregina                  |
| --------------- | --------------------------------------------- | ------------------------- |
| [0Z1](comp:0Z1) | Aire-iturria (6 bar)                          | Hornidura                 |
| [1S1](comp:1S1) | 3/2 balbula NI, pultsadorea                   | Agindua: atera            |
| [1S2](comp:1S2) | 3/2 balbula NI, pultsadorea                   | Agindua: itzuli           |
| [1V1](comp:1V1) | 5/2 balbula biegonkorra, pilotaje pneumatikoa | Balbula nagusia (memoria) |
| [1A](comp:1A)   | Eragin bikoitzeko zilindroa                   | Eragingailua              |

![[symbol:pn.valve.5-2.pilot]]

## Proba ezazu

1. Simulazioan, egin klik labur bat [1S1](comp:1S1)-en: zilindroa ateratzen da eta aurrean geratzen da.
2. Egin klik [1S2](comp:1S2)-en: zilindroa itzultzen da.
3. Egin Shift + klik [1S1](comp:1S1)-en (sakatuta geratzen da) eta gero klik [1S2](comp:1S2)-n: balbulak lehen seinaleari eusten dio, eta simulazioak abisu bat ematen du bi seinaleak aldi berean daudelako. Klik arrunt batek [1S1](comp:1S1) askatzen du.

Pilotaje-lerroak marratuta marrazten dira. Ikus [funtzio logikoak eta memoria](theory:pn-funtzio-logikoak).
