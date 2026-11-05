## Funtzionamendua

**Martxa / geldialdia autoatxikimenduarekin**: bulkada labur batekin makina martxan jartzen da, eta martxan geratzen da geldialdia sakatu arte.

- **1. bidea:** +24 V → [S0](comp:S0) (geldialdia, NI) → [S1](comp:S1) (martxa, NA) → [K1](comp:K1) bobina → 0 V.
- **Autoatxikimendua:** K1 kontaktu NA bat [S1](comp:S1)-en paraleloan. [K1](comp:K1) aktibatzean, kontaktu horrek bobina elikatzen jarraitzen du S1 askatu ondoren.
- **2. bidea:** K1 kontaktua → [Y1](comp:Y1): [1V1](comp:1V1) kommutatzen da eta [1A](comp:1A) ateratzen da.
- **3. bidea:** K1 kontaktua → [H1](comp:H1) argia: makina martxan dagoela adierazten du.
- [S0](comp:S0) sakatzean, K1-en elikadura eteten da: autoatxikimendua galtzen da, [Y1](comp:Y1) eta [H1](comp:H1) itzaltzen dira eta zilindroa itzultzen da.
- [0Z1](comp:0Z1) iturriak balbula elikatzen du.

**Geldialdiak lehentasuna du:** S0 eta S1 batera sakatuz gero, K1 ez da aktibatzen, S0 seriean baitago multzo osoarekin.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |
| [1V1](comp:1V1) | 5/2 elektrobalbula monoegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [S0](comp:S0) | Pultsadorea NI (11-12) | Geldialdia |
| [S1](comp:S1) | Pultsadorea NA (13-14) | Martxa |
| [K1](comp:K1) | Errelea, 3 kontaktu NA | Memoria (autoatxikimendua) |
| [Y1](comp:Y1) | Elektrobalbularen bobina | Zilindroa atera |
| [H1](comp:H1) | Pilotu-argia | «Martxan» seinalea |

![[symbol:el.button.nc]]

## Proba ezazu

1. Simulazioan, egin klik labur bat [S1](comp:S1)-en: makina martxan geratzen da eta [H1](comp:H1) pizten da.
2. Egin klik [S0](comp:S0)-n: dena gelditzen da.
3. Egin **Shift + klik** [S0](comp:S0)-n (sakatuta geratzen da) eta gero klik [S1](comp:S1)-en: ez da martxan jartzen. Askatu S0 klik arrunt batekin.

Zirkuitu honek Editex liburuko «realimentación» eskema jarraitzen du. Ikus [autoatxikimendua](theory:ep-autoatxikimendua).
