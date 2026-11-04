## Funtzionamendua

**Bi eskuko agintea**: zilindroa bi pultsadoreak **batera** sakatuta bakarrik ateratzen da. Langilearen bi eskuak arriskugunetik kanpo daudela bermatzeko erabiltzen da.

- [1V2](comp:1V2) **bi presioko balbula** da (AND funtzioa): 2 irteeran seinalea dago X eta Y sarreretan presioa dagoenean bakarrik.
- [1S1](comp:1S1) X sarrerara eta [1S2](comp:1S2) Y sarrerara konektatuta daude.
- [1V2](comp:1V2)-ren irteerak [1V1](comp:1V1) balbula monoegonkorraren 14 pilotajea aktibatzen du: [1A](comp:1A) ateratzen da.
- Pultsadore bat askatzen den unean, AND seinalea desagertzen da, malgukiak [1V1](comp:1V1) atsedenera itzultzen du eta zilindroa itzultzen da.
- [0Z1](comp:0Z1) iturriak balbula nagusia eta bi pultsadoreak elikatzen ditu.

## Osagaiak

| Etiketa         | Osagaia                                         | Zeregina          |
| --------------- | ----------------------------------------------- | ----------------- |
| [0Z1](comp:0Z1) | Aire-iturria (6 bar)                            | Hornidura         |
| [1S1](comp:1S1) | 3/2 balbula NI, pultsadorea                     | Ezkerreko eskua   |
| [1S2](comp:1S2) | 3/2 balbula NI, pultsadorea                     | Eskuineko eskua   |
| [1V2](comp:1V2) | Bi presioko balbula (AND)                       | Funtzio logikoa   |
| [1V1](comp:1V1) | 5/2 balbula monoegonkorra, pilotajea / malgukia | Balbula nagusia   |
| [1A](comp:1A)   | Eragin bikoitzeko zilindroa                     | Eragingailua      |

![[symbol:pn.valve.and]]

## Proba ezazu

1. Simulazioan, egin **Shift + klik** [1S1](comp:1S1)-en: sakatuta geratzen da, baina zilindroa ez da mugitzen.
2. Egin Shift + klik [1S2](comp:1S2)-n ere: bi pultsadoreak sakatuta, zilindroa ateratzen da.
3. Egin klik arrunt bat bietako batean, askatzeko: zilindroa berehala itzultzen da.

Kontuz: industriako bi eskuko segurtasun-moduluek bi seinaleak denbora-tarte labur batean iristea ere eskatzen dute (aldiberekotasuna); zirkuitu didaktiko honek ez du hori egiaztatzen. Ikus [funtzio logikoak](theory:pn-funtzio-logikoak).
