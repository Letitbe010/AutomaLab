---
id: pn-zilindro-indarra
title: Zilindroaren indarra eta aire-kontsumoa
domain: pneumatic
tags: [zilindroa, indarra, kontsumoa, errendimendua, enboloa, zurtoina]
related:
  theory: [pn-presioa, pn-balbulak]
  templates: []
  exercises: []
  calculators: [calc-cyl-force, calc-air-consumption]
sources:
  [
    'A. Creus, Neumática e Hidráulica, Marcombo, 2007 — 2.3.2.1 Fuerza del cilindro (28–29. or.) eta 2.3.2.3 Consumo de aire (36–37. or.)',
  ]
status: draft
---

## Kontzeptua

Zilindro batek aire konprimituaren presioa **indar lineal** bihurtzen du. Indarra presioaren eta presioak bultzatzen duen azaleraren araberakoa da:

- **Aurrera** (zurtoina ateratzean), airea enboloaren aurpegi osoan sartzen da: Ø D-ko zirkulua.
- **Atzera** (eragin bikoitzekoan), airea zurtoinaren aldeko ganberan sartzen da: azalera **koroa** da, zurtoinaren zatia kenduta. Horregatik, atzerako indarra txikiagoa da.
- **Eragin bakunekoan**, malgukiak itzultzen du zurtoina: aurrerako indarrari malgukiaren indarra kendu behar zaio.

Benetako indarra teorikoa baino txikiagoa da, **marruskadurarengatik** (juntak, gidak). Creus-en arabera, marruskadura kalkulatutako indarraren % 3–10 da. Hemen **errendimendu** gisa adierazten da: η ≈ 0,90–0,97. Ariketetan, kasurik txarrena hartzen da: **η = 0,9**.

![[symbol:pn.cyl.double]]

## Formulak

Aurrera eta atzera (p bar-etan, D eta d mm-tan, F N-tan):

$$F_{aurrera} = \frac{p \cdot \frac{\pi D^2}{4}}{10} \cdot \eta \qquad F_{atzera} = \frac{p \cdot \frac{\pi (D^2 - d^2)}{4}}{10} \cdot \eta$$

Eragin bakuneko zilindroa:

$$F_{aurrera} = \frac{p \cdot \frac{\pi D^2}{4}}{10} \cdot \eta - F_{malgukia}$$

**Aire-kontsumoa.** Ganbera bat betetzeko behar den aire «librea» (presio atmosferikoan neurtua, Nl) ganberaren bolumena bider **konpresio-erlazioa** da:

$$r = \frac{p + p_{atm}}{p_{atm}} \qquad p_{atm} = 1{,}013\ \text{bar}$$

$$V_{zikloa} = \left( \frac{\pi D^2}{4} + \frac{\pi (D^2 - d^2)}{4} \right) \cdot s \cdot r \qquad Q = V_{zikloa} \cdot n$$

s ibilbidea da eta n ziklo kopurua minutuko. Eragin bakunekoan, lehen batugaia bakarrik.

> **Oharra (iturria):** Creus-ek konpresio-erlazioa $\frac{0{,}987 + p}{0{,}987}$ gisa idazten du, eta eragin bikoitzekoan bi aldiz aurrerako bolumena hartzen du (zurtoina arbuiatuta). Hemen $p_{atm} = 1{,}013$ bar erabiltzen da, unitate koherenteekin; emaitzen aldea % 2 ingurukoa da 6–7 bar-etan.

## Adibide ebatzia

Eragin bikoitzeko zilindroa: **D = 32 mm, d = 12 mm, s = 100 mm, p = 6 bar, η = 0,9**.

1. Enboloaren azalera: $A = \pi \cdot 32^2 / 4 \approx 804{,}2\ \text{mm}^2$.
2. Koroaren azalera: $A' = \pi (32^2 - 12^2) / 4 \approx 691{,}2\ \text{mm}^2$.
3. Aurrerako indarra: $F = 6 \cdot 804{,}2 / 10 \cdot 0{,}9 \approx 434\ \text{N}$.
4. Atzerako indarra: $F = 6 \cdot 691{,}2 / 10 \cdot 0{,}9 \approx 373\ \text{N}$.
5. Konpresio-erlazioa: $r = (6 + 1{,}013) / 1{,}013 \approx 6{,}92$.
6. Aire librea ziklo bakoitzeko: $(804{,}2 + 691{,}2) \cdot 100\ \text{mm}^3 \cdot 6{,}92 \approx 1{,}04\ \text{Nl}$.
7. Minutuko 10 ziklo: $Q \approx 10{,}4\ \text{Nl/min}$.

## Ohiko akatsak

- **Atzerakoan zurtoinaren azalera ez kentzea.** Atzerako indarra beti txikiagoa da.
- **Eragin bakunekoan malgukia ahaztea**, bai indarrean bai atzera egiteko denboran.
- **Kontsumoan presio manometrikoa zuzenean erabiltzea** (p · V): konpresio-erlazioak presio atmosferikoa ere sartzen du.
- **Unitateak:** mm³ → l, zatitu 10⁶-rekin.
- **η bi aldiz aplikatzea** edo indar teorikoa benetakotzat hartzea zilindroa aukeratzean. Praktikan, karga-faktore bat ere gehitzen da (ikus fabrikatzailearen katalogoak).
