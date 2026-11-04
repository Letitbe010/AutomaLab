---
id: pn-presioa
title: Presioa eta unitateak
domain: pneumatic
tags: [presioa, unitateak, bar, pascal, manometroa]
related:
  theory: [pn-zilindro-indarra]
  templates: []
  exercises: []
  calculators: []
sources:
  ['A. Creus, Neumática e Hidráulica, Marcombo, 2007 — 1.1 (9–11. or.) eta 2.3.2.1 (28. or.)']
status: draft
---

## Kontzeptua

**Presioa** azalera-unitate bakoitzean eragiten duen indarra da. Aire konprimitua ontzi itxi batean (hodi bat, zilindro baten ganbera) dagoenean, presio berak bultzatzen ditu horma guztiak, norabide guztietan berdin: hori da **Pascalen printzipioa**. Horregatik, zilindro batean enboloaren azalera osoak presio bera jasotzen du, eta indarra azaleraren araberakoa da.

Bi eratara neur daiteke presioa:

- **Presio manometrikoa** (erlatiboa): atmosferarekiko aldea. Manometroek hau erakusten dute, eta pneumatikan beti hau erabiltzen da: «6 bar» esaten denean, 6 bar manometriko dira.
- **Presio absolutua**: hutsarekiko. Aire-kontsumoa kalkulatzeko behar da, airea atmosferatik hartzen baita.

Ikurrak:

![[symbol:pn.gauge]] ![[symbol:pn.source]]

## Formulak

$$p = \frac{F}{A}$$

$$p_{abs} = p_{man} + p_{atm} \qquad p_{atm} \approx 1{,}013\ \text{bar}$$

| Unitatea | Baliokidea                                  |
| -------- | ------------------------------------------- |
| 1 bar    | 100 000 Pa = 0,1 MPa = 0,1 N/mm² = 10 N/cm² |
| 1 bar    | ≈ 1,02 kgf/cm² ≈ 0,987 atm ≈ 14,5 psi       |
| 1 Pa     | 1 N/m²                                      |

Praktikan, presioa **bar**-etan eta azalera **mm²**-tan hartzen dira. 1 bar = 0,1 N/mm² denez:

$$F\,[\text{N}] = \frac{p\,[\text{bar}] \cdot A\,[\text{mm}^2]}{10}$$

## Adibide ebatzia

Sare pneumatikoko manometroak **6 bar** adierazten ditu.

1. Pascaletan: $6 \cdot 100\,000 = 600\,000\ \text{Pa} = 0{,}6\ \text{MPa}$.
2. Presio absolutua: $6 + 1{,}013 = 7{,}013\ \text{bar}$.
3. Ø 32 mm-ko enbolo baten gainean (A ≈ 804 mm²), indar teorikoa: $F = 6 \cdot 804 / 10 \approx 483\ \text{N}$ (marruskadurarik gabe; ikus [Zilindroaren indarra eta aire-kontsumoa](theory:pn-zilindro-indarra)).

## Ohiko akatsak

- **Manometrikoa eta absolutua nahastea.** Indarra kalkulatzeko presio manometrikoa erabiltzen da; kontsumorako, absolutua (konpresio-erlazioa).
- **Unitateak nahastea:** bar × m² edo Pa × mm² ez dira zuzenean N. Erabili beti formula praktikoa (bar, mm², /10) edo dena SIra pasatu.
- **«Presio handiagoa = abiadura handiagoa» pentsatzea.** Abiadura emariak (eta erregulazioak) mugatzen du batez ere; presioak indarra.
