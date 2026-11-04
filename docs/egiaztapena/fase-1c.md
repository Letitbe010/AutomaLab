# Egiaztatze-gida — 1c azpi-fasea: gordetzea, esportazioa eta babeskopia

**Data:** 2026-11-04
**Git etiketak:** `fase-1c`, `fase-1` (1. fase osoa)

## Helburua

Zirkuituak nabigatzailean gordetzen dira automatikoki (IndexedDB, 5 s-ro). Proiektu bat edo dena fitxategi batera esportatu eta inportatu daiteke. **1. fasearen onarpen-irizpidea:** zirkuitu bat marraztu, gorde, nabigatzailea itxi, ireki eta berdin dago; babeskopia esportatu eta beste profil batean inportatu.

## Nola abiarazi

1. Terminal berri batean, proiektuaren karpetan: `npm run dev`
2. Ireki <http://localhost:5173>

## Probak

| #   | Egin                                                                                                                                                                          | Espero da                                                                                                                      | Emaitza           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| 1   | Ireki aplikazioa lehen aldiz                                                                                                                                                  | Editorearen goiko barran «Proiektu berria» izena eta egoera «● Gordeta» (berdea).                                              | ☐ Ondo / ☐ Gaizki |
| 2   | Marraztu zirkuitu txiki bat (adib. iturria + 3/2 balbula + zilindroa, lotuta). Aldatu izena: «Lehen zirkuitua» + Enter                                                        | Egoera «● Aldaketak…» (horia) eta, gehienez 5 s geroago, «● Gordeta».                                                          | ☐ Ondo / ☐ Gaizki |
| 3   | **Itxi nabigatzailea osorik**, ireki berriro eta joan <http://localhost:5173>                                                                                                 | Zirkuitua eta izena berdin daude.                                                                                              | ☐ Ondo / ☐ Gaizki |
| 4   | «Proiektuak» → «Proiektu berria»; marraztu zerbait; «Proiektuak» → ireki «Lehen zirkuitua»                                                                                    | Proiektu bakoitzak bere edukia gordetzen du; zerrendan biak, data eta orduarekin (AAAA-HH-EE hh:mm).                           | ☐ Ondo / ☐ Gaizki |
| 5   | «Proiektuak» → «Esportatu proiektu hau (.automalab.json)»                                                                                                                     | `Lehen zirkuitua.automalab.json` fitxategia deskargatzen da.                                                                   | ☐ Ondo / ☐ Gaizki |
| 6   | «Inportatu proiektu bat» → aukeratu 5. probako fitxategia                                                                                                                     | Proiektu **berri** gisa irekitzen da (jatorrizkoa ez da gainidazten); zerrendan bikoiztuta agertzen da.                        | ☐ Ondo / ☐ Gaizki |
| 7   | Inportatu fitxategi oker bat (adib. edozein `.json` edo testu-fitxategi bat)                                                                                                  | Errore-mezu argia euskaraz (adib. «Fitxategia ez da AutomaLab proiektu bat.»); ez da ezer aldatzen.                            | ☐ Ondo / ☐ Gaizki |
| 8   | «Esportatu dena»                                                                                                                                                              | `automalab-babeskopia-AAAA-HH-EE.json` deskargatzen da; «Azken babeskopia» data eguneratzen da.                                | ☐ Ondo / ☐ Gaizki |
| 9   | **Beste profil batean** (Chrome: beste profil bat edo leiho pribatua; edo beste nabigatzaile bat): ireki aplikazioa → «Proiektuak» → «Inportatu dena» → 8. probako fitxategia | Aurrebista: «N proiektu berri, 0 gainidatziko dira.» → «Inportatu» → proiektuak agertzen dira, edukiarekin.                    | ☐ Ondo / ☐ Gaizki |
| 10  | Profil berean, inportatu berriro babeskopia bera                                                                                                                              | Aurrebistak «gainidatziko dira» zerrendan erakusten ditu, bi datekin (hemengoa / babeskopiakoa). «Utzi»-k ez du ezer aldatzen. | ☐ Ondo / ☐ Gaizki |
| 11  | Ezabatu proiektu bat                                                                                                                                                          | Berrespena eskatzen du; ezabatu ondoren zerrendatik desagertzen da. Irekita zegoena ezabatzean, beste bat irekitzen da.        | ☐ Ondo / ☐ Gaizki |
| 12  | «Abisua, babeskopiarik gabe (egunak)»: jarri `1`. (Abisua ikusteko, 1 egun itxaron behar da aldaketak eginda; edo utzi probarik gabe)                                         | Babeskopiarik gabeko egunak mugara iristean, banda horixka goian: «Ez duzu babeskopiarik egin N egunetan — Esportatu orain».   | ☐ Ondo / ☐ Gaizki |

## Oharrak

- **«Biltegiratze iraunkorra: ez»** ager daiteke: nabigatzaileak erabakitzen du (Chromek gune erabilienei ematen die). Horregatik da garrantzitsua «Esportatu dena».
- Leiho pribatuan datuak leihoa ixtean ezabatzen dira (nabigatzailearen portaera).

## Proba-fitxategiak

- `docs/egiaztapena/fitxategiak/r1-zilindro-bakuna.automalab.json` — iturria + 3/2 balbula + zilindro bakuna, lotuta. Inportatu «Inportatu proiektu bat» bidez.

## Azpi-fase honetan EZ dagoena

- Simulazioa (2. fasea).
- SVG/PNG esportazioa (12. fasea).
- Txantiloi pertsonalak, galdera propioak eta aurrerapena: babeskopiaren formatuak lekua du haientzat, baina hutsik doaz (3. fasetik aurrera).
