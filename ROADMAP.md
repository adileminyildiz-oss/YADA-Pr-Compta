# ROADMAP — YADA / Précompta · **une session par module**

> Document de **coordination des sessions**. YADA est **un seul fichier** (`precompta.html`) :
> plusieurs sessions travaillent dessus, **une par module**. Ce fichier dit, pour chaque
> module, **où on en est** et **ce qui reste à finaliser**. Chaque session le lit au
> lancement, met à jour la section de SON module, et ne touche pas aux autres.
>
> Source de vérité détaillée des changements : **`CLAUDE.md`** (journal de version, en tête).

---

## 🔒 Règles de coordination (multi-sessions, fichier unique)

1. **Une branche par session/module** — ex. `claude/module-tva`, `claude/module-banque`.
   Ne pas partager une même branche entre deux modules en parallèle.
2. **100% additif** — chaque session ajoute son bloc `yada-addonN` en fin de `<body>`
   (et ses `<style id="...">` avant `</head>`). On ne réécrit jamais globalement.
   Les modules se touchent alors très peu → conflits minimes.
3. **Fusion séquentielle vers `main`** — rebaser sur `main` à jour **avant** chaque merge.
   Les zones partagées (badge de version, `version.json`, en-tête `CLAUDE.md`) se
   résolvent au fil de l'eau, une session à la fois.
4. **Numéro d'addon & version** — prendre le prochain `yada-addonN` libre au moment du
   merge (pas de la création de branche) pour éviter les collisions de numéro.
5. **Validation obligatoire à chaque merge** — `node --check` (0 erreur) + accolades CSS
   équilibrées + Playwright + **filet d'équilibre** (`node tests/equilibre-ecritures.mjs`).
6. **Périmètre strict** — une session = un module. Ne pas modifier le code d'un autre
   module sans le signaler ici.

## ⚖️ Règles d'or comptables (valables pour TOUTES les sessions)

1. Écritures **uniquement** via `posterFacture` / `genEcriture` / `posterBanque` / `posterOD`.
2. **Σ débit = Σ crédit** sur chaque pièce.
3. Comptes normalisés **`c9`** (9 chiffres).
4. Numérotation **unique et chronologique** (`nextNumUnique`).
5. Pièce envoyée/verrouillée = non modifiable → correction par **avoir** ou **OD**.
6. **Continuité d'exercice** : à‑nouveaux (1→5) + résultat (120/129) reportés à la clôture.
7. **Base comptable MBC** (plan BTP + PCG, TVA auto, comptes de tiers) appliquée à
   **tous** les dossiers (addon197) — ne pas la contourner.

---

## 📦 Sessions par module

> Légende : ✅ fait · 🔧 à finaliser · 🌐 hors‑ligne impossible (réseau/API requis).

### Session 1 — **Comptabilité** (cœur)
Sous‑modules : `compta` (Analyse / Consultation), `journal`, `editions`, `fec`,
`reglements`, `analytique`, `plancomptable`, `ia`, `pilotage`, `salarie`.
- ✅ Éditeur d'écritures façon Sage (saisie directe, clavier, lettrage, éditeur vide → Entrée crée la 1ʳᵉ écriture).
- ✅ Consultation = centre de contrôle (source unique) ; Éditions reliées.
- ✅ Balance / Grand‑livre / Bilan / Compte de résultat / journaux depuis les écritures.
- ✅ FEC : import dans le dossier courant, comptes de tiers auxiliaires, immos auto.
- 🔧 Analytique : axes analytiques réels, marge par affaire.
- 🔧 Assistant IA : mémorisation par tiers · 🌐 IA en ligne réelle.
- Garde‑fou : équilibre imposé, `c9`, lettrage `lz*`.

### Session 2 — **Fournisseurs** (`achats`)
- ✅ Dépôt de facture + lecture auto (PDF couche‑texte), comptabilisation cabinet (401 auxiliaire, montants exacts), doublons.
- ✅ Correspondances factures ↔ écritures (FEC inclus), journal ACH lié.
- 🔧 Autoliquidation UE affinée ; justificatif systématiquement rattaché.
- 🌐 OCR image/scan (Tesseract via CDN, repli hors‑ligne déjà en place).
- Garde‑fou : ACH équilibrée.

