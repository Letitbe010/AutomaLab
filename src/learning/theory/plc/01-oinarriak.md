---
id: plc-oinarriak
title: PLCa — sarrerak, irteerak eta scan-zikloa
domain: plc
tags: [PLC, automata programagarria, S7-1200, scan, zikloa, sarrera, irteera, I0.0, Q0.0, kableatzea]
related:
  theory: [plc-ladder, plc-tenporizadoreak, ep-autoatxikimendua]
  templates: [tpl-plc-01, tpl-plc-04]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 9. unitatea: El autómata programable, 256.–280. or.; 10.1 Zonas de memoria de un autómata programable, 288. or.',
    'Siemens S7-1200 (CPU 1214C DC/DC/DC: 14 sarrera / 10 irteera digital) eta scan-zikloaren deskribapena: fabrikatzailearen dokumentazio orokorra; Liburuak/ karpetan ez dago — berrikusteko',
  ]
status: draft
---

## Kontzeptua

**PLCa** (automata programagarria) errele-logika ordezkatzen duen ordenagailu industriala da. Sakagailuak eta sentsoreak bere **sarreretara** kableatzen dira, eta bobinak eta argiak bere **irteeretara**. Logika ez dago kableatuta: **programa** batean dago (Ladder, GRAFCET…), eta kablerik ukitu gabe alda daiteke.

AutomaLab-en, **S7-1200 CPU 1214C** baten sarrera eta irteera digitalak erabiltzen dira:

| Sarrerak | Irteerak | Markak |
| --- | --- | --- |
| I0.0 … I0.7, I1.0 … I1.5 (14) | Q0.0 … Q0.7, Q1.0, Q1.1 (10) | M0.0, M0.1… (barneko bitak) |

Helbide bat **byte.bit** da: `I0.3` = 0. sarrera-byteko 3. bita.

## Kableatzea

- **Sarrera** bat «1» da bere bornean +24 V daudenean: +24 V → S1 → I0.0.
- **Irteera** aktibo batek +24 V ematen ditu: Q0.0 → Y1 → 0 V.
- I/O taulan, helbide bakoitzari **izen sinbolikoa** eta iruzkina ematen zaizkio (adib. `I0.1 "Martxa"`), programa irakurgarria izan dadin.

## Scan-zikloa

PLCak programa behin eta berriz exekutatzen du, ziklo batean:

1. **Sarrerak irakurri** eta sarrera-irudian gorde.
2. **Programa exekutatu**, segmentuz segmentu, goitik behera eta ezkerretik eskuinera.
3. **Irteerak idatzi**, irteera-irudiaren arabera.

Ziklo batek milisegundo gutxi irauten du (AutomaLab-en, lehenetsia 10 ms). Scan batean zehar, sarreren balioa ez da aldatzen. Erreleekin ez bezala, segmentuak **ordenan** exekutatzen dira, eta ordenak eragina izan dezake (adib. bobina bera bi segmentutan idazten bada, azkenak irabazten du).

AutomaLab-en, simulazioa pausatu eta **«Scan bat»** sakatuz, programa scan-ez scan ikus daiteke.

## Geldialdia NI kableatuta

Segurtasunagatik, geldialdi-pultsadorea **NI** kableatzen da: kablea hautsiz gero, sarrera 0 bihurtzen da eta makina gelditzen da. Horregatik, atsedenean sarrera **1** da, eta Ladder-en **NA kontaktu** batekin irakurtzen da: sakatzean 0 bihurtzen da eta korrontea eteten du.

## Ohiko akatsak

- Geldialdia NI kableatu eta Ladder-en NI kontaktu batekin irakurtzea: makina ez da inoiz abiarazten.
- Irteera bat bi segmentutan idaztea (bobina bikoitza): azken segmentuak bakarrik du eragina.
- Sarrerak eta irteerak nahastea: bobina batek ezin du sarrera bat (I) idatzi.
- I/O taula ez betetzea: programa ulertezina bihurtzen da.
