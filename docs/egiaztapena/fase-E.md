# Egiaztatze-gida — E fasea: ariketak (pneumatika)

**Data:** 2026-11-04
**Git etiketa:** `fase-E`
**Oharra:** SPEC-en 11. fasetik aurreratua, erabiltzaileak eskatuta (2026-11-04).

## Helburua

«Ariketak» atala, bi ariketa-motarekin:

1. **Diseinu-ariketak (8).** Enuntziatu batetik (egoera, eskakizunak, etiketak) zuk marrazten duzu sistema editorean. **Egiaztatu** sakatzean, aplikazioak zirkuitua simulatzen du, pultsadoreak sakatzen ditu eta baldintza bakoitza aztertzen du: ✓/✗ eta huts egiteko arrazoia, euskaraz. **Edozein zirkuitu zuzenek gainditzen du**, ez da soluzio bakar bat bilatzen.
2. **Kalkulu-ariketak (6).** Enuntziatua eta atal bat edo gehiago, zenbakizko erantzunekin (koma hamartarra, tolerantzia). Ebazpena urratsez urrats.

Gainera, **marraztuta daukazun edozein zirkuitu** egiazta daiteke ariketa baten kontra («Egiaztatu uneko proiektua»). Edukia guztia **zirriborroa** da.

## Probak

| #   | Egin                                                                                                                                                         | Espero da                                                                                                | Emaitza           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Menua → **Ariketak**                                                                                                                                         | 14 txartel (8 diseinu + 6 kalkulu), maila eta mota iragazkiekin; «0 / 14 gaindituta».                    | ☐ Ondo / ☐ Gaizki |
| 2   | «Agintea zuzena» → **Hasi**                                                                                                                                  | Proiektu hutsa; eskuinean enuntziatua, osagai baimenduak (ikurrekin) eta «Erakutsi pista bat».           | ☐ Ondo / ☐ Gaizki |
| 3   | **Marraztu zirkuitua** (iturria, 3/2 pultsadorea, eragin bakuneko zilindroa), jarri etiketak **1S1** eta **1A**, eta «Egiaztatu» fitxan sakatu **Egiaztatu** | Baldintza guztiak ✓ eta «Ariketa gaindituta!».                                                           | ☐ Ondo / ☐ Gaizki |
| 4   | Aldatu etiketa bat (adib. 1S1 → 1S9) eta egiaztatu berriro                                                                                                   | ✗ eta arrazoia: «Ez dago «1S1» etiketadun osagairik…».                                                   | ☐ Ondo / ☐ Gaizki |
| 5   | «Bi eskuko agintea» ariketan, marraztu nahita OR batekin, eta egiaztatu                                                                                      | «1S1 bakarrik sakatuta, 1A ez da ateratzen» ✗: «1A+ gertatu da (t = … s)…», eta baimendu gabeko osagaia. | ☐ Ondo / ☐ Gaizki |
| 6   | 3 saiakera gainditu gabe → **Ikusi soluzio-adibide bat**                                                                                                     | Proiektu berri bat soluzio-adibidearekin; egiaztatuta, dena ✓.                                           | ☐ Ondo / ☐ Gaizki |
| 7   | Txantiloiak → «Bi eskuko agintea» → Ireki; gero Ariketak → «Bi eskuko agintea (AND)» → **Egiaztatu uneko proiektua** → Egiaztatu                             | Txantiloiaren zirkuituak ariketa gainditzen du.                                                          | ☐ Ondo / ☐ Gaizki |
| 8   | Kalkulu-ariketa bat → **Ebatzi**: idatzi erantzunak (`6,92` bezala) → Egiaztatu                                                                              | Atal bakoitzean ✓/✗. Ebazpena gainditu ondoren edo 3 saiakeraren ondoren agertzen da.                    | ☐ Ondo / ☐ Gaizki |
| 9   | Nire aurrerapena                                                                                                                                             | «Ariketak» atala: gainditutakoak (data) eta saiakerak.                                                   | ☐ Ondo / ☐ Gaizki |
| 10  | **Egin ariketak** eta zuzendu: enuntziatuen argitasuna, pistak, baldintzen denborak (ikus behean)                                                            | Zuzenketak bidali.                                                                                       | ☐ Ondo / ☐ Gaizki |

## Diseinu-ariketak

| ID       | Ariketa                           | Maila | Egiaztatzen dena                                          |
| -------- | --------------------------------- | ----- | --------------------------------------------------------- |
| ex-pn-01 | Agintea zuzena                    | 1     | 1S1 sakatuta → 1A+; askatuta → 1A−; geldirik              |
| ex-pn-02 | Zeharkako agintea memoriarekin    | 1     | 1S1-en bulkada → 1A+ eta eutsi; 1S2 → 1A−                 |
| ex-pn-03 | Bi lekutatik (OR)                 | 1     | 1S1 edo 1S2 → 1A+; askatuta → 1A−; hautatzailea erabili   |
| ex-pn-04 | Bi eskuko agintea (AND)           | 1     | bat bakarrik → ezer ez; biak → 1A+; bat askatuta → 1A−    |
| ex-pn-05 | Ateratzea moteldu, itzulera azkar | 2     | ateratzea ≥ 1,5 s; itzulera ≤ 1,2 s; emari-erregulagailua |
| ex-pn-06 | Joan-etorri automatikoa           | 2     | 0S1 → 1A+ 1A−; errepikatzen da                            |
| ex-pn-07 | Tenporizazioa: 2 s aurrean        | 2     | 1A+ → 1A−: 2,8–3,5 s; tenporizadorea                      |
| ex-pn-08 | A+ B+ A− B−                       | 2     | ziklo osoa ordenan; errepikatzen da                       |

Soluzio-adibideak `src/learning/exercises/<id>/solution.automalab.json` fitxategietan daude. Testek ariketa bakoitzarekin soluzio zuzen bat (gainditu behar du) eta oker bat (huts egin behar du) probatzen dituzte.

## Mugak (zintzotasunez)

- **Etiketak derrigorrezkoak dira:** egiaztatzaileak etiketen bidez aurkitzen ditu pultsadoreak eta zilindroak. Enuntziatu bakoitzak esaten du zein.
- **Maila logikoa:** zilindroaren ibilbidea 1 s-koa da abiadura osoan. Egiaztatzaileak abiadura neurtzen du, ez **nola** lortzen den. Adibidez, ezin du bereizi erregulagailua sarreran (meter-in) edo irteeran (meter-out) dagoen; hori enuntziatuan galdera gisa geratzen da.
- **Simulazioan bertan** ere probatu dezakezu zirkuitua (Simulatu, Shift + klik), egiaztatu aurretik.

## Zure klaseko ariketak

Bidali enuntziatuak (testua edo argazkia). Formatu berean gehituko ditut (`exercise.json` + `statement.md` + soluzioa), egiaztapenekin eta testekin.
