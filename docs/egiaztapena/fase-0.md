# Egiaztatze-gida — 0. fasea: proiektuaren oinarria

**Data:** 2026-11-04
**Git etiketa:** `fase-0`

## Helburua

Egiaztatzea aplikazioa abiarazten dela, euskarazko menu nagusia erakusten duela eta proiektuaren tresnak (testak, build-a) ondo dabiltzala.

## Nola abiarazi

1. Ireki PowerShell terminal **berri** bat proiektuaren karpetan (`Automatismoen softwarea`). Terminal berria behar da, Node.js eta Git berriki instalatu direlako.
2. Exekutatu:

   ```
   npm run dev
   ```

3. Ireki nabigatzailean: <http://localhost:5173>
4. Gelditzeko: `Ctrl + C` terminalean.

## Probak

| #   | Egin                                                        | Espero da                                                                                                                                 | Emaitza           |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Ireki <http://localhost:5173>                               | Hondo gris-urdin argia sareta finarekin; goiko barra zuri erdi-gardena, logo turkesa eta «AutomaLab» ezkerrean (ERP LSB-ren itxura bera). | ☐ Ondo / ☐ Gaizki |
| 2   | Begiratu goiko menua                                        | Bost atal, ordena honetan: Editorea, Txantiloiak, Ariketak, Teoria, Nire aurrerapena.                                                     | ☐ Ondo / ☐ Gaizki |
| 3   | Begiratu orriaren edukia hasieran                           | «EDITOREA» izenburua (maiuskulaz, marra batekin) eta txartel zuri bat: «Edukirik ez oraindik». «Editorea» botoia turkesaz eta ertzarekin. | ☐ Ondo / ☐ Gaizki |
| 4   | Klik egin «Teoria»-n                                        | Izenburua «TEORIA» bihurtzen da; nabarmentze turkesa «Teoria» botoira pasatzen da.                                                        | ☐ Ondo / ☐ Gaizki |
| 5   | Egin klik gainerako atal guztietan, banan-banan             | Atal bakoitzak bere izenburua erakusten du; ez da errorerik agertzen.                                                                     | ☐ Ondo / ☐ Gaizki |
| 6   | Sakatu `Tab` hainbat aldiz, eta gero `Enter` atal batean    | Fokua menuko botoietatik pasatzen da (marko turkesa ikusten da) eta `Enter`-ek atala aldatzen du.                                         | ☐ Ondo / ☐ Gaizki |
| 7   | Gelditu `npm run dev` (`Ctrl + C`) eta exekutatu `npm test` | Amaieran: `Test Files 2 passed`, `Tests 6 passed`.                                                                                        | ☐ Ondo / ☐ Gaizki |
| 8   | Exekutatu `npm run test:e2e`                                | `1 passed`.                                                                                                                               | ☐ Ondo / ☐ Gaizki |
| 9   | Exekutatu `npm run build`                                   | `✓ built in …` agertzen da, errorerik gabe; `dist` karpeta sortzen da.                                                                    | ☐ Ondo / ☐ Gaizki |
| 10  | Estutu nabigatzailearen leihoa (mugikor-zabalera inguruan)  | Menuko botoiak lerro batean baino gehiagotan kokatzen dira; ez da testurik moztuta geratzen.                                              | ☐ Ondo / ☐ Gaizki |

## Proba-fitxategiak

Fase honetan ez dago (oraindik ez dago zirkuituak kargatzeko modurik). `docs/egiaztapena/fitxategiak/` karpeta hutsik dago.

## Fase honetan EZ dagoena

- Ez dago editorerik, oihalik, osagairik edo simulaziorik (1. eta 2. faseak).
- Atalek ez dute edukirik: izenburua eta «hutsik dago» testua bakarrik.
- Ez da ezer gordetzen (IndexedDB, esportazioa eta babeskopia 1. fasean).
- Ez dago gaztelaniazko bertsiorik (`es.json` hutsik dago).
- Ez dago PWA/offline modurik (12. fasea).

## Akatsak aurkitzen badituzu

Idatzi proba-zenbakia eta ikusitakoa. 0. fasean konponduko dira, eta gida berriro pasatuko da 1. fasera igaro aurretik.