### Session 3 — **Clients** (`facturation`)
- ✅ Création facture → liste → génération d'écriture (VTE équilibrée), aperçu A4 en direct, récurrences, conditions de paiement, indemnité 40 €.
- ✅ Facturation électronique (PPF/PDP simulé) + Factur‑X (XML CII).
- 🔧 Avoirs, chronologie stricte des n°.
- 🌐 e‑reporting réel, Factur‑X embarqué en PDF/A‑3.
- Garde‑fou : VTE équilibrée ; verrou après envoi.

### Session 4 — **Tiers**
- ✅ Fiches (fournisseur / client société / particulier), édition/suppression, changement de type, moyen de paiement, n° de compte modifiable, HT+TVA par tiers, dédoublonnage/fusion.
- 🔧 Consolidation collectif ↔ auxiliaire, contrôles de cohérence SIRET/TVA.
- Garde‑fou : pas de modif rétroactive non maîtrisée.

### Session 5 — **Immobilisations et Financement** (`immos`, `fraiskm`)
- ✅ Fiches immo (nature → compte → dotation), plan d'amortissement, génération acquisition + dotation, cession (675/775), FEC → fiches auto.
- 🔧 Amortissement dégressif fiable, reprise sur dépréciation, emprunts/crédit‑bail/locations complets, reprise A‑nouveaux.
- Garde‑fou : OD dotations/cession équilibrées.

### Session 6 — **Charges et Paie** (`chargespaie`)
- ✅ Bulletins de paie éditables (modèle FR), OD de paie + OD de charges par mois, dépôt/OCR bulletins, journal de paie.
- 🔧 Taux paramétrables par convention, paiement + lettrage des organismes.
- 🌐 DSN réelle.
- Garde‑fou : OD équilibrées, idempotence par mois.

### Session 7 — **TVA**
- ✅ CA3 sur tous comptes 445x, onglets d'année, déclaration séquentielle, OD TVA, détail par compte, suivi annuel.
- 🔧 CA12 (réel simplifié) : acomptes/chaînage crédit renforcés.
- 🌐 Télétransmission (impots.gouv.fr).
- Garde‑fou : TVA déclarée = solde 4457x / 4456x.

### Session 8 — **Banque** (`banque`, `saisiebq`, `rappro`)
- ✅ Relevé par année/mois, saisie journal banque (éditeur + lecture relevé PDF), contrepartie 512 auto, rapprochement/lettrage, sens fiable depuis la ligne 512.
- 🔧 Multi‑512 avancé, import relevé (CSV/OFX) fiabilisé, ventilation TVA sur frais.
- Garde‑fou : BQ équilibrée ; pointage ne modifie aucune écriture.

### Session 9 — **Pilotage & espaces** (`dash`, `societe`, `client`)
- ✅ Tableau de bord (trésorerie = solde 512, CA/charges/résultat depuis écritures), portefeuille Sociétés, Espace Client (dépôts, factures, messagerie, mobile).
- 🔧 KPI/graphes analytiques par affaire, compteurs dynamiques par dossier.
- Garde‑fou : lecture seule (aucune écriture directe côté client).

### Session 10 — **Dossier & réglages** (`dossier`, `infosociete`, `coffre`, `parametrage`)
- ✅ Création dossier (K‑bis/Statuts facultatifs), infos société, coffre‑fort, paramétrage + plan comptable (séparés), transfert manuel, synchro cloud (Pantry) + IndexedDB.
- 🔧 Reprise A‑nouveaux à la création, validations de fiche renforcées.
- Garde‑fou : dataset isolé par dossier ; compte mouvementé non supprimable.

---

## 🔗 Session TRANSVERSE — **Règles comptables** (gardienne & validatrice)

> Session à part, **non liée à un seul module** : elle fixe, conserve et **fait respecter**
> les règles de gestion et de comptabilité sur **tous** les modules comptables.
> À lancer/merger **en premier ou en isolation** (elle modifie les fonctions partagées
> `posterFacture`/`genEcriture`/`posterBanque`/`posterOD`) → sinon conflits avec les
> sessions par module.

