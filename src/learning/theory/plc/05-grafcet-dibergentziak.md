---
id: gr-dibergentziak
title: GRAFCET — dibergentziak, hartzailetasunak eta denbora
domain: plc
tags: [GRAFCET, dibergentzia, konbergentzia, OR, AND, hartzailetasuna, flankoa, denbora, jauzia]
related:
  theory: [gr-oinarriak, gr-ladder]
  templates: [tpl-gr-02, tpl-gr-03, tpl-gr-04]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 10.4 GRAFCET (sekuentzia linealak, aukerazkoak eta aldiberekoak), 301.–303. or.',
    'J. Rodríguez, L. M. Cerdá, R. Bezos, Automatismos industriales, Paraninfo, 2014 — 10.13.4 Las estructuras, 329. or.',
    'Hartzailetasunen idazkera: AutomaLab-en erabakia (2026-11-09), IEC 60848-n oinarrituta — klasekoarekin egiaztatzeko',
  ]
status: draft
---

## Kontzeptua

Sekuentzia bat ez da beti lineala. GRAFCETek bi egitura ditu bideak banatzeko eta biltzeko: bat **hautatzeko (OR)** eta bestea **paraleloan exekutatzeko (AND)**.

## OR dibergentzia eta konbergentzia

Urrats baten ondoren **trantsizio bat baino gehiago** daude, eta bakoitzak bide bat hasten du. Barra **sinplez** marrazten da. Bide bat bakarrik hautatu nahi bada, hartzailetasunek **elkar baztertu** behar dute: bestela, 4. arauaren arabera, biak batera gaindituko lirateke.

Adibidea: `Bat * A_atzean` eta `Bi * /Bat * A_atzean`.

## AND dibergentzia eta konbergentzia

**Trantsizio bakar batek** hainbat urrats aktibatzen ditu aldi berean. Barra **bikoitzez** marrazten da. Adar bakoitzak bere erritmoan egiten du aurrera. Konbergentzian, trantsizioa **aurreko urrats guztiak aktibo** daudenean bakarrik gaindi daiteke; horregatik, adar bakoitzaren amaieran **itxaron-urrats** bat jartzen da.

## Hartzailetasunen idazkera

| Idazkera | Esanahia | Erakusten da |
| --- | --- | --- |
| `a * b` | ETA | a · b |
| `a + b` | EDO | a + b |
| `/a` | EZ | a goi-marrarekin |
| `^a` | Gorako flankoa | ↑a |
| `_a` | Beherako flankoa | ↓a |
| `X3` | 3. urratsa aktibo dago | X3 |
| `t/X3/2s` | X3 aktibatu zenetik 2 s igaro dira | t/X3/2s |
| `1` | Beti egia | 1 |

Izenak helbideak (`I0.1`) edo I/O taulako izenak (`Martxa`) izan daitezke. Hartzailetasunetan, kableatzea kontuan hartu: NI kableatutako geldialdia 1 da atsedenean.

## Denbora

`t/X3/2s` X3 aktibatzen denetik neurtzen da. Urratsa uztean berrabiarazten da. PLCaren TON tenporizadorearen baliokidea da, GRAFCET barruan idatzita.

## Atzera-jauziak

Sekuentziak errepikatzeko, azken trantsizioa hasierako urratsari lotzen zaio. Lerroa gora doanean, gezi batekin adierazten da noranzkoa.

## Ohiko akatsak

- OR dibergentzia batean hartzailetasunak ez baztertzea: bi bideak batera aktibatzen dira.
- AND konbergentzian itxaron-urratsik ez jartzea.
- OR barra eta AND barra bikoitza nahastea.
- Pultsadore bat flankorik gabe hainbat trantsiziotan erabiltzea: bilaketa egonkorrak urrats asko zeharka ditzake scan bakarrean.
