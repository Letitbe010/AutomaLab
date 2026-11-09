---
id: gr-ladder
title: GRAFCETetik Ladder-era — Set/Reset metodoa
domain: plc
tags: [GRAFCET, Ladder, bihurketa, Set, Reset, marka, urratsa, trantsizioa]
related:
  theory: [gr-oinarriak, plc-ladder]
  templates: [tpl-gr-05]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 10.4: GRAFCETa kontaktu-lengoaiara eramatea (hasierako etaparen aktibazioa SET bobina batekin, 10.47 irudia), 304.–307. or.',
  ]
status: draft
---

## Kontzeptua

PLC askok ez dute GRAFCETa zuzenean exekutatzen, edo Ladder-en programatu behar da. **Set/Reset metodoak** GRAFCET bat modu sistematikoan bihurtzen du: urrats bakoitza **M marka** bat da, eta trantsizio bakoitzak aurreko marka desaktibatu eta hurrengoa aktibatzen du.

## AutomaLab-en bihurketa

Sortutako segmentuak ordena honetan daude:

1. **Ekintza memorizatuak** (S/R), urratsaren gorako flankoarekin.
2. **Hasierako egoera:** lehen scan-ean, hasierako urratsen markak Set.
3. **Tenporizadoreak:** `t/X3/2s` bakoitzarentzat TON bat.
4. **Trantsizioak:** aurreko urratsen markak ETA hartzailetasuna → trantsizioaren marka.
5. **Reset guztiak**, eta gero **Set guztiak**.
6. **Ekintza jarraituak:** urratsen markak (EDO) → irteera.

## Zergatik bi fasetan

Trantsizio guztiak lehenik ebaluatzen dira, eta gero aldatzen dira urratsak. Horrela, aldi berean gaindi daitezkeen trantsizioak batera gainditzen dira (4. araua). Reset guztiak Set guztien aurretik doazenez, aldi berean desaktibatu eta aktibatu behar den urratsa aktibo geratzen da (5. araua).

## Interpretatzailearekiko aldea

GRAFCET interpretatzaileak **bilaketa egonkorra** egiten du scan bakoitzean. Bihurtutako Ladder-ak trantsizio-urrats bat egiten du scan bakoitzean, eta urrats iragankor bat scan batez aktibo egoten da: bere ekintza jarraituak une batez ikus daitezke. Sekuentzia arruntetan emaitza bera da.

## Ohiko akatsak

- Trantsizio baten barruan Set eta Reset segmentu berean jartzea, eta hurrengo trantsizioa scan berean gainditzea nahi gabe.
- Ekintza jarraitu bat urrats bakoitzean bobina bereizi batekin idaztea: azken segmentuak irabazten du. Urrats guztiak segmentu bakarrean paraleloan jarri behar dira.
- Hasierako urratsa aktibatzeko markarik ez jartzea.
