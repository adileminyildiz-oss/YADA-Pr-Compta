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
