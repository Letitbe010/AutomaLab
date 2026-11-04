---
id: pn-kaskada
title: Espazio-fase diagrama eta kaskada-metodoa
domain: pneumatic
tags: [sekuentzia, espazio-fase, gainjartzea, kaskada, taldeak, memoria, a0, a1]
related:
  theory: [pn-funtzio-logikoak, pn-balbulak]
  templates: [tpl-pn-05]
  exercises: []
  calculators: []
sources:
  [
    'A. Creus, Neumática e Hidráulica, Marcombo, 2007 — 7.2.1 método intuitivo eta 7.2.6.2 Método de cascada (7.10 irudia, A+ B+ B- A-)',
  ]
status: draft
---

## Kontzeptua eta notazioa

- Zilindroak **A, B, C…** (eskeman 1A, 2A…). Mugimenduak: **A+** (atera), **A−** (sartu).
- Amaiera-balbulak (rodilloak): **a0** = A sartuta, **a1** = A aterata; b0, b1… AutomaLab-en automatikoki izendatzen dira rodilloa zilindro bati lotzean.
- Sekuentzia bat mugimenduen zerrenda da: **A+ B+ B− A−**.

## Espazio-fase diagrama

Zilindro bakoitzeko lerro bat: ardatz horizontalean **urratsak** (faseak), bertikalean **posizioa** (0 sartuta, 1 aterata). Sekuentzia ikusteko eta seinaleen arazoak aurkitzeko erabiltzen da. AutomaLab-en simulazioak zuzenean marrazten du, «Espazio-fase diagrama» fitxan.

A+ B+ B− A− sekuentziarako:

| Urratsa | 1   | 2   | 3   | 4   | 5 (= 1) |
| ------- | --- | --- | --- | --- | ------- |
| A       | 0   | 1   | 1   | 1   | 0       |
| B       | 0   | 0   | 1   | 0   | 0       |

## Seinale-gainjartzea

Balbula biegonkor batek ezin du posizioz aldatu kontrako aldean seinalea **iraunkorra** den bitartean. Rodilloak zuzenean konektatzen badira (metodo intuitiboa):

- **1. urratsa (A+)**: 1V1-en 12 aldeak b0 jasotzen du (B sartuta dago, beraz b0 sakatuta) → martxa sakatzean, 14 eta 12 biak presioan → **ez da aldatzen**.
- **3. urratsa (B−)**: 2V1-en 14 aldeak a1 jasotzen du (A aterata jarraitzen du) → b1-ek 12 bidaltzean, biak presioan → **blokeatuta**.

Irtenbideak: rodillo abatigarriak (pultsu laburrak), edo seinalea moztu behar ez denean elikatzen duen metodo sistematiko bat: **kaskada** edo **urratsez urrats**.

## Kaskada-metodoa

1. Sekuentzia **taldetan** zatitu, talde batean letra bera bi aldiz egon gabe, eta talde kopurua ahalik eta txikiena: A+ B+ | B− A− → **I = {A+, B+}**, **II = {B−, A−}**.
2. **Presio-lerro** bat talde bakoitzeko (I, II). Une bakoitzean lerro bakar bat dago presioan.
3. **Memoria-balbulak** = talde kopurua − 1. Bi taldetarako, 5/2 biegonkor bat: 4 portua = I. lerroa, 2 portua = II. lerroa.
4. Talde bateko **lehen mugimendua** lerrotik zuzenean agintzen da. Hurrengoak, aurreko mugimenduaren amaiera-balbulatik, lerro horretatik elikatuta.
5. Talde bateko **azken amaiera-balbulak** memoria hurrengo taldera aldatzen du.
6. **Martxa** pultsadorea azken taldearen azken amaiera-balbularekin seriean jartzen da.

A+ B+ B− A− kasurako:

- I. lerroa → 1V1:14 (**A+**); I → a1 → 2V1:14 (**B+**); I → b1 → memoria:12 (**II. taldera**).
- II. lerroa → 2V1:12 (**B−**); II → b0 → 1V1:12 (**A−**); II → martxa → a0 → memoria:14 (**I. taldera**).

Lerro bakoitza bakarrik dagoenez presioan, aurreko taldeko seinaleak ihesera doaz, eta gainjartzeak desagertzen dira.

![[symbol:pn.valve.5-2.pilot]] ![[symbol:pn.valve.3-2.roller-spring]]

## Ohiko akatsak

- **Taldeak gaizki egitea** (letra bera talde berean: A+ … A−).
- **Martxa amaiera-balbularik gabe** jartzea: zikloaren erdian sakatzean, sekuentzia nahasten da.
- **Amaiera-balbulak hornidura nagusitik elikatzea**, ez taldearen lerrotik: gainjartzeak itzultzen dira.
- **Memoria-balbulen kopurua**: taldeak − 1, ez taldeak.
