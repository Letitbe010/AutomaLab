---
id: plc-tenporizadoreak
title: Tenporizadoreak eta kontagailuak (IEC)
domain: plc
tags: [tenporizadorea, TON, TOF, TP, kontagailua, CTU, CTD, IEC, PT, ET, PV, CV]
related:
  theory: [plc-ladder, plc-oinarriak]
  templates: [tpl-plc-03]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 10.1 Zonas de memoria (temporizadores T, contadores C), 288. or.; 10.3, temporizadores eta contadores, 294.–297. or.',
    'IEC 61131-3 tenporizadore eta kontagailu estandarrak (TON, TOF, TP, CTU, CTD; IN, PT, Q, ET, PV, CV), S7-1200an bezala — arauaren testua ez dago Liburuak/ karpetan: berrikusteko',
  ]
status: draft
---

## Kontzeptua

PLC modernoek **IEC** tenporizadore eta kontagailuak erabiltzen dituzte, **kutxa** gisa Ladder-en. Bakoitzak **instantzia-izen** bat du (AutomaLab-en T1, C1…; TIA Portalen instantzia-DB bat), eta bere irteera beste segmentu batean kontaktu gisa erabil daiteke: **T1.Q**, **C1.Q**.

## Tenporizadoreak

Sarrerak eta irteerak: **IN** (abiarazi), **PT** (denbora programatua), **Q** (irteera), **ET** (igarotako denbora).

| Mota | Portaera |
| --- | --- |
| **TON** (konexio-atzerapena) | IN 1 denetik PT igarotzean, Q = 1. IN 0 bada, Q = 0 eta ET = 0 berehala. |
| **TOF** (deskonexio-atzerapena) | IN 1 bada, Q = 1. IN 0 bihurtzean, Q-k PT denboraz jarraitzen du 1ean. |
| **TP** (pultsua) | IN-ren flanko positiboan, Q = 1 PT denboraz, IN-ren iraupena edozein dela ere. |

Adibidea: zilindroa 3 s aurrean geratzeko, 1B2 sentsorea → TON (PT = 3 s) → T1.Q → Y2 (itzuli).

## Kontagailuak

| Mota | Portaera |
| --- | --- |
| **CTU** (gorakoa) | CU-ren flanko positibo bakoitzean CV + 1. R = 1 → CV = 0. Q = (CV ≥ PV). |
| **CTD** (beherakoa) | CD-ren flanko positibo bakoitzean CV − 1. LD = 1 → CV = PV. Q = (CV ≤ 0). |

Kontagailuek **flankoak** zenbatzen dituzte: seinale batek scan askotan irauten badu ere, behin bakarrik zenbatzen da.

## Ohiko akatsak

- TON bat IN etengabe aktibo ez dagoen seinale batekin erabiltzea (adib. pultsadore baten bulkada): ez da inoiz iristen PT-ra. TP edo autoatxikimendu bat behar da.
- Tenporizadorearen irteera (T1.Q) eta IN sarrera nahastea.
- Kontagailu bat inoiz ez berrabiaraztea (R): Q 1ean geratzen da betiko.
- PT unitate okerrean idaztea (ms / s).
