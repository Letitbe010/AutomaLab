## Funtzionamendua

Eragin bikoitzeko zilindro baten **abiaduraren erregulazioa ihes-airean** (*meter-out*). Noranzko bakarreko emari-erregulagailu bakoitza zilindroaren portu baten ondoan dago.

- Emari-erregulagailu batean, balbulatik zilindrora doan airea atzera-ezineko balbulatik igarotzen da, **libre**; zilindrotik itzultzen dena, berriz, **itogunetik** igaro behar da.
- Zilindroa ateratzean, B ganberako airea [1V3](comp:1V3)-tik irteten da (faktorea 0,4): ateratzeko abiadura [1V3](comp:1V3)-k mugatzen du.
- Zilindroa itzultzean, A ganberako airea [1V2](comp:1V2)-tik irteten da (faktorea 0,7): itzultzeko abiadura [1V2](comp:1V2)-k mugatzen du.
- [1V1](comp:1V1) 5/2 balbula monoegonkorra da: sakatuta, zilindroa ateratzen da; askatuta, itzultzen da. [0Z1](comp:0Z1) iturriak elikatzen du.

Ihesa itotzean bi ganberak presiopean geratzen dira, eta mugimendua leunagoa eta egonkorragoa da karga aldakorrekin. Horregatik da ohiko aukera eragin bikoitzeko zilindroetan.

## Osagaiak

| Etiketa         | Osagaia                                           | Zeregina                    |
| --------------- | ------------------------------------------------- | --------------------------- |
| [0Z1](comp:0Z1) | Aire-iturria (6 bar)                              | Hornidura                   |
| [1V1](comp:1V1) | 5/2 balbula monoegonkorra, pultsadorea / malgukia | Agindua eta balbula nagusia |
| [1V2](comp:1V2) | Noranzko bakarreko emari-erregulagailua (0,7)     | Itzultzeko abiadura         |
| [1V3](comp:1V3) | Noranzko bakarreko emari-erregulagailua (0,4)     | Ateratzeko abiadura         |
| [1A](comp:1A)   | Eragin bikoitzeko zilindroa                       | Eragingailua                |

![[symbol:pn.valve.flow-oneway]]

## Proba ezazu

1. Simulazioan, sakatu eta mantendu [1V1](comp:1V1): zilindroa poliki ateratzen da.
2. Askatu: zilindroa itzultzen da, ateratzean baino azkarrago.
3. Editatze-moduan, aldatu [1V3](comp:1V3)-ren abiadura-faktorea (adibidez 1era) eta errepikatu: ateratzea azkartzen da.

Oharra: simulazioa maila logikoan dago; abiadura-faktorea hurbilketa bat da, ez emariaren kalkulu fisikoa. Ikus [zilindroaren indarra](theory:pn-zilindro-indarra).