**Mission**
- Toute demande de cette session = une **règle à fixer**. Une règle fixée est **définitive** :
  conservée précieusement, maintenue à jour, **respectée partout**, jamais régressée.
- Application **« les deux »** : **blocage à la saisie** pour les règles critiques
  (équilibre, compte manquant/`000000000`, compte non `c9`) + **rapport de contrôle**
  (Centre de contrôle comptable) pour le reste.
- Architecture : **un moteur de règles central** (addon additif) qui enveloppe les points
  de passage communs + un **Centre de contrôle comptable** qui scanne toutes les écritures.

**Registre officiel des règles → `REGLES-COMPTABLES.md`** (créé et maintenu par cette session)
- Une entrée par règle : **code** (ex. `EQL-01`), énoncé, périmètre, **sévérité**
  (bloque / avertit), point d'accroche, date de fixation. **Jamais retirée** sans demande
  explicite. C'est la **source de vérité** que le moteur fait respecter.

### 🧷 Protocole de validation INTER‑SESSIONS (obligatoire)
Les sessions Claude ne communiquent pas en direct : la coordination passe par le **registre
partagé + la revue des PR**. **Tout changement de N'IMPORTE QUELLE session** (y compris les
sessions par module et la session générale) **doit être validé par la session Règles.**

1. **Annonce** — chaque session, dans la description de sa PR, liste les fonctions
   comptables touchées et coche « **À VALIDER par la session Règles** ».
2. **Revue** — la session Règles relit le **diff de la PR** contre `REGLES-COMPTABLES.md`.
3. **Verdict** :
   - ✅ **Conforme** → la session Règles valide (approbation PR) ; la PR peut être mergée.
   - ❌ **Non conforme** → la session Règles **indique la règle enfreinte + LA SOLUTION**
     (le correctif précis) à l'utilisateur ; **la PR n'est pas mergée** tant que ce n'est
     pas corrigé.
4. **Portée** — ce contrôle s'applique aussi aux changements de la **session générale**
   (`application-mobile`) : ils passent par la session Règles avant merge.

### Catalogue des règles retenues (toutes)
- **A · Intégrité** (bloquantes) : Σ débit = Σ crédit ; comptes `c9` ; aucune ligne
  mouvementée sans compte (ni vide ni `000000000`) ; débit **ou** crédit ; montants ≥ 0
  arrondis 2 déc. ; ≥ 2 lignes, ≥ 1 débit & ≥ 1 crédit ; journal valide ; date dans l'exercice.
- **B+C · Tiers & TVA** : compte auxiliaire 401/411 (jamais collectif seul) ; `tiersId`
  rattaché (ACH/VTE) ; collectée 4457x crédit / déductible 4456x (hors 44567) débit ;
  HT+TVA=TTC ; compte de TVA cohérent avec le taux.
- **D · Banque & règlements** : contrepartie 512 + sens fiable (512 débit = entrant) ;
  règlement « réglé » ⇒ mouvement 512 ; lettrage Σ débit = Σ crédit.
- **E · Numérotation & clôture** : n° unique & chronologique ; pièce verrouillée non
  modifiable (avoir/OD) ; à‑nouveaux (1→5) + résultat (120/129) à la clôture.

---

## 🧭 Démarrer une session de module

1. Ouvrir la session en annonçant : **« Cette session = module \<X\> »**.
2. Créer/checkout la branche `claude/module-<x>` depuis `main` à jour.
3. Lire la section du module ci‑dessus + le journal `CLAUDE.md`.
4. Travailler **additif** (`yada-addonN`), valider (`node --check` + équilibre + Playwright).
5. Mettre à jour la section du module ici (✅ / 🔧).
6. Rebaser sur `main`, ouvrir la PR, faire passer la CI, merger.

**Hors‑ligne impossible (à brancher quand une API sera dispo)** : OCR image/scan en ligne,
IA en ligne réelle, e‑reporting / télétransmission TVA, DSN.
