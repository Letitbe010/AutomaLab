# Egiaztatze-gida — 3c azpi-fasea: galdetegiak eta «Nire aurrerapena»

**Data:** 2026-11-04
**Git etiketak:** `fase-3c`, `mvp-1`

## Helburua

Txantiloi bakoitzak bere galdetegia du (SPEC §8.6). Galdera-motak hauek dira: aukera bakarra, egia/gezurra, zenbakizkoa eta **iragarri** (_predict_). _Iragarri_ motako galderetan, erantzun ondoren, simulazioak erakusten du zer gertatzen den benetan. Galdetegia **ikasketa-moduan** egiten da: galdera bakoitzaren ondoren zuzenketa, azalpena eta teoria-esteka agertzen dira. Emaitzak «Nire aurrerapena» atalean gordetzen dira (IndexedDB), eta «Esportatu dena» babeskopian sartzen dira.

Edukia (25 galdera) **zirriborroa** da, txantiloiak eta teoria-fitxak bezala.

## Nola abiarazi

- Webean: <https://letitbe010.github.io/AutomaLab/>.
- Edo ordenagailuan: klik bikoitza `AutomaLab.cmd`.

## Probak

| #   | Egin                                                                                                        | Espero da                                                                                                                    | Emaitza           |
| --- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Txantiloiak → «Zeharkako agintea memoriarekin» → Ireki → panelean **Galdetegia** fitxa                      | Sarrera-testua (5 galdera), «Nahastu» aukera eta «Hasi galdetegia» botoia.                                                   | ☐ Ondo / ☐ Gaizki |
| 2   | Hasi. 1. galdera (Iragarri): aukeratu erantzun bat → **Egiaztatu**                                          | Zuzena/okerra (✓ / ✗ ikurrekin, ez kolorez bakarrik), «Simulazioaren emaitza: 1A+», azalpena eta teoria-esteka.              | ☐ Ondo / ☐ Gaizki |
| 3   | Zenbakizko galderan idatzi `433,5` (koma hamartarrarekin)                                                   | Zuzentzat hartzen du (434 N ± % 2). Erantzun zuzena eta tolerantzia erakusten ditu.                                          | ☐ Ondo / ☐ Gaizki |
| 4   | Galdetegian zehar, aldatu «Azalpena» fitxara eta itzuli                                                     | Galdetegia ez da galtzen; galdera berean jarraitzen du.                                                                      | ☐ Ondo / ☐ Gaizki |
| 5   | Amaitu galdetegia                                                                                           | Puntuazioa (%), «x / 5 zuzen» eta gaizki erantzundakoak azalpenekin eta teoria-estekekin. «Berriro egin».                    | ☐ Ondo / ☐ Gaizki |
| 6   | Menua → **Nire aurrerapena**                                                                                | Domeinuaren barra (pneumatika), txantiloien taula (irekita, onena, azkena, saiakerak), galdera-moten asmatze-tasa.           | ☐ Ondo / ☐ Gaizki |
| 7   | Teoria → ireki fitxa bat → itzuli «Nire aurrerapena»-ra                                                     | Fitxa «irakurrita» gisa agertzen da (Teoria · 1/5).                                                                          | ☐ Ondo / ☐ Gaizki |
| 8   | Freskatu orria (F5) eta begiratu aurrerapena berriro                                                        | Datuak mantentzen dira.                                                                                                      | ☐ Ondo / ☐ Gaizki |
| 9   | Txantiloien katalogoa                                                                                       | Egindako galdetegiek «Onena: x %» erakusten dute txartelean.                                                                 | ☐ Ondo / ☐ Gaizki |
| 10  | Proiektuak → «Esportatu dena»; beste nabigatzaile/profil batean «Inportatu dena»                            | Aurrerapena ere berreskuratzen da. Inportatzeak ez du ezer galtzen: puntuazio onenak mantentzen dira (bateratu egiten dira). | ☐ Ondo / ☐ Gaizki |
| 11  | **Egin 5 galdetegiak** eta zuzendu edukia (galderen argitasuna, aukera okerren sinesgarritasuna, azalpenak) | Zuzenketak bidali; berrikusitakoan «reviewed» gisa markatuko dira.                                                           | ☐ Ondo / ☐ Gaizki |

## Edukiaren bermeak (testak)

- _Iragarri_ galdera bakoitza motorrarekin simulatzen da, eta erantzun zuzenak simulazioaren emaitzarekin bat egin behar du (`verifyBySimulation`). Aukera bakoitzak gertaera-sekuentzia desberdin bat du.
- Zenbakizko erantzunak (konpresio-erlazioa, indarra, aire-kontsumoa) `calculators/` funtzio berekin egiaztatzen dira.
- Formula guztiak errorerik gabe errendatzen dira, eta teoria-esteka guztiak existitzen dira.

## Azpi-fase honetan EZ dagoena

- Azterketa-modua eta denbora-neurgailua, ausazko galdetegia (txantiloi askotako galderak), errepasoa: SPEC-en arabera gerorako.
- `multiple`, `identify` eta `order` galdera-motak.
- Ariketen aurrerapena (ariketak geroko fasean).

## 🏁 MVP 1 muga

3. fasea osatuta dago. Arauaren arabera hemen **gelditzen naiz**. Hurrengo pausoak:

1. Erabili aplikazioa denbora batez (SPEC: 1–2 aste), klasean ere bai, ahal bada.
1. Pasatu [berrikuspenak.md](../berrikuspenak.md) zerrenda (1a–3c gidak eta 16 erabaki tekniko).
1. Idatzi zure iritzia `docs/mvp1-iritzia.md` fitxategian: zuzenketak, lehentasunak, falta dena. Fitxategi hori irakurri ondoren egokituko dut MVP 2ko plana (elektropneumatika eta S7-1200 PLCa).
