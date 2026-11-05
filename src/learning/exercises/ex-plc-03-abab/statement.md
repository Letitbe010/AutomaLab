## Egoera

Muntaketa-estazio baten errele-armairua PLC batekin ordezkatu behar da. Makinak **A+ B+ A− B−** zikloa egiten du etengabe, martxa sakatzen denetik geldialdia sakatu arte.

## Eskakizunak

1. **S1** (martxa) bulkada batekin: A+ B+ A− B− zikloa, behin eta berriz.
2. **S0** (geldialdia, NI kableatuta) sakatzean, une horretako zikloa amaitzen da eta makina hasierako posizioan gelditzen da.
3. Ezer sakatu gabe, makina ez da mugitzen.
4. Sentsore guztiak eta bobina guztiak PLCari kableatuta; logika Ladder-en.

## Etiketak (derrigorrezkoak)

| Etiketa | Osagaia |
| --- | --- |
| **1A** | A zilindroa |
| **2A** | B zilindroa |
| **S1** | Martxa-pultsadorea (NA) |
| **S0** | Geldialdi-pultsadorea (NI) |
| 1B1, 1B2, 2B1, 2B2 | Sentsoreak |
| Y1…Y4 | Elektrobalbulen bobinak |

## Gomendatutako urratsak

1. Bete **I/O taula**: 6 sarrera eta 4 irteera, izen sinbolikoekin.
2. Programatu martxa/geldialdia M0.0 markarekin.
3. Segmentu bat mugimendu bakoitzeko. Ikus [Ladder](theory:plc-ladder).
