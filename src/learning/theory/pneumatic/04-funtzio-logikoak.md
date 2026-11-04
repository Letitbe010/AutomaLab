---
id: pn-funtzio-logikoak
title: Funtzio logikoak — AND, OR, NOT eta memoria
domain: pneumatic
tags: [logika, AND, OR, NOT, memoria, bi presioko balbula, hautatzailea, bi eskuko agintea]
related:
  theory: [pn-balbulak, pn-kaskada]
  templates: [tpl-pn-02, tpl-pn-03, tpl-pn-05]
  exercises: []
  calculators: []
sources:
  [
    'A. Creus, Neumática e Hidráulica, Marcombo, 2007 — dispositivos lógicos (107–108. or.) eta 2.38 irudia (válvula de lanzadera)',
  ]
status: draft
---

## Kontzeptua

Pneumatikan, seinale bat **presioa dagoen (1) edo ez dagoen (0)** lerro bat da. Balbulekin elektronikako funtzio logiko berdinak egin daitezke: oinarrizkoak **AND**, **OR** eta **NOT** dira, eta **memoria** (biegonkorra) sekuentzien oinarria.

## AND (eta)

Irteeran presioa dago **bi sarreretan** presioa dagoenean bakarrik. Bi modutan egin daiteke:

1. **Bi 3/2 balbula seriean**: lehenengoaren irteerak bigarrena elikatzen du.
2. **Bi presioko balbula** (_válvula de simultaneidad_): X eta Y sarrerak eta 2 irteera. Irteera beti presio txikienarekin geratzen da.

![[symbol:pn.valve.and]]

| X   | Y   | 2   |
| --- | --- | --- |
| 0   | 0   | 0   |
| 1   | 0   | 0   |
| 0   | 1   | 0   |
| 1   | 1   | 1   |

Erabilera tipikoa: **bi eskuko agintea**, segurtasunagatik. Prentsa bat bi pultsadoreak sakatuta daudenean bakarrik jaisten da, eta horrela eskuak ez daude arrisku-eremuan.

## OR (edo)

Irteeran presioa dago **sarreretako batean** presioa dagoenean. **Balbula hautatzailea** (_lanzadera_) behar da: bola batek presiorik gabeko sarrera ixten du.

Zergatik ez nahikoa bi hodi T batekin lotzea? Pultsadore bat sakatzean, airea bestearen ihes-portutik (3) aterako litzateke, zilindroa elikatu beharrean. Hautatzaileak hori eragozten du.

![[symbol:pn.valve.or]]

| X   | Y   | 2   |
| --- | --- | --- |
| 0   | 0   | 0   |
| 1   | 0   | 1   |
| 0   | 1   | 1   |
| 1   | 1   | 1   |

Erabilera tipikoa: zilindro bat **bi lekutatik** agintzea.

## NOT (ez)

**3/2 NA balbula** batek seinalea alderantzikatzen du: eragin gabe, irteeran presioa dago; eragitean, ez.

## Memoria

**5/2 biegonkor** batek (14 eta 12 pilotajeak) azken pultsuaren posizioa gordetzen du, seinalea kendu ondoren ere. Horrela, pultsu labur batek zilindroa atera eta aterata mantentzen du, eta beste pultsu batek sartzen du. Sekuentzia-metodoen oinarria da.

![[symbol:pn.valve.5-2.pilot]]

## Ohiko akatsak

- **OR bat T soil batekin egitea** (airea beste balbularen ihesetik ateratzen da).
- **AND balbularen ordez bi pultsadore paraleloan jartzea** (orduan OR da).
- **Memoria biegonkorrean bi seinaleak aldi berean uztea**: ez da aldatzen.
