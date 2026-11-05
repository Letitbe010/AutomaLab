## Funtzionamendua

Pultsadoreak ez du elektrobalbula zuzenean elikatzen: **errele** bat aktibatzen du, eta errelearen kontaktuak elikatzen du bobina.

- **1. bidea:** +24 V → [S1](comp:S1) → [K1](comp:K1) bobina (A1-A2) → 0 V.
- **2. bidea:** +24 V → K1 kontaktu NA (13-14) → [Y1](comp:Y1) → 0 V.
- [S1](comp:S1) sakatzean, [K1](comp:K1) aktibatzen da eta bere kontaktu guztiak aldatzen dira: 2. bideko NA kontaktua ixten da, [Y1](comp:Y1)-ek tentsioa jasotzen du eta [1V1](comp:1V1) kommutatzen da. [1A](comp:1A) ateratzen da.
- [0Z1](comp:0Z1) iturriak balbula elikatzen du.

Bobina eta kontaktuak **izen beraren** bidez lotzen dira (K1), nahiz eta bide desberdinetan egon. Zirkuitu honek ez du memoriarik: S1 askatzean, dena atsedenera itzultzen da.

## Osagaiak

| Etiketa | Osagaia | Zeregina |
| --- | --- | --- |
| [0Z1](comp:0Z1) | Aire-iturria | Hornidura |
| [1V1](comp:1V1) | 5/2 elektrobalbula monoegonkorra | Balbula nagusia |
| [1A](comp:1A) | Eragin bikoitzeko zilindroa | Eragingailua |
| [S1](comp:S1) | Pultsadorea NA | Agindua |
| [K1](comp:K1) | Errelearen bobina | Seinalea biderkatu / logika |
| [Y1](comp:Y1) | Elektrobalbularen bobina | Aginte elektrikoa → pneumatikoa |

![[symbol:el.relay.coil]]

## Proba ezazu

1. Simulazioan, sakatu eta mantendu [S1](comp:S1): lehenik [K1](comp:K1) aktibatzen da, gero kontaktua ixten da eta [Y1](comp:Y1) aktibatzen da.
2. Askatu: dena itzaltzen da eta zilindroa itzultzen da.
3. Pentsatu: nola egin zilindroa aurrean gera dadin [S1](comp:S1) askatu ondoren? Ikus [autoatxikimendua](theory:ep-autoatxikimendua).
