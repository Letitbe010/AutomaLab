# Egiaztatze-gida — 3b azpi-fasea: zirkuitu-txantiloiak

**Data:** 2026-11-04
**Git etiketa:** `fase-3b`

## Helburua

«Txantiloiak» atala (SPEC §8.5): aurrez muntatutako 5 zirkuitu pneumatiko, katalogoa miniaturekin eta iragazkiekin. «Ireki» botoiak txantiloiaren **kopia** bat sortzen du zure proiektuetan, eta jatorrizko txantiloia ez da aldatzen. Editorean, azalpen-panelak zirkuituaren funtzionamendua azaltzen du; osagaien etiketak klikagarriak dira. Txantiloi guztiak **zirriborroak** dira, zuk berrikusi arte.

## Nola abiarazi

- Webean: <https://letitbe010.github.io/AutomaLab/> (push-a egin eta minutu batzuetara eguneratzen da).
- Edo ordenagailuan: klik bikoitza `AutomaLab.cmd`.

## Probak

| #   | Egin                                                                                            | Espero da                                                                                                 | Emaitza           |
| --- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Menuan, «Txantiloiak»                                                                           | 5 txartel, bakoitza zirkuituaren miniaturarekin, mailarekin, etiketekin eta «Zirriborroa» markarekin.     | ☐ Ondo / ☐ Gaizki |
| 2   | Iragazi «Maila: Ertaina», gero «Etiketa: kaskada». Egin klik txartel bateko etiketa batean ere. | 2 txantiloi, gero 1. Etiketan klik eginez gero, iragazkia aplikatzen da.                                  | ☐ Ondo / ☐ Gaizki |
| 3   | «Bi eskuko agintea» → **Ireki**                                                                 | Editorea irekitzen da zirkuituarekin; eskuinean azalpen-panela. Proiektuaren izena = txantiloiaren izena. | ☐ Ondo / ☐ Gaizki |
| 4   | Panelean, egin klik **1V2** etiketan                                                            | Osagaia oihalean nabarmentzen da (koadro urdin keinukaria) eta hautatuta geratzen da.                     | ☐ Ondo / ☐ Gaizki |
| 5   | **Simulatu**: **Shift + klik** 1S1-en, gero Shift + klik 1S2-n; azkenik klik arrunta 1S1-en     | 1S1 bakarrik: ez da mugitzen. Biak sakatuta: ateratzen da. Klik arruntak 1S1 askatzen du: itzultzen da.   | ☐ Ondo / ☐ Gaizki |
| 6   | Editatze-moduan, ezabatu osagai bat eta mugitu beste bat. Gero panelean «Berrezarri txantiloia» | Baieztapena eskatzen du; zirkuitua jatorrizkoa da berriro. Ctrl+Z-k zure aldaketak itzultzen ditu.        | ☐ Ondo / ☐ Gaizki |
| 7   | «Proiektuak» → begiratu zerrenda                                                                | Ireki duzun txantiloi bakoitza proiektu bereizi bat da; txantiloia bera ez da inoiz aldatzen.             | ☐ Ondo / ☐ Gaizki |
| 8   | «Kaskada A+ B+ B− A−» ireki → Simulatu → klik 0S1                                               | Ziklo osoa; espazio-fase diagraman lau mugimenduak. Azalpenaren 1–6 urratsak bat datoz ikusten denarekin. | ☐ Ondo / ☐ Gaizki |
| 9   | «Abiaduraren erregulazioa»: ireki eta simulatu (1V1 sakatuta mantendu, gero askatu)             | Ateratzea itzultzea baino motelagoa da (1V3 = 0,4 / 1V2 = 0,7).                                           | ☐ Ondo / ☐ Gaizki |
| 10  | Teoria → «Funtzio logikoak» → eskuinean «Txantiloiak»                                           | Lotutako txantiloiak agertzen dira; klik → editorean irekitzen da.                                        | ☐ Ondo / ☐ Gaizki |
| 11  | **Irakurri 5 azalpenak** eta zuzendu (terminologia, funtzionamendua, «Proba ezazu» urratsak)    | Zuzenketak bidali; berrikusitakoak «reviewed» gisa markatuko ditut.                                       | ☐ Ondo / ☐ Gaizki |

Oharra (5. proba): sagu batekin pultsadore bakarra sakatu daiteke aldi berean. Horregatik, azpi-fase honetan **Shift + klik** gehitu da: eragingailu manual bat sakatuta geratzen da (blokeatuta) klik arrunt batek askatu arte. Edozein zirkuitutan balio du.

## Txantiloiak

1. **Agintea zuzena** (oinarrizkoa) — eragin bakuneko zilindroa eta 3/2 pultsadorea (R1).
2. **Zeharkako agintea memoriarekin** (oinarrizkoa) — 5/2 biegonkorra, bi pultsadore (R2).
3. **Bi eskuko agintea** (oinarrizkoa) — bi presioko balbula (AND) eta 5/2 monoegonkorra.
4. **Abiaduraren erregulazioa ihesean** (ertaina) — noranzko bakarreko bi emari-erregulagailu (meter-out).
5. **A+ B+ B− A− kaskada** (ertaina) — R5 zirkuitu bera (Creus, 7.10 irudia).

Fitxategiak: `src/learning/templates/<id>/` (`template.json`, `circuit.automalab.json`, `description.md`). Galdetegiak (`quiz.json`) 3c azpi-fasean gehituko dira.

## Azpi-fase honetan EZ dagoena

- Galdetegiak eta «Nire aurrerapena» (3c).
- Ibilbide gidatua eta akatsen modua (SPEC-en P2).
- Txantiloi pertsonalak (zure zirkuituak txantiloi gisa gordetzea).
