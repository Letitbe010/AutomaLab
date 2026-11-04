---
id: pn-balbulak
title: Balbula banatzaileak — nomenklatura eta eragingailuak
domain: pneumatic
tags: [balbula, banatzailea, bideak, posizioak, portuak, eragingailuak, 3/2, 5/2, 5/3]
related:
  theory: [pn-funtzio-logikoak, pn-zilindro-indarra]
  templates: [tpl-pn-01, tpl-pn-02, tpl-pn-03, tpl-pn-04]
  exercises: []
  calculators: []
sources:
  [
    'A. Creus, Neumática e Hidráulica, Marcombo, 2007 — 2.3 Válvulas distribuidoras eta 2.5 taula (52–53. or.); 8.2 eranskina, ikurrak (367–373. or.)',
    'ISO 1219-1 (ikurrak) eta ISO 5599-3 (portuen zenbakiak)',
  ]
status: draft
---

## Kontzeptua

**Balbula banatzaileek** airearen bidea erabakitzen dute: nora doan presioa eta nondik ihes egiten duen. Ikurrean:

- **Lauki bakoitza posizio bat** da. Laukien kopurua = posizio kopurua.
- Lauki baten barruan, **geziek** bide irekiak erakusten dituzte, eta **T** ikurrek portu itxiak.
- **Bide kopurua** = konexio (portu) kopurua, ihesak barne.
- **Atsedeneko posizioa** portuei lotuta marrazten den laukia da (normalean, malgukiaren aldekoa).

Izena «**bideak/posizioak**» da: 3/2 = 3 bide, 2 posizio; 5/2 = 5 bide, 2 posizio; 5/3 = 5 bide, 3 posizio.

![[symbol:pn.valve.3-2.button-spring]]

## Portuen zenbakiak

| Zenbakia | Funtzioa                                         |
| -------- | ------------------------------------------------ |
| 1        | Elikadura (presioa)                              |
| 2, 4     | Lana (zilindrora)                                |
| 3, 5     | Ihesa                                            |
| 12, 14   | Pilotajea: 14-k 1 → 4 konektatzen du; 12-k 1 → 2 |

Pilotaje-portuaren zenbakiak zein bide irekitzen duen esaten du: «14» = 1 eta 4 konektatzen ditu.

## Normalean itxia (NI) eta normalean irekia (NA)

3/2 balbula batean:

- **NI**: atsedenean 1 itxita dago eta 2 ihesera (3). Eragitean, 1 → 2.
- **NA**: atsedenean 1 → 2 irekita. Eragitean, 1 itxi eta 2 ihesera.

## Eragingailuak

Ezkerreko eragingailuak ezkerreko laukia jartzen du portuetan; eskuinekoak, eskuinekoa.

| Mota        | Adibideak                                                     |
| ----------- | ------------------------------------------------------------- |
| Eskuzkoa    | pultsadorea, palanka, pedala                                  |
| Mekanikoa   | rodilloa, rodillo abatigarria (norabide bakarrekoa), malgukia |
| Pneumatikoa | pilotajea (12, 14)                                            |
| Elektrikoa  | solenoidea (elektrobalbula)                                   |

- **Monoegonkorra**: eragingailua alde batean eta malgukia bestean. Seinalea kentzean, atsedenera itzultzen da.
- **Biegonkorra** (memoria): eragingailua bi aldeetan (adib. 14 eta 12 pilotajeak). Azken seinalearen posizioan geratzen da. Kontuz: bi seinaleak aldi berean badaude, ez da aldatzen (**seinale iraunkorra**, ikus [Espazio-fase diagrama eta kaskada-metodoa](theory:pn-kaskada)).

![[symbol:pn.valve.5-2.pilot]]

## 5/3 balbulen erdiko posizioa

Malgukiek erdiko posizioan zentratzen dute. Erdiko laukiak zehazten du zer gertatzen den seinalerik ez dagoenean:

- **Zentro itxia**: portu guztiak itxita. Zilindroa geldirik geratzen da, aire harrapatuarekin.
- **Zentroa ihesera**: 2 eta 4 ihesera. Zilindroa libre geratzen da (eskuz mugi daiteke).
- **Zentroa presioan**: 1 → 2 eta 1 → 4. Bi ganberak presioan.

![[symbol:pn.valve.5-3c.sol]]

## Ohiko akatsak

- **Bide kopurua eta posizio kopurua nahastea** («5/2» ≠ «2/5»).
- **Atsedeneko laukia gaizki aukeratzea** eskeman: portuak malgukiaren aldeko laukiari lotzen zaizkio.
- **12 eta 14 trukatzea**: 14-k 1 → 4 konektatzen du.
- **Biegonkorra monoegonkortzat hartzea**: biegonkor batek ez du bere kabuz itzultzen.
