# CAHIER DES CHARGES — YADA · demandes du 07/07/2026, triées par session

> **Rien ne se perd** : chaque demande ci‑dessous est affectée à SA session (cf. `ROADMAP.md`).
> Les demandes marquées **[RÈGLE]** sont des règles de gestion/comptabilité : elles doivent être
> **fixées par la session transverse « Règles comptables »** (registre `REGLES-COMPTABLES.md`)
> puis implémentées par la session du module concerné, **avec validation Règles avant merge**.
> Marques : ✅ fait · ⏳ à faire · 🌐 nécessite le réseau/une API.

---

## 0 · Fait immédiatement par la session générale (v409 — non comptable, UI/navigation)

- ✅ **Design — transition de page discrète** : « un balayement invisible qui fait classe » —
  fondu très léger + balayage quasi invisible (fini l'effet voyant).
- ✅ **Barre latérale — libellés** : plus de MAJUSCULES entières (TIERS → Tiers), suppression
  des parenthèses et de leur contenu (Paramétrage (réglages) → Paramétrage, Module TVA (CA3) →
  Module TVA, Éditions (…) → Éditions, Rapprochement (lettrage) → Rapprochement,
  Sociétés (portefeuille) → Sociétés).
- ✅ **Comptabilité — retraits** : sous‑modules **Banque (512)**, **Saisie journal Banque** et
  **Assistant IA** retirés de la barre latérale (le Rapprochement reste).
- ✅ **Import/Export FEC** déplacé de Comptabilité → **Permanent** (sous‑module).
- ✅ **Pilotage** : sous‑module **Suivi des règlements** ajouté.
- ✅ **Permanent — Paramétrage** : renommé (sans « (réglages) ») + carte
  **« Synchronisation multi‑appareils (Pantry) » supprimée** de l'affichage.
- ✅ **Permanent — Société & création** : renommé **« Sociétés »**.

### Complément v410 (revue « éléments non pris en compte »)
- ✅ **Pilotage ÉPURÉ** : onglets Impôts (IS/IR), Actif/Passif et Agenda & RH **supprimés** —
  seul « Pilotage » reste (liens vers Analytique / Suivi des règlements / Tableau de bord ;
  la refonte gestion complète reste au §5, IS/IR renaîtra dans Déclarations §2).
- ✅ **Consultation des comptes** : le module **s'ouvre plein écran** ; le carré ▢/▣
  **agrandit à tout l'écran** ; la **croix ✕** et le bouton **─** sont **retirés** de la barre.
- ✅ **Éditions — aperçu A4** : l'aperçu à l'écran s'affiche au **format A4** (210×297 mm) ;
  l'impression était déjà en A4 (`@page size:A4`). *(La règle R4 reste à consigner au registre.)*
- ✅ **RH / Salarié — brut ↔ net** : saisir le **brut** complète automatiquement le **net**
  (et inversement), dans la fiche (`sf-brut`/`sf-net`) et l'onglet Salaires (ratio indicatif
  net = brut × 0,78 du module).
- ✅ **Barre latérale — majuscules en milieu de libellé** retirées : « Analyse — centre de
  contrôle », « Charges et paie », « Immobilisations & financement(s) ».

---

## 1 · SESSION RÈGLES (transverse) — règles à fixer au registre

