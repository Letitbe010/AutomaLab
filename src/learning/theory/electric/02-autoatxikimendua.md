---
id: ep-autoatxikimendua
title: Autoatxikimendua — martxa eta geldialdia
domain: electric
tags: [autoatxikimendua, realimentación, martxa, geldialdia, memoria, lehentasuna, errelea]
related:
  theory: [ep-oinarriak, pn-funtzio-logikoak]
  templates: [tpl-ep-03, tpl-ep-05]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 6.3 Realimentación (6.16 irudia), 169.–170. or.',
    'A. Creus, Neumática e Hidráulica, Marcombo, 2007 — 7.3, 7.15 irudia (contacto de autoretención), 348. or.',
  ]
status: draft
---

## Kontzeptua

Pultsadore batek bere kontaktua sakatuta dagoen bitartean bakarrik ixten du. Makina bat martxan uzteko pultsadorea askatu ondoren, errelearen kontaktu NA bat jartzen da **martxa-pultsadorearen paraleloan**: errelea aktibatzean, bere kontaktuak bobina elikatzen jarraitzen du. Horri **autoatxikimendua** esaten zaio (gaztelaniaz *realimentación* edo *autorretención*).

Errelea desaktibatzeko, **geldialdi-pultsadore NI** bat jartzen da **seriean**, multzo paraleloaren aurretik: sakatzean bobinaren elikadura eteten da, autoatxikimenduko kontaktua irekitzen da eta errelea geldirik geratzen da.

![[symbol:el.relay.no]]

## Zirkuitua

1. **1. bidea:** +24 V → S0 (geldialdia, NI) → S1 (martxa, NA) → K1 bobina → 0 V.
2. **Autoatxikimendua:** K1 kontaktu NA, S1-en paraleloan.
3. **2. bidea:** +24 V → K1 kontaktu NA → Y1 (elektrobalbula) edo H1 (argia) → 0 V.

## Geldialdiaren lehentasuna

Zirkuitu honetan, S0 eta S1 batera sakatuz gero, **errelea ez da aktibatzen**: S0 seriean dago multzo osoarekin. Hori da **geldialdiaren lehentasuna**, eta segurtasunagatik ohikoena.

Martxaren lehentasuna lortzeko, S0 autoatxikimenduko adarrean bakarrik jartzen da (K1 kontaktuarekin seriean), eta S1 zuzenean bobinara: S1 sakatuta dagoen bitartean, S0-k ezin du errelea gelditu. Gutxitan erabiltzen da.

## Segurtasuna

Elikadura eteten bada, errelea desaktibatzen da. Elikadura itzultzean, makina **ez da bere kabuz abiarazten**: martxa berriro sakatu behar da. Etengailu soil batekin, aldiz, makina berehala abiaraziko litzateke, eta hori arriskutsua izan daiteke.

## Ohiko akatsak

- Geldialdi-pultsadore bat **NA** jartzea: ezin du ezer gelditu (eta etengailua hautsiz gero, ez da konturatzen).
- Autoatxikimenduko kontaktua S0-ren aurretik paraleloan jartzea: geldialdiak ez du funtzionatzen.
- Autoatxikimenduko kontaktuaren ordez errelearen **NI** kontaktu bat erabiltzea.
- Geldialdi-pultsadoreak lehentasunik ez duela ez konturatzea, S0 eta S1 batera probatu gabe.
