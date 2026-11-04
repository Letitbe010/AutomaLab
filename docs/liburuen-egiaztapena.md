# Liburuekiko egiaztapena

**Data:** 2026-11-04
**Helburua:** AutomaLab-en orain arte egindakoa (ikurrak, konbentzioak, simulazio-arauak) eta 3. fasean egingo dena (teoria, txantiloiak, galderak) `Liburuak/` karpetako liburuekin alderatzea.

## Iturriak

| Laburdura     | Liburua                                                                           | Edukia AutomaLab-erako                                                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Creus**     | A. Creus Solé, _Neumática e Hidráulica_, Marcombo, 2007 (ISBN 84-267-1420-X)      | **Iturri nagusia** 1.–3. eta 8.–9. faseetarako: zilindroen kalkulua (2.3.2), balbula banatzaileak (2.3), funtzio logikoak, zirkuituak eta kaskada-metodoa (7.2), ikurrak (8. eranskina). |
| **Editex**    | J. C. Martín, M. P. García, _Automatismos industriales_, Editex                   | Automatismo elektrikoak eta PLCa (Ladder, GRAFCET). Pneumatikari buruz sarrera labur bat bakarrik (5. unitatea). **4.–6. faseetarako** baliagarria.                                      |
| **Paraninfo** | J. Rodríguez, L. M. Cerdá, R. Bezos, _Automatismos industriales_, Paraninfo, 2014 | Automatismo elektrikoak, LOGO! eta Zelio errele programagarriak, GRAFCET. Pneumatikarik ia ez. **4.–6. faseetarako**.                                                                    |

**Metodoa:** PDFetatik testua atera eta gaika bilatu da; ikur-taulak (Creus, A.1 eta A.2 taulak, 367.–375. or.) irudi gisa begiratu dira. A.1 taularen bereizmena txikia da: xehetasun finak ez dira guztiz ziurrak.

**Egile-eskubideak:** liburuak erreferentzia gisa bakarrik erabiltzen dira. Aplikazioan ez da testurik, irudirik edo taularik kopiatzen (SPEC §0.5). Teoria-fitxek beren testu propioa izango dute, eta iturria aipatuko dute (liburua eta orria).

Egoera: ✅ bat dator · ⚠️ desberdintasun txikia (zuzentzea gomendatzen da) · ❓ zure erabakia behar da · ➖ liburuan ez dago

## 1. Orain arte egindakoa

### 1.1 Konbentzioak eta arauak

| Gaia                      | AutomaLab                                                                                                                  | Liburua                                                                                                                                            | Egoera                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Portuen zenbakiak         | 1 elikadura; 2, 4 lana; 3, 5 ihesa; 12, 14 pilotajea                                                                       | Creus 2.5 taula (52. or.): ISO 1219 / CETOP zenbakizkoa, berdin.                                                                                   | ✅                               |
| 10 pilotajea (3/2 NA)     | Pilotajeak 1 blokeatzen du → «10»                                                                                          | Creus-en taulak 12, 14, 16 bakarrik aipatzen ditu.                                                                                                 | ➖                               |
| Hornidura-presioa         | 6 bar lehenetsia                                                                                                           | Creus: «típico 6 bar» (11. or.); balbulak ~6 bar, tartea 1,2–8 bar (57. or.).                                                                      | ✅                               |
| Amaiera-balbulen etiketak | 1S1, 1S2, 2S1… (lehenetsia)                                                                                                | Creus-ek **a0, a1, b0, b1** erabiltzen ditu (52.–53. or., 7.2 atala, kaskada); zilindroak A, B, C. Beste adibide batean 0Z1, 1V1… (Festo estiloa). | ❓                               |
| Zilindroen etiketak       | 1A, 2A                                                                                                                     | Creus: A, B, C (sekuentzietan A+, A-).                                                                                                             | ❓                               |
| Mugimenduen notazioa      | 1A+, 1A- (gertaerak eta diagrama)                                                                                          | Creus: A+, A-.                                                                                                                                     | ✅                               |
| Bi seinale biegonkorrean  | Aurreko posizioa mantentzen du                                                                                             | Creus 7.2.1: diagramaren helburua «señales permanentes» saihestea da; balbula ez da aldatzen kontrako aldean seinalea dagoen bitartean.            | ✅ (abisua falta, ikus 3. atala) |
| Abiadura-erregulazioa     | Faktorea throttled norabidean; meter-out txantiloia                                                                        | Creus 82. or.: ihesaren erregulazioa (meter-out) egokiena eragin bikoitzeko zilindroetan; sarrerakoak kargarekiko sentikorra.                      | ✅                               |
| AND funtzioa              | «Bi presioko balbula (AND)»                                                                                                | Creus 107.–108. or.: «válvula de simultaneidad»; bi 3/2 seriean ere bai.                                                                           | ✅                               |
| OR funtzioa               | «Balbula hautatzailea (OR)»                                                                                                | Creus 108. or.: «válvula de lanzadera / selectora de circuito».                                                                                    | ✅                               |
| AND/OR portuen izenak     | X, Y → 2                                                                                                                   | Creus-ek ez ditu izendatzen.                                                                                                                       | ➖ ❓                            |
| Kaskada-metodoa (R5)      | Memoria 5/2 biegonkorra; I. lerroa 4 portuan, II.a 2 portuan; amaiera-balbulak taldearen lerrotik; martxa a0-rekin seriean | Creus 7.2.6.2 (328.–331. or.): arau eta egitura berdinak, A+ B+ B- A- adibide berarekin (7.10 irudia).                                             | ✅                               |
| Espazio-fase diagrama     | Desplazamendua–urratsa, gertaeretatik                                                                                      | Creus 7.2: «diagrama espacio-fase» sekuentziak diseinatzeko.                                                                                       | ✅                               |