- ⏳ **[RÈGLE R1 — Exercice]** La **période d'exercice du module Analyse** gouverne TOUS les
  outils de saisie. L'année **N+1 (ex. 2026)** n'est traitable **que** si elle est activée via
  les **flèches d'exercice** au‑dessus de la page Analyse. Sinon, aucun module ne peut saisir
  ou traiter des éléments de N+1. (S'applique à tous les dossiers.)
- ⏳ **[RÈGLE R2 — Unicité des tiers]** Chaque facture est unique, chaque client est unique,
  chaque fournisseur est unique. Toute **ressemblance** entre deux fournisseurs ou deux clients
  (dénomination, montants, HT/TVA) → mise **« en attente de fusion »**, à **valider par le
  gestionnaire des comptes** (jamais de fusion/création silencieuse).
- ⏳ **[RÈGLE R3 — Taux de TVA par défaut]** Clients‑particuliers : **10 %** ; clients‑sociétés :
  **20 %** sauf **sous‑traitance** (autoliquidation) ; fournisseurs : **20 %**.
- ⏳ **[RÈGLE R4 — Éditions A4]** Toutes les Éditions s'impriment en **A4** et l'**aperçu avant
  impression** s'affiche en **A4**.
- ⏳ **[RÈGLE R5 — Flux facture OCR → écriture en attente]** Toute facture (vente reçue/créée par
  YADA, achat réceptionné) : **OCR → écriture constatée → EN ATTENTE d'enregistrement →
  enregistrement**. Compte de tiers **réutilisé s'il existe, sinon créé** ; saisie automatique
  dans Analyse ; **montant de TVA transmis** à Analyse + module TVA + module Tiers (base de
  calcul de l'IS).
- ⏳ **[RÈGLE R6 — Structure des écritures]** Écriture type : ligne **tiers** (montant TTC) +
  ligne **TVA** (compte 445x sur la ligne TVA) + ligne **charge** (achat) ou **produit** (vente),
  qui se **soldent**. Écritures **bancaires = 2 lignes** (tiers ↔ 512). Chaque compte à sa
  place ; **libellé = dénomination du tiers** (pas le compte en doublon) ; **toutes les lignes
  d'une écriture portent le même libellé** ; le module TVA génère des écritures **justes**
  (comptes et montants sans erreur). Revue générale de la Consultation à faire sous cette règle.
- ⏳ **[RÈGLE R7 — Suivi des règlements]** Chaque **facture** est suivie d'une **opération
  bancaire** et chaque opération bancaire d'une **facture** — exceptions : services bancaires
  (commissions, assurances), dons, opérations des/vers les **organismes** et **Impôts**.
- ⏳ **[RÈGLE R8 — FEC]** Avant d'écraser par un import FEC : **sauvegarder** les écritures déjà
  établies. Un **export** FEC n'efface rien (les écritures restent) ; après export, **alerte
  Oui/Non** avant toute purge des mouvements.

## 2 · SESSION DÉCLARATIONS (ex‑TVA) — le module devient « Déclarations »

- ⏳ **Régime TVA** : option **CA3 (mensuel) / CA12 (annuel)** notifiée sur le dossier → le
  module affiche l'un ou l'autre.
- ⏳ **Montants à payer** mensuels/annuels + **formulaire officiel N° 3310‑CA3** (et équivalent
  CA12) reproduit et **rempli automatiquement** depuis la comptabilité (tous les comptes de TVA
  utilisés, montants totaux) → on déclare depuis ce tableau sans s'éparpiller.
- ⏳ **Case « mois déclaré »** à cocher pour repérer les mois à jour.
- ⏳ **Tableau « écriture comptable de TVA »** sur le modèle des scans fournis (mêmes rubriques :
  A‑Montant des opérations réalisées, B‑Décompte de la TVA à payer, TVA brute, déductions,
  crédit, taxe à payer…), lignes supplémentaires si nécessaire, présentation claire.
- ⏳ **Module IS / IR** : selon le régime de la société, calcul IS et IR avec **tableau des
  salaires versés** (repris du module Paie, pas de ressaisie), **taux/pourcentages à jour** →
  montants à payer + **écriture générée automatiquement** dans la Consultation des comptes.
- ⏳ **Module FLAT TAX** : calcul du PFU sur **dividendes** (montant donné → flat tax à payer)
  + **écriture comptable à utiliser**.

## 3 · SESSION PERMANENT (Dossier & réglages)

- ⏳ **Informations société** : à la saisie du **SIREN/SIRET**, complétion automatique depuis
  internet (Société.com, Infogreffe, Pappers) 🌐 (l'API recherche‑entreprises existe déjà en
  partie : `lookupSiret`).
- ⏳ **K‑bis & Statuts** : enregistrés au dépôt (création du dossier) → **PDF téléchargeables** +
  **déploiement immédiat** des informations dans l'onglet Informations société.
- ⏳ **Plan comptable** : afficher les comptes de **TVA**, de **Charges**, de **Produits** —
  toutes les classes **1 → 7**.
- ⏳ **Sociétés** : liste **complète des sociétés par utilisateur**.
- ⏳ **Coffre / identifiants** : recueillir les identifiants de connexion du cabinet
  (Impôts, Urssaf, Retraite, Prévoyance, Mutuelle, Assurance maladie).

## 4 · SESSION RH (Salarié + Charges et Paie)

- ⏳ **Agenda** (remplace « Rendez‑vous », entrée dans la barre latérale) : vrai agenda avec
  vues **Jour / Semaine / Mois**, rappels, notifications, **RDV clients**, couleurs ; à
  l'enregistrement d'un RDV → **envoi par e‑mail** et **par SMS si numéro saisi** 🌐.
- ⏳ **Charges** : cases des **mois d'une seule année** ; par mois, **tableau détaillé de tous
  les comptes de charges‑organismes** : 641 / 6451 / 6453 / 6454 / 6333 / 6312 / 6313 / 6455 /
  421 / 431 / 4373 / 4375 / 4372 / 4421 / 648 — détails précis + montants ; puis présentation
  **sous forme d'écriture** → **génération automatique après vérification** dans la
  Consultation des comptes. **[comptable → validation Règles]**
- ⏳ **Salariés** : liste complète ; suppression **justifiée par documents de sortie** (transmis
  par mail au salarié) ; absences avec justificatif ; **congés** notifiés dans l'agenda avec
  légende par salarié + **tableau des congés disponibles/restants, report annuel** ; **salaires
  modifiables** (ligne nom/prénom/poste + **SMIC du métier**, lois 2026 via IA 🌐) → calcul
  **brut + charges patronales** avec montants et **comptes comptables par organisme**.

## 5 · SESSION PILOTAGE

- ⏳ **Épurer** : supprimer Impôts (IS/IR) [→ Déclarations], Actif/Passif, Agenda & RH [→ RH] ;
  garder uniquement Pilotage + sous‑modules **Analytique & rentabilité** et **Suivi des
  règlements** (nav ✅ v409).
- ⏳ **Refonte complète — vraie plateforme de gestion**, alimentée par la **Consultation des
  comptes** (lier les écritures aux indicateurs) : consolidation des ventes ; calcul des coûts ;
  **gestion de trésorerie** (encaissements/décaissements, cash‑flow, **prévisions + scénarios**,
  besoin en financement) ; coût d'acquisition ; **délais de livraison** (pays, ville, adresse,
  heures départ/arrivée, pointage marchandise) ; **stocks** (optimisation, réappros, ruptures/
  surstocks, propositions d'ordres d'achat) ; **planification** (ordonnancement, tournées, sous
  contraintes coûts/délais) ; **maintenance prédictive** (anomalies machines, arrêts) ;
  **CA, marge brute/nette, résultat d'exploitation** ; **rentabilité par client / produit /
  projet** ; **seuil de rentabilité / point mort** ; **budgets + prévisions de ventes + analyse
  des écarts** ; suivi des actifs + **amortissements auto + cessions/sorties** ; **créances
  clients / dettes fournisseurs** ; **ROI** ; **rapports automatiques** ; **graphiques
  interactifs** ; produit le plus vendu / le plus coûteux — une **mine d'informations** pour
  l'entrepreneur. Les informations manquantes sont à compléter avant calcul.

## 6 · SESSION COMPTABILITÉ

- ⏳ **Consultation plein écran** : le bouton carré agrandit à **tout l'écran** ; supprimer la
  **croix de fermeture** en haut à droite ainsi que la barre.
- ⏳ **Chat IA** intégré pour aider les dirigeants depuis la plateforme 🌐.
- ⏳ **Cohésion totale** : le **Journal comptable** reprend exactement les journaux de la
  Consultation ; les **Éditions** reflètent en direct la dernière modification (balance
  **comptes 1 → 8**). **[comptable → validation Règles]**
- ⏳ **Revue générale de la Consultation** selon la **RÈGLE R6** (comptes à leur place, écritures
  arrêtées au solde, libellés). **[comptable → validation Règles]**

## 7 · SESSION TIERS

- ⏳ Chaque **fournisseur** : compte de tiers + compte de **charges** utilisé + **taux de TVA** +
  **HT dépensé** + **TVA déductible**. Chaque **client** : compte de tiers + compte de
  **produit** + taux de TVA + HT + TVA. Le tout **déterminé depuis la Consultation des
  comptes** (comptes utilisés). Enregistrement de nouveaux tiers possible.
- ⏳ **Détection d'assimilés** (montants, dénomination, HT/TVA) → **en attente de fusion**,
  validée par le gestionnaire (**RÈGLE R2**).

## 8 · NOUVELLE SESSION — ARCHITECTURE & ESPACES (Cabinet / Admin / Client)

- ⏳ **Topo des espaces** :
  - **ESPACE CABINET** — tenue comptable, gestion et paie des sociétés, pour tous les
    comptables du cabinet. Structuré en **5 modules** : Permanent · Déclarations · Salariés ·
    Pilotage · Comptabilité.
  - **ESPACE ADMIN** — gestion du cabinet : accès **global** à tous les dossiers, attribution de
    **droits**, de **missions**, **notes internes**, **tableau d'avancement par salarié**,
    **toutes les fonctionnalités du Cabinet**, et une **barre latérale par thèmes** (nombreux
    thèmes) pour **paramétrer l'espace Client et l'espace Cabinet**.
  - **ESPACE CLIENT** — demandes clients, transmission des factures fournisseurs, création des
    factures clients.
- ✅ **Connexion à 3 espaces (v412)** : Cabinet (`aemconseil.sas@gmail.com`), Client
  (`yada.assistance@gmail.com`), Admin (`admin.admin@gmail.com`) — mots de passe **hachés
  SHA‑256 salés** (clair absent du source). Cabinet = interface complète ; Client = achats/
  ventes + Tiers ; Admin = interface Cabinet + carte Administration (superviseur, données
  partagées → impacte le Cabinet).
- ⏳ **Outils Admin complets (reste)** : attribution de **droits** & **missions**, **notes
  internes** éditables, **tableau d'avancement par salarié**, **barre latérale par thèmes**
  pour paramétrer les espaces Client & Cabinet (chantier lourd — la carte Administration v412
  en est l'amorce).

---

## Ordre conseillé
1. **Session Règles** : fixer R1→R8 au registre + moteur central (bloquant critique + rapport).
2. **Sessions modules** : implémenter leurs sections avec, pour chaque PR **comptable**,
   la mention « À VALIDER par la session Règles » et attente du verdict avant merge.
3. **Session Architecture & Espaces** en dernier (structure transverse lourde).
