---
id: ep-sentsoreak
title: Amaiera-etengailuak eta sentsore magnetikoak
domain: electric
tags: [sentsorea, amaiera-etengailua, reed, magnetikoa, induktiboa, detektagailua, 1B1, 1B2]
related:
  theory: [ep-oinarriak, pn-kaskada]
  templates: [tpl-ep-04, tpl-ep-05]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 5. unitatea: detectores (inductivos, capacitivos, fotoeléctricos; B ikurra), 145.–148. or.',
    'A. Creus, Neumática e Hidráulica, Marcombo, 2007 — 7.3 Circuitos electroneumáticos: «detectores magnéticos o de palanca y rodillo», 347. or.',
  ]
status: draft
---

## Kontzeptua

Sekuentzia automatiko batean, aginte-zirkuituak jakin behar du zilindro bakoitza **non dagoen**. Horretarako, ibilbidearen muturretan **sentsoreak** jartzen dira. Sentsorearen kontaktua ixten da zilindroa posizio horretara iristean.

## Motak

- **Amaiera-etengailu mekanikoa** (palanka eta rodilloa): zurtoinak edo leva batek fisikoki sakatzen du. Merkea eta sendoa da, baina higatu egiten da.
- **Sentsore magnetikoa (reed)**: zilindroaren gorputzean muntatzen da, eta **enboloko imanak** eragiten dio, kontakturik gabe. Oso ohikoa da zilindro pneumatikoetan.
- **Induktiboak, kapazitiboak, fotoelektrikoak**: piezak edo metala detektatzeko (AutomaLab-en geroago).

![[symbol:el.reed]]

![[symbol:el.limit.no]]

## Izendapena eta kokapena

- Sentsore bakoitzak zilindroaren zenbakia eta posizioa adierazten ditu: **1B1** = 1A atzean (−), **1B2** = 1A aurrean (+); **2B1** / **2B2** 2A zilindroarentzat. Creus-ek eta beste liburu batzuek **a0 / a1**, **b0 / b1** erabiltzen dute.
- Eskema elektrikoan, sentsorearen kontaktua bere korronte-bidean marrazten da; eskema pneumatikoan, marka bat zilindroaren ondoan, izenarekin.
- AutomaLab-en: hautatu sentsorea eta, propietateetan, aukeratu **zilindroa** eta **posizioa** (− / +). Etiketa automatikoki jartzen da.

## Sentsoreen erabilera sekuentzietan

Mugimendu bakoitza aurreko mugimenduaren **amaierako sentsoreak** agintzen du. Adibidez, A+ B+ A− B− sekuentzian: B+ ← 1B2 (A aurrean), A− ← 2B2, B− ← 1B1, eta A+ ← martxa eta 2B1. Sekuentziak **seinale-gainjartzea** badu (adib. A+ B+ B− A−), memoria bat behar da: erreleak edo kaskada ([kaskada-metodoa](theory:pn-kaskada)).

## Ohiko akatsak

- Sentsorea zilindroaren posizio okerrean jartzea (+ / −): sekuentzia ez da hasten edo blokeatu egiten da.
- Sentsore bat **itxita** marraztea atsedenean, zilindroa posizio horretan ez dagoenean.
- Elektrobalbula monoegonkor bat sentsore batekin bakarrik agintzea: zilindroa sentsorea askatu bezain laster itzultzen da.
