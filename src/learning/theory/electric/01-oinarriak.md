---
id: ep-oinarriak
title: Kontrol elektrikoaren oinarriak (24 V DC)
domain: electric
tags: [elektropneumatika, eskema elektrikoa, kontaktua, NA, NI, errelea, elektrobalbula, bobina, 13-14, A1-A2]
related:
  theory: [ep-autoatxikimendua, ep-sentsoreak, pn-balbulak]
  templates: [tpl-ep-01, tpl-ep-02]
  exercises: []
  calculators: []
sources:
  [
    'J. C. Martín, M. P. García, Automatismos industriales, Editex — 5. unitatea: el contactor eta relé auxiliar (5.12 irudia, A1-A2, 13-14, 21-22), 136.–141. or.; 6. unitatea: símbolos eta representación de esquemas, 164.–169. or.',
    'A. Creus, Neumática e Hidráulica, Marcombo, 2007 — 2.35 irudia (válvulas de solenoide) eta 7.3 Circuitos electroneumáticos, 346.–347. or.',
  ]
status: draft
---

## Kontzeptua

Zirkuitu **elektropneumatiko** batean, indar-zatia pneumatikoa da (zilindroak, balbulak) eta aginte-zatia **elektrikoa** (pultsadoreak, erreleak, sentsoreak). Bien arteko lotura **elektrobalbula** da: bere bobinak (Y1, Y2…) tentsioa jasotzean, balbula kommutatzen da.

Aginte-zirkuitua tentsio txikian elikatzen da, normalean **24 V DC**: segurua da eta sentsore eta PLC industrialen tentsio estandarra.

![[symbol:pn.valve.5-2.sol-spring]]

## Eskema elektrikoaren irudikapena

- Bi lerro horizontal: **+24 V goian** eta **0 V behean**.
- Bien artean, **korronte-bide bertikalak**, ezkerretik eskuinera zenbakituta (1, 2, 3…).
- Bide bakoitzean, goian kontaktuak (aginteak eta baldintzak) eta behean **karga** bakarra (bobina, argia).
- Elementuak **atsedeneko egoeran** marrazten dira: inor sakatu gabe eta bobinak tentsiorik gabe.

## Kontaktuak

| Mota | Atsedenean | Eraginda | Bornak |
| --- | --- | --- | --- |
| **NA** (normalean irekia) | irekita | itxita | 13-14 |
| **NI** (normalean itxia) | itxita | irekita | 21-22 (pultsadoreetan 11-12) |

Bornen **lehen zifrak** kontaktuaren ordena adierazten du (1, 2, 3…), eta **bigarrenak** mota: 3-4 = NA, 1-2 = NI.

![[symbol:el.button.no]]

## Errelea

Errele batek **bobina** bat (bornak **A1-A2**) eta **kontaktu** bat edo gehiago ditu. Bobinak tentsioa jasotzean, kontaktu guztiak aldi berean aldatzen dira: NAk ixten dira eta NIak irekitzen. Eskeman, bobina eta bere kontaktuak **izen beraren** bidez lotzen dira (K1), nahiz eta korronte-bide desberdinetan egon.

Erabilerak:

- seinale bat **biderkatzea** (pultsadore bakarrak hainbat kontaktu eragitea);
- **logika** egitea (AND = kontaktuak seriean, OR = paraleloan, NOT = NI kontaktua);
- **memoria** (autoatxikimendua: ikus [autoatxikimendua](theory:ep-autoatxikimendua)).

![[symbol:el.relay.coil]]

## Elektrobalbulak

- **Monoegonkorra** (bobina bat + malgukia): bobinak tentsioa duen bitartean bakarrik eragiten du. Seinalea mantendu behar da.
- **Biegonkorra** (bi bobina, Y1/Y2): bulkada labur bat nahikoa da, eta balbulak posizioa gordetzen du. Ez dira inoiz bi bobinak batera aktibatu behar.

AutomaLab-en, balbulak bere bobinaren izena du propietateetan (adib. «Bobina (ezkerra, 14)»: **Y1**), eta eskema elektrikoko Y1 bobinak eragiten dio.

## Izendapena

Liburu eta klaseetako konbentzio ohikoa: **S** aginte-elementuak (S1 martxa, S0 geldialdia), **K** erreleak, **Y** elektrobalbulen bobinak, **H** argiak, **B** sentsoreak (1B1, 1B2). Creus-ek eta beste liburu batzuek amaiera-sentsoreentzat **a0/a1, b0/b1** ere erabiltzen dute.

## Ohiko akatsak

- Bobina bat bi kontaktu-bideren artean marraztea, karga gabe +24 V eta 0 V lotzen dituen bide bat utziz: **zirkuitulaburra**.
- Errelearen kontaktuari bobinaren izen bera ez jartzea: kontaktua ez da inoiz aldatuko.
- Elektrobalbula biegonkor baten bi bobinak aldi berean aktibatzea: balbulak aurreko posizioa gordetzen du eta sekuentzia blokeatzen da.
- Elementuak eraginda marraztea (adib. sentsore bat itxita), atsedeneko egoeraren ordez.
