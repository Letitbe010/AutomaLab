## Funtzionamendua

Bi zilindroren **A+ B+ B− A−** sekuentzia. Sekuentzia horretan seinaleak gainjartzen dira: adibidez, B− egin behar denean [b1](comp:b1) oraindik sakatuta dago eta B+ agintzen jarraitzen du. **Kaskada-metodoak** sekuentzia bi taldetan banatzen du, eta une bakoitzean talde bakar bati ematen dio airea:

- **I. taldea:** A+ B+ — **II. taldea:** B− A−.
- [0V1](comp:0V1) 5/2 biegonkorra da **kaskadaren memoria**: 4 irteerak I. lerroa elikatzen du eta 2 irteerak II. lerroa. Atsedenean II. lerroak du airea.

Zikloa, urratsez urrats:

1. [0S1](comp:0S1) (hasiera) sakatzean, II. lerrotik eta [a0](comp:a0) bidez (A atzean dago) seinalea iristen da [0V1](comp:0V1)-ren 14 pilotajera: **I. taldea** aktibatzen da.
2. I. lerroak [1V1](comp:1V1)-en 14 pilotajea aktibatzen du: [1A](comp:1A) ateratzen da (**A+**).
3. [1A](comp:1A) aurrera iristean, [a1](comp:a1) sakatzen du: I. lerrotik [2V1](comp:2V1)-en 14 pilotajera, eta [2A](comp:2A) ateratzen da (**B+**).
4. [2A](comp:2A) aurrera iristean, [b1](comp:b1) sakatzen du: [0V1](comp:0V1)-ren 12 pilotajea; **II. taldea** aktibatzen da eta I. lerroa ihesera geratzen da.
5. II. lerroak [2V1](comp:2V1)-en 12 pilotajea aktibatzen du: [2A](comp:2A) itzultzen da (**B−**).
6. [2A](comp:2A) atzean, [b0](comp:b0) sakatzen du: [1V1](comp:1V1)-en 12 pilotajea, eta [1A](comp:1A) itzultzen da (**A−**). Zirkuitua hasierako egoeran dago.

[0Z1](comp:0Z1) iturriak memoria eta bi balbula nagusiak elikatzen ditu; rodilloak taldeen lerroetatik elikatzen dira.

## Osagaiak

| Etiketa         | Osagaia                         | Zeregina                          |
| --------------- | ------------------------------- | --------------------------------- |
| [0Z1](comp:0Z1) | Aire-iturria (6 bar)            | Hornidura                         |
| [0S1](comp:0S1) | 3/2 balbula NI, pultsadorea     | Hasiera (II. lerroan)             |
| [0V1](comp:0V1) | 5/2 biegonkorra, pilotajea      | Kaskadaren memoria (I/II taldeak) |
| [1V1](comp:1V1) | 5/2 biegonkorra, pilotajea      | A zilindroaren balbula            |
| [2V1](comp:2V1) | 5/2 biegonkorra, pilotajea      | B zilindroaren balbula            |
| [a0](comp:a0)   | 3/2 rodilloa, A atzean          | A− amaituta (hasierarekin seriean) |
| [a1](comp:a1)   | 3/2 rodilloa, A aurrean         | A+ amaituta → B+                  |
| [b0](comp:b0)   | 3/2 rodilloa, B atzean          | B− amaituta → A−                  |
| [b1](comp:b1)   | 3/2 rodilloa, B aurrean         | B+ amaituta → II. taldea          |
| [1A](comp:1A)   | Eragin bikoitzeko zilindroa (A) | Eragingailua                      |
| [2A](comp:2A)   | Eragin bikoitzeko zilindroa (B) | Eragingailua                      |

## Proba ezazu

1. Simulazioan, egin klik [0S1](comp:0S1)-en: ziklo oso bat egiten da, eta espazio-fase diagraman lau mugimenduak ikusten dira.
2. Sakatu [0S1](comp:0S1) zikloaren erdian: ez du ezer egiten, II. lerroak ez baitu airerik I. taldea aktibo dagoen bitartean.
3. Pentsatu: zer gertatuko litzateke [a1](comp:a1) zuzenean iturrira konektatuta egongo balitz, I. lerrora beharrean?

Zirkuitu hau Creus-en kaskada-adibidearen egitura berekoa da (7.10 irudia). Ikus [kaskada-metodoa](theory:pn-kaskada).
