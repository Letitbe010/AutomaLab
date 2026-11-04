# Egiaztatze-gida — 1b azpi-fasea: SVG editorea

**Data:** 2026-11-04
**Git etiketa:** `fase-1b`

## Helburua

Zirkuitu pneumatiko bat marraztu: osagaiak jarri, mugitu, biratu, ispilatu, hodiz lotu (T loturak barne), desegin/berregin eta abisuak ikusi. **Oraindik ez da ezer gordetzen**: orria freskatzean zirkuitua galtzen da (1c-n konponduko da).

## Nola abiarazi

1. Terminal berri batean, proiektuaren karpetan: `npm run dev`
2. Ireki <http://localhost:5173>. «Editorea» atala irekita dago.

## Probak

| #   | Egin                                                                                                              | Espero da                                                                                                                               | Emaitza           |
| --- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Klik liburutegiko «Eragin bakuneko zilindroa»-n, gero «3/2 balbula…»-n eta «Aire-iturria»-n                       | Hiru osagai oihalean, etiketekin: **1A**, **1V1**, **0Z1**.                                                                             | ☐ Ondo / ☐ Gaizki |
| 2   | Arrastatu osagai bat liburutegitik oihalera                                                                       | Askatutako lekuan agertzen da, saretara egokituta.                                                                                      | ☐ Ondo / ☐ Gaizki |
| 3   | Arrastatu osagaiak oihalean (balbula zilindroaren azpian, iturria balbularen azpian)                              | Saretako urratsetan mugitzen dira; lotutako hodiek jarraitzen diete.                                                                    | ☐ Ondo / ☐ Gaizki |
| 4   | Klik iturriaren 1 portuan (puntu urdina), gero balbularen 1 portuan                                               | Hodi bat sortzen da, lerro horizontal eta bertikalekin bakarrik. Portuak beteta (konektatuta) agertzen dira.                            | ☐ Ondo / ☐ Gaizki |
| 5   | Klik portu batean, gero oihaleko hutsune batean (bi aldiz), eta azkenik beste portu batean                        | Hutsuneko klikek angelu-puntuak gehitzen dituzte; hodiak puntu horietatik pasatzen da. `Esc`-ek marrazketa uzten du.                    | ☐ Ondo / ☐ Gaizki |
| 6   | **T lotura:** hasi hodi bat balbularen 3 portuan eta amaitu beste hodi baten erdian                               | Puntu beltz bat (T lotura) agertzen da hodiaren gainean, eta hiru adarrak lotuta daude.                                                 | ☐ Ondo / ☐ Gaizki |
| 7   | Hautatu hodi bat (klik gainean), arrastatu bere puntu karratuak; klik bikoitza hodian; klik bikoitza puntu batean | Puntuak mugitzean bidea aldatzen da (beti ortogonala); klik bikoitzak puntua gehitzen/kentzen du.                                       | ☐ Ondo / ☐ Gaizki |
| 8   | Hautatu balbula eta sakatu `R` (lau aldiz) eta `M`                                                                | 90°-ka biratzen da; `M`-k ispilatzen du. Hodiak portuei lotuta jarraitzen dute. Propietateetan «Biraketa: 90°…».                        | ☐ Ondo / ☐ Gaizki |
| 9   | `Ctrl+Z` hainbat aldiz, gero `Ctrl+Y`                                                                             | Aldaketak banan-banan desegiten eta berregiten dira (arrastatze oso bat = urrats bakarra).                                              | ☐ Ondo / ☐ Gaizki |
| 10  | Hautatu bi osagai (`Shift`+klik edo hutsunean arrastatuz laukizuzena), `Ctrl+C`, `Ctrl+V`                         | Kopiak 20 px desplazatuta agertzen dira, etiketa berriekin (adib. 2A, 1V2) eta beren arteko hodiarekin.                                 | ☐ Ondo / ☐ Gaizki |
| 11  | Hautatu osagai bat eta sakatu `Supr` (Delete)                                                                     | Osagaia eta bere hodiak ezabatzen dira.                                                                                                 | ☐ Ondo / ☐ Gaizki |
| 12  | Propietateetan aldatu zilindroaren «Etiketa» (adib. `2A`) eta «Ibilbidea» (adib. `200`), sakatu Enter             | Oihaleko etiketa aldatzen da. Balio okerrak (adib. `-5` edo `abc`) baztertu eta aurreko balioa itzultzen da.                            | ☐ Ondo / ☐ Gaizki |
| 13  | Begiratu behealdeko «Abisuak» panela; klik abisu batean                                                           | Portu libreak abisu gisa («1V1: 3 portua ez dago konektatuta»). Klik → dagokion osagaia hautatzen da.                                   | ☐ Ondo / ☐ Gaizki |
| 14  | Jarri bi osagairi etiketa bera                                                                                    | Abisua: «… etiketa osagai bat baino gehiagotan dago».                                                                                   | ☐ Ondo / ☐ Gaizki |
| 15  | Gurpila (zoom) saguaren gainean; `Zuriunea` + arrastatu edo erdiko botoia (pan); «Doitu» botoia                   | Zoom-a kurtsorearen inguruan; pan-a; «Doitu»-k zirkuitu osoa erakusten du.                                                              | ☐ Ondo / ☐ Gaizki |
| 16  | Klik «Simulatu»                                                                                                   | Banda morea: «Simulazio modua: eskema blokeatuta…». Portuak desagertzen dira; ezin da ezer mugitu edo gehitu. «Editatu»-k itzultzen du. | ☐ Ondo / ☐ Gaizki |

## Proba-fitxategiak

Ez dago oraindik (inportazioa 1c-n).

## Azpi-fase honetan EZ dagoena

- Ez da gordetzen: freskatzean edo nabigatzailea ixtean zirkuitua galtzen da (1c).
- Ez dago JSON esportazio/inportaziorik ezta babeskopiarik (1c).
- Ez dago simulaziorik: «Simulatu» moduak eskema blokeatzen du bakarrik (2. fasea).
- Ez dago laguntza-txartelik hover bidez (2. fasea); liburutegiko elementuen gainean testu laburra bakarrik.
- T lotura hodi baten **erdian amaituz** sortzen da; ezin da hodi baten erditik **hasi** (hasi portu batean eta amaitu hodian).
