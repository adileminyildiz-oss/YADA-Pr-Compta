# REGLES-COMPTABLES.md — Charte comptable de YADA / Précompta

> **Rôle de ce fichier.** Il consigne les **règles comptables inviolables** du logiciel YADA / Précompta.
> Ces règles constituent des **lignes rouges à ne jamais franchir** : toute demande faite dans la session
> « Y - Logiciel » (ou toute modification du code) doit **respecter chacune de ces règles** pour préserver
> l'**harmonie comptable** du logiciel.
>
> Ce fichier est la **source de vérité comptable**. En cas de conflit entre une demande et une règle ci-dessous,
> **la règle l'emporte** — la demande doit être adaptée, jamais la règle contournée.
>
> La source de vérité **technique** reste `precompta.html` (un seul fichier) ; ce document en est le **garde-fou comptable**.

---

## Comment lire ce document

- Chaque règle porte un **numéro stable** (RC-001, RC-002, …) — on ne renumérote jamais.
- Chaque règle comporte : un **énoncé**, sa **portée**, et — quand c'est utile — un **exemple chiffré** et des **implications techniques**.
- Une règle peut être **précisée** par la suite (ajout d'exemples/cas), mais son **esprit ne change pas**.

---

## RC-001 — Toutes les écritures sont traitées et prises en compte, quelle que soit leur origine

**Énoncé.**
**Toutes les écritures présentes dans le logiciel doivent être traitées et prises en compte**, quelle que soit leur **provenance** :

- **Import FEC** (Fichier des Écritures Comptables) ;
- **Saisie manuelle** (éditeur d'écritures, journaux, saisie banque, O.D., etc.) ;
- **Scan / OCR** (factures, relevés, bulletins déposés puis reconnus automatiquement).

**Portée.** L'origine d'une écriture **n'est jamais un motif d'exclusion**. Tout module qui lit, calcule, agrège,
totalise, édite ou déclare doit se baser sur **l'ensemble des écritures** (`db.ecritures`), et non sur un
sous-ensemble lié à une source (ex. `db.factures` seules, `db.docs` seuls, `db.reglements` seuls).

**Ce que cela implique (lignes rouges).**
- Aucun calcul comptable (TVA, balances, grand-livre, bilan, compte de résultat, journaux, analytique,
  suivi des règlements, tiers, immobilisations, banque, tableau de bord…) ne doit **ignorer** les écritures
  issues du **FEC** ou du **scan/OCR** au prétexte qu'elles n'ont pas de « facture logiciel » (`db.factures`/`db.docs`) associée.
- Les montants, la TVA, les soldes de tiers et les totaux doivent **concorder** avec la totalité des écritures,
  quelle que soit la manière dont elles sont entrées.
- Un dossier alimenté **uniquement par FEC** (sans aucune facture saisie dans le logiciel) doit afficher des
  résultats **complets et justes** dans **tous** les modules.

**Exemple.**
Un dossier importé par FEC contient 59 écritures de vente (journal VTE) mais **aucune** `db.facture`.
Le Module TVA, le suivi des factures, l'analytique et les balances clients doivent néanmoins **prendre en
compte ces 59 écritures** (TVA collectée, CA, soldes clients…) — comme si elles avaient été saisies dans le logiciel.

**Références d'implémentation existantes (cohérentes avec cette règle).**
Cette règle est déjà le fil conducteur de nombreuses mises à jour : v236 (balances tiers sur écritures),
v242 (TVA sur toutes les écritures), v256/v260 (analytique sur écritures), v264/v270 (règlements depuis
les écritures FEC), v266 (correspondances factures FEC), v288 (tous les modules suivent l'exercice traité),
v369 (immobilisations & paie dérivées des écritures). **Toute évolution future doit préserver ce comportement.**

---

## RC-002 — Structure naturelle des écritures : 3 lignes (HA/VT), 2 lignes (Banque)

**Énoncé.**
Chaque écriture présente une **structure de lignes standard selon son journal**.

### a) Journaux d'Achats (HA / ACH) et de Ventes (VT / VTE) → **3 lignes**

Dans l'ordre naturel :

1. **1ʳᵉ ligne — compte de TIERS** (fournisseur `401…` pour un achat, client `411…` pour une vente) → porte le **TTC** ;
2. **2ᵉ ligne — compte de TVA** (déductible `4456…` pour un achat, collectée `4457…` pour une vente) → porte la **TVA** ;
3. **3ᵉ ligne — compte de CHARGE (classe 6, achat) ou de PRODUIT (classe 7, vente)** → porte le **HT**.

L'écriture est **équilibrée** : TTC (tiers) = TVA + HT (contrepartie).

**Exemple — Achat (journal HA), fournisseur, TTC 120 € / TVA 20 % :**

| Ligne | Compte | Libellé | Débit | Crédit |
|------|--------|---------|------:|------:|
| 1 | `401XXXXXX` (tiers) | Fournisseur | | 120,00 |
| 2 | `445660000` (TVA déductible) | TVA | 20,00 | |
| 3 | `606…`/`607…` (charge) | Achat HT | 100,00 | |

**Exemple — Vente (journal VT), client, TTC 240 € / TVA 20 % :**

| Ligne | Compte | Libellé | Débit | Crédit |
|------|--------|---------|------:|------:|
| 1 | `411XXXXXX` (tiers) | Client | 240,00 | |
| 2 | `445710000` (TVA collectée) | TVA | | 40,00 |
| 3 | `706…`/`707…` (produit) | Vente HT | | 200,00 |

### b) Journal de BANQUE (BQ) → **2 lignes**

1. **1ʳᵉ ligne — compte de TIERS *ou* compte de CHARGES**, selon le lettrage :
   - **compte de TIERS** (`401…` / `411…`) **si la facture est parvenue et qu'un lettrage est possible**
     (le mouvement bancaire solde une facture existante) ;
   - **compte de CHARGES** (classe 6) **si aucune facture ne peut lettrer l'écriture**.
   - Le choix se **détermine au moment du lettrage** : tant qu'une facture rapprochable existe, on est sur le
     compte de tiers ; à défaut, on impute directement au compte de charges.
2. **2ᵉ ligne — compte BANQUE** : `512000000`.

L'écriture de banque est **équilibrée** sur ces 2 lignes (le sens 512 débit/crédit détermine Entrant/Sortant, cf. RC à venir).

### c) Comptes de banque multiples

S'il existe **plusieurs comptes bancaires**, on **crée un compte 512 dédié par banque**, en **incrémentant** :

- 1ʳᵉ banque → **`512000000`** ;
- 2ᵉ banque → **`512000100`** (assermenté / assigné à la deuxième banque) ;
- banques suivantes → **même logique d'incrémentation** (`512000200`, `512000300`, …).

Chaque mouvement bancaire est imputé sur **le compte 512 de la banque concernée** (jamais un 512 « générique » qui mélangerait les banques).

**Portée & lignes rouges.**
- La génération d'écritures HA/VT doit produire **ces 3 lignes** dans **cet ordre** (tiers / TVA / charge-produit).
- La génération/saisie d'écritures de banque doit produire **exactement 2 lignes** (contrepartie tiers-ou-charge + 512),
  jamais une 3ᵉ ligne parasite.
- Le compte de banque est **512 par établissement** (incrément `…000`, `…100`, `…200`…) ; ne jamais fusionner
  plusieurs banques sous un même 512.
- Le passage **tiers ↔ charges** en 1ʳᵉ ligne de banque est piloté par la **possibilité de lettrage** avec une facture existante.

**Note.** Les écritures multi-lignes légitimes (ex. facture ventilée sur plusieurs comptes de charges/produits, ou
plusieurs taux de TVA) restent possibles : la règle décrit la **structure naturelle par défaut** ; elle interdit les
lignes **parasites** et fixe l'**ordre** et le **rôle** de chaque ligne.

---

## RC-003 — Séparation des écritures : ligne bleue + différenciation par le SOLDE et le COMPTE DE TIERS

**Énoncé.**
Les écritures doivent être **visuellement distinguées** les unes des autres, et leur **délimitation** (savoir où une
écriture se termine et où la suivante commence) repose **uniquement** sur des critères **comptables**, jamais cosmétiques.

### a) Ligne bleue de séparation

**Entre chaque écriture, une ligne bleue doit apparaître** pour distinguer les écritures. Elle marque la frontière
entre deux écritures partout où des écritures sont listées (Consultation / grand-livre, éditeur d'écritures, journal
comptable, journaux imprimables…).

### b) La frontière = le SOLDE (équilibre atteint)

Une écriture est **complète (soldée)** dès que **Σ débit = Σ crédit** sur les lignes accumulées. Ce **solde** marque
la **fin de l'écriture** :

- une écriture peut être **à 2 lignes** (ex. banque) **ou à 3 lignes** (ex. HA/VT) — voir RC-002 ;
- **dès qu'un solde apparaît**, l'écriture est bouclée → la **ligne bleue** est posée → la ligne suivante démarre
  **une nouvelle écriture**.

### c) La différenciation se fait par le SOLDE et le COMPTE DE TIERS — jamais par le libellé ni la date

Pour regrouper des lignes en écritures (notamment à la lecture d'un FEC, d'un flux de lignes ou dans l'éditeur), on
**ne se base ni sur le libellé ni sur la date**. On se base sur :

1. **le solde** (équilibre Σ débit = Σ crédit, cf. b) ; **et**
2. **le compte de tiers** : dans une écriture, un **compte de tiers n'apparaît qu'UNE seule fois**. **Une deuxième
   occurrence** d'un compte de tiers **appartient à une autre écriture** → elle **ouvre l'écriture suivante**.

> Autrement dit : deux lignes de tiers (deux `401…`/`411…` distincts, ou le même compte de tiers rencontré une 2ᵉ fois)
> ne peuvent pas coexister dans une même écriture — la 2ᵉ marque une nouvelle écriture.

### d) Notification du solde

**Si un solde apparaît dans une écriture, il doit être notifié** (l'équilibre atteint est signalé à l'utilisateur).
La ligne bleue de (a) est le repère visuel de ce solde ; l'état « soldé / non soldé » de l'écriture est rendu explicite.

**Portée & lignes rouges.**
- Une **ligne bleue** sépare **chaque** écriture, partout où les écritures sont affichées.
- Le **découpage des lignes en écritures** est piloté par **le solde** (équilibre) **et** **l'unicité du compte de tiers**
  dans l'écriture — **jamais** par le libellé ou la date.
- Un **compte de tiers** ne figure **qu'une fois** par écriture ; sa **réapparition** déclenche une **nouvelle écriture**.
- L'**atteinte du solde** doit être **notifiée**.

**Exemple.**
Flux de lignes : `[401DUPON (C 120) · 4456 (D 20) · 606 (D 100)]  [401DUPON (C 60) · 4456 (D 10) · 606 (D 50)]`.
Le premier bloc solde à 120 = 120 **et** le compte de tiers `401DUPON` réapparaît ensuite → **deux écritures distinctes**,
séparées par une **ligne bleue**, même si le libellé et la date sont identiques.

**Références d'implémentation existantes (cohérentes avec cette règle).**
Ligne bleue entre écritures : v205 (journal comptable), v207 (grand-livre / consultation), séparateurs
`sgj-ecr-sep` / `lx-ecr-sep`. Notification du solde et ligne rouge « non soldée » : v216, v261, v267.
**Toute évolution future doit préserver ce comportement.**

---
