# Egiaztatze-gida — 4. fasea: elektropneumatika

**Data:** 2026-11-05
**Git etiketa:** `fase-4`

## Helburua

Kontrol elektrikoa 24 V DC-n (SPEC §5.2, §6.4): eskema elektrikoa eskema pneumatikoaren oihal berean, korronte-bide bertikalekin, eta bien arteko lotura **izenen bidez** (Y1 bobina ↔ Y1 duen elektrobalbula; K1 bobina ↔ K1 kontaktuak; 1B1 sentsorea ↔ 1A zilindroa). Edukia: 5 txantiloi, 3 teoria-fitxa, 25 galdera eta 4 diseinu-ariketa elektropneumatiko, **zirriborro** gisa.

Zure erabakiak (2026-11-05): oihal bera; korronte-bide bertikalak (+24 V goian, 0 V behean); izendapena S / K / Y / H / 1B1-1B2, bornak 13-14 (NA), 21-22 (NI), A1-A2 (bobinak).

## Probak

| #   | Egin                                                                                                                                                                                                          | Espero da                                                                                                                                                           | Emaitza           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Editorea → liburutegian, **Elektrikoa** atala                                                                                                                                                                 | Elikadura (+24 V, 0 V), aginte-elementuak, sentsoreak, erreleak, bobinak eta seinaleztapena.                                                                        | ☐ Ondo / ☐ Gaizki |
| 2   | Ikurren galeria (`#/symbols`): begiratu osagai elektrikoak                                                                                                                                                    | Kontaktu NA/NI (atsedena / eraginda), pultsadorea, etengailua, larrialdi-geldialdia, amaiera-etengailua, reed, bobinak, argia, buzzerra. **Ikurrak egokiak diren?** | ☐ Ondo / ☐ Gaizki |
| 3   | Txantiloiak → «Martxa eta geldialdia autoatxikimenduarekin» → Ireki → Simulatu                                                                                                                                | +24 V-ko kableak gorriz.                                                                                                                                            | ☐ Ondo / ☐ Gaizki |
| 4   | Klik labur bat **S1**-en                                                                                                                                                                                      | K1 eta Y1 laranjaz (aktibo), H1 argia piztuta, zilindroa atera eta aurrean geratzen da.                                                                             | ☐ Ondo / ☐ Gaizki |
| 5   | Klik **S0**-n                                                                                                                                                                                                 | Dena itzaltzen da eta zilindroa itzultzen da.                                                                                                                       | ☐ Ondo / ☐ Gaizki |
| 6   | **Shift + klik** S0-n, gero klik S1-en                                                                                                                                                                        | Ez da martxan jartzen (geldialdiak lehentasuna).                                                                                                                    | ☐ Ondo / ☐ Gaizki |
| 7   | «A+ B+ A− B− erreleekin eta reed sentsoreekin» → Simulatu → S1                                                                                                                                                | Ziklo jarraitua; sentsoreen markak argiztatzen dira; espazio-fase diagrama. S0 → zikloa amaitu eta gelditzen da.                                                    | ☐ Ondo / ☐ Gaizki |
| 8   | **Marraztu zuk** R6 zirkuitua (martxa/geldialdia): +24 V eta 0 V borneak, S0 (NI), S1 (NA), K1 bobina, K1 kontaktua («Errelea» propietatea = K1), Y1 bobina, 5/2 elektrobalbula («Bobina (ezkerra, 14)» = Y1) | Simulatzean 4.–6. probetan bezala dabil.                                                                                                                            | ☐ Ondo / ☐ Gaizki |
| 9   | Kable elektriko baten gainean beste kable bat amaitu                                                                                                                                                          | T lotune elektrikoa (puntu beltza) sortzen da.                                                                                                                      | ☐ Ondo / ☐ Gaizki |
| 10  | Jarri reed sentsore bat eta, propietateetan, Zilindroa = 1A, Posizioa = −                                                                                                                                     | Etiketa automatikoki **1B1**; zilindroaren ondoan marka.                                                                                                            | ☐ Ondo / ☐ Gaizki |
| 11  | Lotu +24 V zuzenean 0 V-ra etengailu batekin eta simulatu, etengailua itxita                                                                                                                                  | «Zirkuitulaburra» abisua; kablea gorri marratuta.                                                                                                                   | ☐ Ondo / ☐ Gaizki |
| 12  | Ariketak → «Martxa eta geldialdia autoatxikimenduarekin» → Hasi; marraztu eta egiaztatu                                                                                                                       | Baldintzak ✓ / ✗, arrazoiekin.                                                                                                                                      | ☐ Ondo / ☐ Gaizki |
| 13  | Teoria → 3 fitxa elektropneumatikoak irakurri eta zuzendu                                                                                                                                                     | Zuzenketak bidali.                                                                                                                                                  | ☐ Ondo / ☐ Gaizki |

## Erreferentzia-zirkuituak (testak)

- **R6** — autoatxikimendua martxa/geldialdiarekin: S1 → K1 atxikita, Y1, H1; S0 → dena geldi; S0 + S1 batera → ezer ez (geldialdiaren lehentasuna).
- **R7** — A+ B+ A− B− erreleekin eta reed sentsoreekin: ziklo jarraitua K1 atxikita dagoen bitartean; S0 → zikloa amaitu eta hasierako posizioan gelditu.

Fitxategiak: `docs/egiaztapena/fitxategiak/r6-self-holding.automalab.json` eta `r7-abab-relays-reed.automalab.json` (Proiektuak → Inportatu).

## Edukia

- **Txantiloiak:** agintea zuzena elektrobalbularekin; zeharkakoa errelearekin; martxa/geldialdia (R6); joan-etorria sentsoreekin; A+ B+ A− B− (R7). Bakoitzak 5 galdera.
- **Teoria:** kontrol elektrikoaren oinarriak; autoatxikimendua; amaiera-etengailuak eta sentsore magnetikoak. Iturriak: Editex (5. eta 6. unitateak) eta Creus (7.3).
- **Ariketak:** agintea zuzena; martxa/geldialdia; joan-etorria sentsoreekin; A+ B+ A− B− ziklo jarraitua.

## Mugak eta erabakiak (berrikusteko)

- **Erreleen kommutazio-denbora:** 0 (berehalakoa). SPEC-ek aukerako 10 ms aipatzen du lasterketa-baldintzak erakusteko; ez da egin.
- **Tenporizadore-erreleak** (konexioan/deskonexioan) eta presostatoa: P2, ez daude.
- **Sentsoreak** ibilbidearen muturrean bakarrik aktibatzen dira (rodilloen arau bera); benetako reed sentsore batek tarte txiki bat du.
- **Seinale-gertaerak** (K1=1, Y1=0…) motorrak gordetzen ditu, baina ariketen egiaztatzaileak zilindroen gertaerak bakarrik erabiltzen ditu oraindik.
- Creus-ek sentsore elektrikoentzat **a0/a1** erabiltzen du; guk 1B1/1B2 (zure erabakia).
