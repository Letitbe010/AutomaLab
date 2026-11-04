# Egiaztatze-gida — 2a azpi-fasea: simulazio-motorra (1. maila, logikoa)

**Data:** 2026-11-04
**Git etiketa:** `fase-2a`

## Helburua

Simulazio-motor logikoa (SPEC §6.1–6.2) UIrik gabe dago eginda, eta testek egiaztatzen dute. **Azpi-fase honetan ez dago ezer berririk ikusteko nabigatzailean**: simulazioa pantailan 2c-n agertuko da (kontrolak, koloreak, animazioa). Egiaztapena testen bidez egiten da, eta gida honek zer frogatzen duten azaltzen du.

## Nola egiaztatu

Terminal berri batean, proiektuaren karpetan:

```
npm test
```

Espero da: `Test Files 13 passed`, `Tests 372 passed`.

Motorraren testak bakarrik ikusteko, izenekin:

```
npx vitest run tests/engine --reporter=verbose
```

## Zer frogatzen dute testek

| #   | Zirkuitua / kasua                                                         | Espero dena (testak egiaztatua)                                                                                 | Zuk berrikusi: zuzena da? |
| --- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------- |
| R1  | Eragin bakuneko zilindroa + 3/2 pultsadorea                               | Sakatu → 1A+ (1 s); askatu → 1A-. Erdian askatzean, malgukiak berehala itzultzen du.                            | ☐ Ondo / ☐ Gaizki         |
| R2  | Eragin bikoitzekoa + 5/2 biegonkorra, 14 eta 12 pilotajeak pultsadoreekin | Pultsu labur bakoitzak posizioa aldatzen du eta mantentzen du (memoria). Bi seinaleak batera: aurreko posizioa. | ☐ Ondo / ☐ Gaizki         |
| R3  | AND eta OR balbulak                                                       | Egia-taulak: AND presioan bi sarrerak presioan daudenean bakarrik; OR edozein sarrerarekin.                     | ☐ Ondo / ☐ Gaizki         |
| 4   | Antzezpen-balbula                                                         | 1 → 2 pasatzen da; 2 → 1 blokeatuta.                                                                            | ☐ Ondo / ☐ Gaizki         |
| 5   | Emari-erregulagailua irteeran (meter-out), faktorea 0,5                   | Ateratzea 2 s-tan (moteldua); sartzea 1 s-tan (antzezpenetik libre).                                            | ☐ Ondo / ☐ Gaizki         |
| 6   | 5/3 zentro itxia                                                          | Solenoidea askatzean zilindroa erdian geratzen da (ganberak BLOCKED).                                           | ☐ Ondo / ☐ Gaizki         |
| 7   | Tenporizadore pneumatikoa NI / NA                                         | Seinalea iritsi eta atzerapena igaro ondoren kommutatzen du; seinalea kentzean, berehala itzultzen da.          | ☐ Ondo / ☐ Gaizki         |
| 8   | Presio-sekuentzia balbula                                                 | Hornidura (6 bar) ≥ doikuntza bada bakarrik kommutatzen du.                                                     | ☐ Ondo / ☐ Gaizki         |
| 9   | Ihes azkarreko balbula                                                    | 1-etik zilindrora; 1 jaistean, zilindroa zuzenean ihesera.                                                      | ☐ Ondo / ☐ Gaizki         |
| 10  | Bere burua itzaltzen duen balbula (NA, irteera bere 10 pilotajera)        | «Oszilazioa» abisua.                                                                                            | ☐ Ondo / ☐ Gaizki         |
| 11  | Hornidura zuzenean atmosferara                                            | «Hornidura ihesera» abisua.                                                                                     | ☐ Ondo / ☐ Gaizki         |

## Proba-fitxategiak

R1, R2 eta R3 editorean ireki daitezke («Proiektuak» → «Inportatu proiektu bat»), zirkuituak ikusteko (simulaziorik gabe oraindik):

- `docs/egiaztapena/fitxategiak/r1-single-button.automalab.json`
- `docs/egiaztapena/fitxategiak/r2-double-bistable.automalab.json`
- `docs/egiaztapena/fitxategiak/r3-and-or.automalab.json`

## Aldaketa ikusgarri txiki bat

Balbulen ihes-portuak (3 eta 5) konektatu gabe uzten badira, atmosferara doaz (isilgailu batekin bezala), eta jada ez dute «portua ez dago konektatuta» abisurik ematen.

## Azpi-fase honetan EZ dagoena

- Simulazioa pantailan: ▶ ⏸ ⏭ kontrolak, presioaren koloreak, zilindroen animazioa, pultsadore klikagarriak (2c).
- Rodilloak zilindroari lotuta (2b): oraingoz testek eskuz «sakatzen» dituzte.
- 2. mailako simulazio fisikoa (9. fasea): 1. mailan presioak PRESSURE / EXHAUST / BLOCKED dira, ez balioak.
- Hutsa (ejektorea, bentosa) ez da oraindik modelatzen.
