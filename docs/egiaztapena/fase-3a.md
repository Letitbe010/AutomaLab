# Egiaztatze-gida — 3a azpi-fasea: teoria-atala

**Data:** 2026-11-04
**Git etiketa:** `fase-3a`

## Helburua

«Teoria» atala: kontzeptuak eta formulak (Markdown + KaTeX), bilaketa, ikurrak fitxen barruan, lotutako edukia eta iturriak. 5 fitxa pneumatiko, **zirriborro** gisa (zuk berrikusi arte). Editoretik, «Teoria gehiago» estekak fitxa alboko panelean irekitzen du.

## Nola abiarazi

- Webean: <https://letitbe010.github.io/AutomaLab/> (push-a egin eta minutu batzuetara eguneratzen da).
- Edo ordenagailuan: klik bikoitza `AutomaLab.cmd`.

## Probak

| #   | Egin                                                                                           | Espero da                                                                                                                 | Emaitza           |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Menuan, «Teoria»                                                                               | Ezkerrean 5 fitxa, bakoitza «Zirriborroa — berrikusteko» etiketarekin; eskuinean lehen fitxa.                             | ☐ Ondo / ☐ Gaizki |
| 2   | Bilatu «indarra», gero «lanzadera», gero «a0»                                                  | Bilaketak izenburuan, etiketetan eta testuan bilatzen du.                                                                 | ☐ Ondo / ☐ Gaizki |
| 3   | Ireki «Zilindroaren indarra eta aire-kontsumoa»                                                | Formulak ondo marraztuta (zatikiak, azpiindizeak); ikurra txertatuta; adibide ebatzia: 434 N, 373 N, r ≈ 6,92, ≈ 1,04 Nl. | ☐ Ondo / ☐ Gaizki |
| 4   | Fitxa horretan, egiaztatu iturria (eskuinean, «Iturriak») eta Creus-ekiko oharra (kontsumoa)   | Creus, _Neumática e Hidráulica_, ataleko eta orrietako erreferentzia; 0,987 / 1,013 oharra.                               | ☐ Ondo / ☐ Gaizki |
| 5   | «Lotutako edukia»-n klik «Presioa eta unitateak»                                               | Fitxa hori irekitzen da.                                                                                                  | ☐ Ondo / ☐ Gaizki |
| 6   | **Irakurri 5 fitxak** eta zuzendu edukia (terminologia, formulak, adibideak, akats tipikoak)   | Zuzenketak bidali; berrikusitakoak «reviewed» gisa markatuko ditut (etiketa desagertzen da).                              | ☐ Ondo / ☐ Gaizki |
| 7   | Editorean, jarri eragin bikoitzeko zilindro bat, hautatu → «Propietateak» → «Teoria gehiago →» | Fitxa alboko panelean irekitzen da, editorea utzi gabe. «×» ixten du.                                                     | ☐ Ondo / ☐ Gaizki |
| 8   | Hautatu 5/2 balbula bat eta sakatu **F1** → «Teoria gehiago →»                                 | «Balbula banatzaileak» fitxa panelean.                                                                                    | ☐ Ondo / ☐ Gaizki |

## Fitxak

1. **Presioa eta unitateak** — absolutua/manometrikoa, bar–Pa–N/mm², F = p·A/10.
2. **Zilindroaren indarra eta aire-kontsumoa** — aurrera/atzera, malgukia, η (marruskadura % 3–10), konpresio-erlazioa (p + 1,013)/1,013.
3. **Balbula banatzaileak** — bideak/posizioak, portuen zenbakiak, NI/NA, eragingailuak, mono/biegonkorra, 5/3 zentroak.
4. **Funtzio logikoak** — AND (bi 3/2 seriean / bi presioko balbula), OR (hautatzailea), NOT, memoria.
5. **Espazio-fase diagrama eta kaskada-metodoa** — notazioa, gainjartzeak (A+ B+ B− A−), kaskadaren arauak.

Fitxak `src/learning/theory/pneumatic/*.md` fitxategietan daude (Markdown arrunta, formulak `$…$` artean). Zuzenean editatu ditzakezu, edo zuzenketak niri esan.

## Azpi-fase honetan EZ dagoena

- Kalkulagailu interaktiboak (SPEC-en P2): funtzioak eginda eta testatuta daude, interfazea gero.
- Txantiloietarako estekak (3b) eta galdetegiak (3c).
- Gaztelaniazko bertsioa.