### 1.2 Ikurrak (Creus, 8. eranskina)

| Ikurra                     | AutomaLab                                              | Creus                                                                                                                                | Egoera  |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Malgukia                   | Sigi-saga                                              | Sigi-saga (A.1 eta 372. or.).                                                                                                        | ✅      |
| Pultsadorea                | Zurtoina + zirkuluerdia                                | Berdin (A.1, «pulsador»).                                                                                                            | ✅      |
| Solenoidea                 | Laukizuzena + diagonala                                | Berdin (A.1 eta 372. or.).                                                                                                           | ✅      |
| Rodilloa                   | Zurtoina + zirkulua                                    | Zirkulua, **puntu batekin erdian** (372. or.).                                                                                       | ⚠️      |
| Rodillo abatigarria        | Zurtoina + koska + zirkulua                            | «Rodillo (una sola dirección)»: **beso artikulatua** (bi zati) eta rodilloa muturrean.                                               | ⚠️      |
| Palanka                    | Zurtoina + diagonala + puntua artikulazioan            | Diagonala, **zirkulu txiki batekin muturrean** (A.1).                                                                                | ⚠️      |
| Pedala                     | Zurtoina + diagonala + plaka                           | Antzekoa (372. or.).                                                                                                                 | ✅      |
| Pilotaje pneumatikoa       | Triangelu hutsa + lerro marratua                       | **Lauki txiki bat triangelu hutsarekin barruan** (372. or.); bertsio sinplifikatua: lerro marratua bakarrik.                         | ⚠️      |
| Pilotaje-lerroak eskeman   | Hodi guztiak lerro jarraituz                           | «Línea piloto» = **marratua** (A.1).                                                                                                 | ❓      |
| Antzezpen-balbula          | Eserlekua (V) + bola; 1 → 2 libre                      | Bola eta eserlekua; norabidea bat dator (372. or.).                                                                                  | ✅      |
| Hautatzailea (OR)          | Laukizuzena, bi eserleku, bola, irteera goian          | Antzekoa (373. or.).                                                                                                                 | ✅      |
| Ihes azkarrekoa            | Hautatzailearen antzekoa + ihes-triangelua             | Antzekoa (373. or.).                                                                                                                 | ✅      |
| Erregulagailua, sekuentzia | Laukia + gezia + malguki doigarria + pilotaje marratua | Antzeko egitura (373. or.). Sekuentzia-balbula: nik 3/2 pilotatu gisa marraztu dut (Festo-ko konbinazioa); Creus-ek balbula sinplea. | ✅ / ➖ |
| Aire-iturria               | Zirkulua + triangelu hutsa                             | A.1 taulan «fuente de energía» dago, baina bereizmena txikiegia da egiaztatzeko.                                                     | ❓      |

