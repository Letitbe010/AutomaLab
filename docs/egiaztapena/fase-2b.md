# Egiaztatze-gida — 2b azpi-fasea: rodilloak zilindroei lotuta (R4, R5)

**Data:** 2026-11-04
**Git etiketak:** `fase-2b`, `fase-2` (2. fase osoa)

## Helburua

Rodillo-balbulak (amaiera-balbulak) zilindro baten posizioak eragiten ditu, eta horrela sekuentzia automatikoak simula daitezke. **2. fasearen onarpen-irizpidea:** R1–R5 berdean (testak), eta **zuk R5 UItik marraztu eta ondo simulatzea**.

## Nola lotzen da rodillo bat zilindro bati

1. Jarri rodillodun balbula bat (3/2 NI rodilloa, rodillo abatigarria, edo 5/2 rodilloa).
2. Hautatu, eta «Propietateak» panelean:
   - **Zilindroa:** zerrendan, zilindroaren etiketa (adib. `1A`).
   - **Posizioa:** «Sartuta (−)» edo «Aterata (+)».
3. Zilindroaren gainean marra txiki bat agertzen da, balbularen etiketarekin (adib. `1S2`), detektatzen duen posizioan. Simulazioan, sakatuta dagoenean urdinez argitzen da.

Lotura **etiketaren bidez** egiten da (SPEC §4: etiketak domeinuen arteko lotura dira). Zilindroaren etiketa aldatzen baduzu, rodilloak lotura galtzen du eta «Abisuak» panelak esaten dizu.

## Probak

| #   | Egin                                                                                                        | Espero da                                                                                                                                  | Emaitza           |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| 1   | Inportatu `r4-reciprocation.automalab.json` eta «Simulatu»                                                  | Zilindroa bakarrik hasten da joan-etorrian (~1 s joan, ~1 s etorri), etengabe. Zilindroaren gaineko 1S1/1S2 markak txandaka argitzen dira. | ☐ Ondo / ☐ Gaizki |
| 2   | Klik 0V1 itxiera-giltzan                                                                                    | Zikloa amaitzen da eta zilindroa sartuta geratzen da. Berriro klik: berriro hasten da.                                                     | ☐ Ondo / ☐ Gaizki |
| 3   | Inportatu `r5-cascade-abba.automalab.json`, «Doitu», «Simulatu»                                             | Geldirik. 1S1 eta 2S1 markak argituta (bi zilindroak sartuta).                                                                             | ☐ Ondo / ☐ Gaizki |
| 4   | Klik labur 0S1 (martxa) pultsadorean                                                                        | Ziklo bat: 1A+ → 2A+ → 2A- → 1A-, eta gelditu. Espazio-fase diagraman lau urratsak.                                                        | ☐ Ondo / ☐ Gaizki |
| 5   | Ziklo baten erdian sakatu berriro 0S1                                                                       | Ez du ezer egiten (I. taldea aktibo dagoenean martxa-seinaleak ez du eraginik).                                                            | ☐ Ondo / ☐ Gaizki |
| 6   | **Marraztu zuk zeuk R5** (A+ B+ B- A-, kaskada, 2 talde), zure ohiko eran                                   | Simulazioan sekuentzia zuzena. Ez bada, esan zer gertatzen den: konparatu R5 fitxategiarekin.                                              | ☐ Ondo / ☐ Gaizki |
| 7   | Jarri rodillo bat lotu gabe; edo lotu existitzen ez den etiketa batera                                      | «Abisuak»: «rodilloa ez dago zilindro bati lotuta» / «ez dago «X» etiketadun zilindrorik».                                                 | ☐ Ondo / ☐ Gaizki |
| 8   | Rodillo abatigarria (3/2) zilindro baten (+) muturrean, irteera manometro batera; zilindroa atera eta sartu | Manometroak presio-pultsu labur bat erakusten du zilindroa amaierara iristean; atzera egitean, ezer ez.                                    | ☐ Ondo / ☐ Gaizki |

## R5 zirkuitua (erreferentzia)

- 0V1 memoria-balbula (5/2 biegonkorra, pilotajea): 4 portua = **I. lerroa**, 2 portua = **II. lerroa**.
- I. lerroa → 1V1:14 (A+); I → 1S2 (a1) → 2V1:14 (B+); I → 2S2 (b1) → 0V1:12 (II. taldera).
- II. lerroa → 2V1:12 (B-); II → 2S1 (b0) → 1V1:12 (A-); II → 0S1 (martxa) → 1S1 (a0) → 0V1:14 (I. taldera).

## Proba-fitxategiak

- `docs/egiaztapena/fitxategiak/r4-reciprocation.automalab.json`
- `docs/egiaztapena/fitxategiak/r5-cascade-abba.automalab.json`

## Azpi-fase honetan EZ dagoena

- Amaiera-etengailu elektrikoak eta sentsore magnetikoak (4. fasea, elektropneumatika): mekanismo bera erabiliko dute.
- Rodillo bat ibilbidearen erdian (posizio librea, mm-tan): oraingoz bi muturretan bakarrik.
