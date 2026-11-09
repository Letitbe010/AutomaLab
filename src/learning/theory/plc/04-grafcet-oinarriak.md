---
id: gr-oinarriak
title: GRAFCET — elementuak eta bilakaera-arauak
domain: plc
tags: [GRAFCET, urratsa, etapa, trantsizioa, hartzailetasuna, ekintza, bilakaera, arauak, IEC 60848]
related:
  theory: [gr-dibergentziak, gr-ladder, plc-oinarriak]
  templates: [tpl-gr-01, tpl-gr-04, tpl-gr-05]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 10.4 GRAFCET (etapak, trantsizioak, ekintzak), 300.–301. or.',
    'J. Rodríguez, L. M. Cerdá, R. Bezos, Automatismos industriales, Paraninfo, 2014 — 10.13 Los diagramas de Grafcet (bilakaera-arauak), 328.–330. or.',
    'Bost arauen formulazioa eta bilaketa egonkorra: SPEC §6.6 (IEC 60848); arauaren testua ez dago Liburuak/ karpetan — berrikusteko',
  ]
status: draft
---

## Kontzeptua

**GRAFCET**-a automatismo sekuentzial baten portaera deskribatzeko eredu grafikoa da (IEC 60848). Urratsak eta trantsizioak txandakatzen dira, goitik behera.

| Elementua | Ikurra | Esanahia |
| --- | --- | --- |
| **Urratsa** | Karratua, zenbakiarekin | Sistemaren egoera bat. Aktibo edo inaktibo dago. |
| **Hasierako urratsa** | Karratu bikoitza | Aktibo dago abiaraztean. |
| **Trantsizioa** | Barra horizontala | Urrats batetik bestera igarotzeko aukera. |
| **Hartzailetasuna** | Trantsizioaren ondoko testua | Trantsizioa gainditzeko baldintza logikoa. |
| **Ekintza** | Urratsaren eskuineko laukia | Urratsa aktibo dagoenean egiten dena. |

## Bost bilakaera-arauak

1. **Hasierako egoera:** hasierako urratsak aktibo daude.
2. **Gainditze-baldintza:** trantsizio bat **gaituta** dago aurreko urrats guztiak aktibo badaude; **gainditu** egiten da gaituta badago eta hartzailetasuna egia bada.
3. **Gainditzea:** ondorengo urratsak aktibatzen dira eta aurrekoak desaktibatu, aldi berean.
4. **Aldiberekotasuna:** aldi berean gaindi daitezkeen trantsizio guztiak aldi berean gainditzen dira.
5. **Gatazka:** urrats bat aldi berean aktibatu eta desaktibatu behar bada, aktibo geratzen da.

## Ekintzak

- **N (jarraitua):** irteera aktibo dago urratsa aktibo dagoen bitartean.
- **C (baldintzatua):** urratsa aktibo dagoen bitartean eta baldintza egia bada.
- **S / R (memorizatua):** urratsa aktibatzean irteera 1ean jartzen da (S) edo 0an (R), eta horrela geratzen da.

Ekintzarik gabeko urratsak baliozkoak dira: itxaron-egoerak dira.

## Bilaketa egonkorra

Trantsizio bat gainditu ondoren hurrengoa ere egia bada, bilakaera scan berean jarraitzen du egoera egonkor batera iritsi arte. Bidean zeharkatutako urrats **iragankorren** ekintza jarraituak ez dira exekutatzen; memorizatuak, aldiz, bai.

## Ohiko akatsak

- Bi urrats trantsiziorik gabe lotzea, edo bi trantsizio urratsik gabe.
- Hasierako urratsik ez jartzea: GRAFCETa ez da inoiz abiarazten.
- Irteera bera ekintza jarraitu eta memorizatuekin idaztea.
- Hartzailetasun bat beti egia uztea (1) eta urrats iragankor bat sortzea konturatu gabe: bere ekintza jarraituak ez dira exekutatzen.
