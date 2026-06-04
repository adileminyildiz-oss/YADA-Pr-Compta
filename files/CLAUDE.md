# CLAUDE.md — YADA / Précompta

Contexte de projet pour Claude Code. **Lis aussi `PASSATION-YADA-Precompta.md`** (description exhaustive).

## Ce qu'est le projet
App de **pré‑comptabilité française** (style Sage) en **un seul fichier `precompta.html`** autonome, **hors‑ligne**, tout en français. Logique + UI dans des `<script>`. 3 thèmes. Écran de connexion + portefeuille multi‑dossiers. 2 démos : AMA (`d-ama`), SCI DU 42 (`d-sci42`).

## Règles de travail (IMPÉRATIF)
1. **Ajouter par‑dessus l'existant sans rien casser.** Édition chirurgicale, ne jamais retout retaper. Les nouveautés se font par **scripts d'extension** `yada-addonN` injectés avant `</body>` (greffe sur fonctions globales) + éventuels `<style id="...">` avant `</head>`.
2. **Numéros de ligne instables** → toujours re‑chercher les ancres (grep) avant d'éditer.
3. **UTF‑8 en clair** (accents/emoji), jamais `\uXXXX`. Attention aux apostrophes dans les chaînes JS entre quotes simples : utiliser des backticks pour le HTML.
4. **Valider chaque modification** :
   - extraire chaque `<script>` et faire `node --check` (zéro erreur) ;
   - accolades CSS équilibrées (`{` == `}`) ;
   - `</head>`/`</body>`/`</html>` uniques ;
   - **rendu réel via Playwright** (Chromium) sur les 2 démos : parcourir les modules, capturer pageerror/console, vérifier que **toutes les écritures sont équilibrées** (Σ débit = Σ crédit).
     Pré‑requis : `npm i -g playwright && npx playwright install chromium`.

## Architecture
- `render()` lit `current` et appelle le module via un objet de dispatch (réévalué à chaque rendu). Réassigner `pageX = function(){…}` fonctionne → pattern de greffe : `const _p=pageX; pageX=function(){ return _p()+complement(); }`.
- **Persistance** : `save()` écrit tout `db` dans `localStorage` (clé `yada-db`) ; rechargé au démarrage (sinon `seed()` charge la démo). Export/Import JSON disponibles.
- Modale : `#modal`/`#modal-c` + `closeModal()`. Toasts : `toast(msg)`.

## Modèle de données `db`
`db = { cabinet:{dossiers[]}, dossiersData:{[id]:dataset}, activeId, …champs du dossier actif }`.
Dataset : `societe`, `tiers[]` (type client/fournisseur, compteContre, compteTVA, taux, email…), `factures[]` (type achat/vente, tiersId, date, numero, ht/tva/ttc, compteContre, ecritureId), `ecritures[]` (journal, libelle, lignes:[{compte,lib,debit,credit,lettre?}]), `banque[]`, `reglements[]` (sens a_payer/a_encaisser, statut, restant), `docs[]` (documents commerciaux : type facture/devis/avoir, statut brouillon/valide, envoye, ecritureId), `propositions[]` (Assistant IA), `relances{}`, `catalogue, immos, plan, journaux, seq, parametres`.

## Helpers globaux
`eur, r2, uid, c9, frDate, todayStr, ym, moisLabel, nextNum/nextNumUnique, save, render, toast, head, flow, calcMontants(base,taux,'HT'|'TTC'), posterFacture(...), posterBanque(...), analytique(), tvaDuMois(m), moisDisponibles(), statsTiers(id), sageNum, sageCode, exoYear, addAnnees, exSuivant/exPrecedent, COMPTES, COMPTES_CHARGE, COMPTES_PRODUIT, PCG_COMPLET, numIdentifiant, lookupSiret, relancesData/relancerClient, dashRoute, chargerDossier, choisirDossier, datasetVide, societeDefaut, voirDoc, telechargerDoc, genererEcritureDoc`.

## Modules (id → rôle)
`dash` tableau de bord · `societe` portefeuille · `client` Espace Client · `tiers` référentiel · `facturation` ventes (cycle de vie + lot + transfert) · `achats` factures fournisseurs OCR (→ IA, panneau IA embarqué) · `compta` consultation (éditeur Sage au double‑clic) · `chargespaie` · `journal` · `ia` Assistant IA · `tva` CA3 · `editions` · `fec` import/export FEC (ouvre N et N+1) · `analytique` · `banque` · `saisiebq` (édition inline) · `rappro` lettrage · `reglements` · `immos` · `dossier` (création + suppression de dossier) · `infosociete` · `coffre` · `parametrage`.

## Pistes non faites
Accès « mode Client » séparé ; messagerie client↔cabinet + pièces manquantes ; dépôt glisser‑déposer de vrais fichiers ; lettrage interactif dans l'éditeur Sage ; IA en ligne réelle (lecture PDF/photo via API) ; bouton « Ouvrir K‑bis/Statuts » ; sélecteur d'exercice visible.

## Démarrage attendu d'une session
« Lis ce CLAUDE.md et `precompta.html`. Continue par ajouts chirurgicaux sans rien casser, en validant par `node --check` sur chaque `<script>` + rendu Playwright sur les 2 démos. »