## 2. 3. faserako (teoria eta galderak)

| Gaia                 | Liburuak dioena (Creus)                                                                                                                                                                                       | Proposamena                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zilindroaren indarra | F = p · A; unitate praktikoetan F (N) = p (bar) · A (mm²) / 10. Eragin bakunekoan, malgukiaren indarra kendu. Atzera: A = π(D² − d²)/4. Marruskadura: kalkulatutako indarraren % 3–10 (2.3.2.1, 28.–29. or.). | Formula berberak. **η ez dago liburuan faktore gisa**; marruskadura % 3–10 da → η ≈ 0,90–0,97. SPEC-eko η = 0,9 tarte barruan dago (kasurik txarrena). ✅                                                                          |
| Aire-kontsumoa       | Konpresio-erlazioa × azalera × ibilbidea × ziklo/min. Creus-ek erlazioa **(0,987 + p) / 0,987** gisa idazten du; eragin bikoitzekoan 2× (zurtoina arbuiatuta) (2.3.2.3, 36.–37. or.).                         | ❓ Creus-en 0,987 balioa atmosfera bar-etan adierazita (1 bar = 0,987 atm) dago, eta unitateak nahasten ditu. Ohiko formula (p + 1,013) / 1,013 da (bar). Bien artean ~% 2ko aldea dago 6 bar-etan. Zein erabiltzen duzue klasean? |
| Unitateak            | 1 bar = 100 000 Pa = 0,987 atm = 1,02 kg/cm² (28. or.).                                                                                                                                                       | Teoria-fitxan berdin. ✅                                                                                                                                                                                                           |
| Txantiloiak          | Creus-en adibideak: agintea zuzena, AND bi 3/2 seriean edo simultaneitate-balbularekin, OR lanzaderarekin, meter-out, joan-etorria, A+ B+ B- A- kaskada.                                                      | Proposatutako 5 txantiloiak bat datoz. Bi eskuko aginterako, bi aldaerak erakuts daitezke (AND balbula / bi 3/2 seriean). ✅                                                                                                       |

## 3. Gomendioak

**Orain, 3. fasearen aurretik (txikiak, ikurrak bakarrik):**

1. **Palanka:** zirkulua besoaren muturrean (ez artikulazioan).
2. **Pilotajea:** lauki txiki bat triangeluaren inguruan.
3. **Rodilloa:** puntua erdian. **Rodillo abatigarria:** beso artikulatua.
4. **Bi seinale biegonkorrean:** «Abisuak» panelean abisua («seinale iraunkorrak 1V1-en 12 eta 14 portuetan»). Creus-ek ohiko akats gisa aipatzen du, eta SPEC §7.3k ere eskatzen du.

**Zure erabakia behar dutenak:**

5. **Etiketak:** a0/a1/b0/b1 (Creus, sekuentzia-metodoak) ala 1S1/1S2 (Festo / ISO 1219-2)? Gomendioa: **rodilloak automatikoki a0/a1 gisa izendatzea** zilindro bati lotzean (1A → a, 2A → b; − → 0, + → 1). Horrela kaskada-metodoko testuekin bat dator, eta 1A/1V1 numerazioa gainerakoentzat mantentzen da.
6. **Pilotaje-lerroak marratuta** marraztu eskeman (Creus-en konbentzioa). Horrek esan nahi du simulazioan ihesa ezin dela marraz bidez adierazi; urdin argiz eta lerro meheagoz adieraziko litzateke.
7. **Aire-kontsumoaren formula:** Creus-ena ala (p + 1,013)/1,013?

**Geroko faseetarako (oharrak):**

- **4. fasea (elektropneumatika):** Editex 6. unitatea, ikur elektrikoen identifikazioa (S1, K1, A1/A2 bobina-borneak, 13/14 kontaktu NA), 24 V DC.
- **5.–6. faseak (PLC, GRAFCET):** bi liburuek GRAFCET azaltzen dute (etapa, trantsizioa, harkortasuna). PLC gisa **LOGO! eta Zelio** erabiltzen dituzte (Paraninfo), ez S7-en `I0.0`. SPEC §14ko galderari («`I0.0` ala `%I0.0`») begira: zein PLC dago lantegian?
