# Egiaztatze-gida — 7. fasea: sekuentzia-sortzailea eta galdetegi osoa

**Data:** 2026-11-09
**Git etiketak:** `fase-7`, `mvp-2`

## Helburua

Sekuentzia bat testu gisa idatzita, espazio-fase diagrama, seinale-gainjartzeak, kaskada-taldeak eta zirkuituak sortzea (SPEC §8.8), eta P1eko galdera-mota guztiak, azterketa-modua eta ausazko galdetegia (SPEC §8.6).

Zure erabakiak (2026-11-09):

- Sortzailea seigarren menu-atal gisa («Sortzailea»).
- Bi zirkuitu sortzen dira: kaskada pneumatikoa, eta elektropneumatikoa PLC eta GRAFCETekin. Erreleekikoa geroko uzten da (SPEC: P2).
- Taldeak Creus-en arauarekin: talde batean letra errepikatu gabe eta ahalik eta talde gutxien.
- Egungo galdera batzuk `identify` eta `multiple` motetara bihurtu dira, edukia gehitu gabe.

## Probak

| #   | Egin                                                                                                     | Espero da                                                                                            | Emaitza           |
| --- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Sortzailea → idatzi `A+ B+ B- A-`                                                                        | Diagrama; 2 gainjartze (1. urratsa, b0; 3. urratsa, a1); I: A+ B+; II: B− A−; memoria 1.             | ☐ Ondo / ☐ Gaizki |
| 2   | Idatzi `A+ B+ B+ A-`, gero `A- A+`, gero `A+ B+`                                                         | Errore argia, urratsa aipatuta.                                                                      | ☐ Ondo / ☐ Gaizki |
| 3   | Idatzi `A+ A- B+ B-`                                                                                     | 2 talde: I: A− B+; II: B− A+. **Egiaztatu klasean horrela egiten duzuen**.                           | ☐ Ondo / ☐ Gaizki |
| 4   | «Ireki kaskada editorean» → Simulatu → klik 0S1                                                          | Sekuentzia osoa eta geldialdia. Marrazkia irakurgarria da: zilindroak, balbulak, rodilloak, lerroak. | ☐ Ondo / ☐ Gaizki |
| 5   | Saiatu `A+ B+ C+ C- D+ D- B- A-` (4 zilindro, 3 talde) eta `A+ B+ B- B+ B- A-` (OR balbulak)             | Sekuentzia zuzena. Bigarrenean OR balbulak agertzen dira.                                            | ☐ Ondo / ☐ Gaizki |
| 6   | Sortzailea → «Ireki PLC + GRAFCET editorean» → GRAFCET fitxa → Eskema → Simulatu → S1                    | Urrats bat mugimendu bakoitzeko; sekuentzia zuzena.                                                  | ☐ Ondo / ☐ Gaizki |
| 7   | **Marraztu zuk** zirkuitu bat, itzuli Sortzailea atalera, idatzi zure sekuentzia eta sakatu **Alderatu** | «Bat dator», edo zein urratsetan desberdintzen den.                                                  | ☐ Ondo / ☐ Gaizki |
| 8   | Txantiloiak → «Memoria» → Galdetegia → 5. galdera                                                        | Klik zirkuituko osagaian → «Hautatua: 1S1» → Egiaztatu.                                              | ☐ Ondo / ☐ Gaizki |
| 9   | Txantiloiak → «Agintea zuzena» → Galdetegia → Azterketa-modua + 5 min                                    | Zuzenketarik ez amaierara arte; atzera joan daiteke; kontagailua ikusten da.                         | ☐ Ondo / ☐ Gaizki |
| 10  | Ariketak → Ausazko galdetegia → domeinua aukeratu → Hasi                                                 | Txantiloi desberdinetako galderak; «Ikusi zirkuitua» zabaltzen da.                                   | ☐ Ondo / ☐ Gaizki |
| 11  | Nire aurrerapena                                                                                         | Galdera-mota berriak eta ausazko galdetegien laburpena.                                              | ☐ Ondo / ☐ Gaizki |
| 12  | Berrikusi bihurtutako 13 galderak (`identify`: 9; `multiple`: 4)                                         | Zuzenketak bidali.                                                                                   | ☐ Ondo / ☐ Gaizki |

## Erreferentzia-probak (testak)

**R12:** 14 sekuentzia, 1–4 zilindro. Bakoitzean: kaskada baliozkoa da, geldirik dago abiarazi arte, eta sekuentzia zuzena egiten du bi aldiz jarraian; GRAFCET + PLC bertsioak eta Ladder-era bihurtutakoak ere bai.

## Egiaztatua eta suposizioak

- **Egiaztatua (iturria):** taldeen arauak eta balbula kopuruak: Creus, _Neumática e Hidráulica_, 7.2.6.2, 334.–337. or.
- **Nire diseinua, Creus-ek ez du xehetasun honetan zehazten:** memorien konexioa kate gisa (k memoriaren 2 portuak hurrengoa elikatzen du, eta k lerroak k+1 memoria berrezartzen du). Simulazioan probatuta dago 4 taldera arte, baina **ez da liburuko eskema batekin marrazkiz marrazki alderatu**.
- **Suposizioa:** azken eta lehen taldeak batzea. Testuak «talde gutxien» dio; klaseko ohitura bestelakoa bada, esan.
- **Gainjartzeen azterketa** zuzeneko zirkuituari dagokio: mugimendu bakoitza aurrekoaren amaiera-balbulak aginduta.

## Mugak

- Talde kopuru txikiena errespetatuta ere, kableak gurutzatzen dira: zirkuitua editatzekoa da, ez eskema optimizatua.
- Letra berak talde desberdinetan mugimendu bera badu (`A+ A- A+ A-`), OR balbulak gehitzen dira. Amaiera-balbula bat letra bakoitzeko: Creus-en araua.
- PLC bertsioak ez du geldialdirik: S1 sakatzean ziklo bat.
- Gehienez 5 zilindro PLC bertsioan (CPU 1214C-k 10 irteera ditu). Kaskadan, 6 arte.
- Mugimendu aldiberekoak eta tenporizazioak: P2, ez daude.
- Ausazko galdetegian galderek zirkuituko etiketak aipatzen dituzte; horregatik dago «Ikusi zirkuitua».
- Alderatzeak lehen ziklo bakarra begiratzen du.
