## Egoera

Errele bidezko martxa/geldialdi bat PLC batekin ordezkatu behar da. Pultsadoreak eta elektrobalbularen bobina PLCari kableatzen zaizkio, eta logika Ladder-en programatzen da.

## Eskakizunak

1. **S1** (martxa, NA) bulkada labur batekin, zilindroa ateratzen da eta aurrean geratzen da.
2. **S0** (geldialdia, NI kableatuta) sakatuta, zilindroa itzultzen da.
3. S0 eta S1 batera sakatuta, zilindroa **ez da** ateratzen (geldialdiaren lehentasuna).
4. PLC bat erabili behar da (CPU 1214C), eta logika **Ladder** fitxan programatu.

## Etiketak (derrigorrezkoak)

| Etiketa | Osagaia |
| --- | --- |
| **1A** | Eragin bikoitzeko zilindroa |
| **S1** | Martxa-pultsadorea (NA) |
| **S0** | Geldialdi-pultsadorea (NI) |
| Y1 | Elektrobalbularen bobina |

## Oharrak

- Gomendatutako I/O taula: I0.0 «Geldialdia», I0.1 «Martxa», Q0.0 «Atera», M0.0 «Memoria».
- Gogoratu: S0 NI kableatuta badago, I0.0 = 1 da atsedenean.
