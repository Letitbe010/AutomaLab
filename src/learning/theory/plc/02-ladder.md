---
id: plc-ladder
title: Ladder (KOP) — kontaktuak, bobinak eta markak
domain: plc
tags: [Ladder, KOP, kontaktua, bobina, set, reset, flankoa, marka, M0.0, segmentua]
related:
  theory: [plc-oinarriak, plc-tenporizadoreak, ep-autoatxikimendua, pn-funtzio-logikoak]
  templates: [tpl-plc-01, tpl-plc-02, tpl-plc-04]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 10.2 Lenguajes de programación (289. or.) eta 10.3 Representación en lenguaje de contactos, 292.–299. or.',
  ]
status: draft
---

## Kontzeptua

**Ladder** (gaztelaniaz *esquema de contactos*, Siemensen **KOP**) errele-eskema baten antzeko programazio-lengoaia grafikoa da. Programa **segmentutan** banatzen da. Segmentu bakoitzak ezkerreko errail batetik (korrontea) eskuineko errail batera doan bide bat du: kontaktuak ezkerrean eta bobinak eskuinean.

## Elementuak

| Elementua | Ikurra | Esanahia |
| --- | --- | --- |
| Kontaktu NA | ─┤ ├─ | Operandoa 1 bada, korrontea igarotzen da |
| Kontaktu NI | ─┤/├─ | Operandoa 0 bada, korrontea igarotzen da |
| Flanko positiboa | ─┤P├─ | Operandoa 0 → 1 aldatzen den scan-ean bakarrik |
| Flanko negatiboa | ─┤N├─ | Operandoa 1 → 0 aldatzen den scan-ean bakarrik |
| Bobina | ─( )─ | Operandoa = segmentuko korrontea |
| Set | ─(S)─ | Korrontea badago, operandoa 1 jarri (eta horrela utzi) |
| Reset | ─(R)─ | Korrontea badago, operandoa 0 jarri |

Logika: kontaktuak **seriean = AND**, **paraleloan = OR**, kontaktu NI = **NOT**.

## Markak (M)

**M0.0, M0.1…** barneko bitak dira: ez daude kableatuta. Memoria gisa erabiltzen dira (adib. «zikloa martxan»), errele laguntzaileen ordez.

## Autoatxikimendua Ladder-en

Errele-eskemaren itzulpen zuzena:

- 1. segmentua: (I0.1 «Martxa» **edo** M0.0) **eta** I0.0 «Geldialdia» → M0.0.
- 2. segmentua: M0.0 → Q0.0.

Beste aukera bat **Set/Reset** da: I0.1 → (S) M0.0; I0.0-ren NI kontaktua → (R) M0.0. Reset segmentua beherago badago, geldialdiak lehentasuna du (azkenak irabazten du).

## Ohiko akatsak

- Bobina bera bi segmentutan erabiltzea: azkenak bakarrik du eragina. Set/Reset erabili edo baldintzak segmentu bakarrean bildu.
- Flanko-kontaktu bat erabili beharrean kontaktu arrunt bat erabiltzea kontagailuetan edo bulkadetan: seinaleak scan askotan irauten du.
- Set bat Reset gabe uztea: irteera ez da inoiz itzaltzen.
- Kontaktu bat kableatutako kontaktuaren mota berekoa izan behar dela pentsatzea (ikus [PLCaren oinarriak](theory:plc-oinarriak): geldialdia NI kableatuta, NA kontaktua Ladder-en).
