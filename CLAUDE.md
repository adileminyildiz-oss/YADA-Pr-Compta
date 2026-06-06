# CLAUDE.md — YADA / Précompta (passation Claude Code)

> Ce fichier est lu automatiquement par Claude Code au lancement. Il décrit le projet, les **règles de travail**, l'architecture, et **la dernière mise à jour**. La source de vérité reste **`precompta.html`** (un seul fichier).

---

## 🟢 Dernière mise à jour — Facturation électronique : opérateur relié (PPF/PDP) + Factur-X
**Quoi :** un module ajouté dans la page **Facturation client** (`pageFacturation`) qui simule l'intégration à un **opérateur de dématérialisation agréé** (PPF — Portail Public de Facturation, ou PDP — Plateforme de Dématérialisation Partenaire), conformément à l'esprit de la réforme française de la facturation électronique B2B.

**Pourquoi :** à terme, un PDF par e-mail ne suffira plus en B2B ; les factures doivent transiter par une plateforme agréée au format structuré (**Factur-X / XML**). Le module pose les fondations côté outil.

**Ce qu'il fait (description fonctionnelle) :**
- **Connexion d'un opérateur** : choix du type (PPF/PDP), nom, identifiant/SIRET → bouton « Relier l'opérateur ». État mémorisé et sauvegardé.
- **Transmission** d'une facture validée à l'opérateur au format **Factur-X** (« Transmettre »).
- **Cycle de vie e-invoice** suivi par facture : `à transmettre → Déposée → Émise par la plateforme → Mise à disposition du client → Approuvée → Encaissée`, avec une branche **Refusée**.
- **Flux horodaté** consultable en modale (timeline des étapes + dates).
- **Génération Factur-X** : un **XML CII** (profil simplifié) téléchargeable, avec vendeur (SIRET/TVA de la société), acheteur, lignes, TVA et totaux.
- Compteur « N/M factures transmises ».

**Où / comment (description technique) — addon `yada-addon20` :**
- Greffe : `const _pf=pageFacturation; pageFacturation=function(){ return _pf()+efacturationCard(); }`.
- Constante d'étapes : `EFACT_ETAPES = ['Déposée','Émise par la plateforme','Mise à disposition du client','Approuvée','Encaissée']`.
- Config persistée dans **`db.parametres.efact`** = `{operateur, idOp, mode:'PPF'|'PDP', connecte}` via `efactCfg()`.
- Statut par facture stocké sur l'objet document : **`doc.efact`** = `{statut, operateur, mode, flux:[{etape,date}]}`.
- Fonctions : `efacturationCard()`, `efactStatutTag(s)`, `efactConnecter()`, `efactDeconnecter()`, `efactTransmettre(id)`, `efactAvancer(id)`, `efactRefuser(id)`, `efactFlux(id)` (modale), `efactXML(id)` (génère + télécharge le Factur-X).
- CSS ajouté : `<style id="efact-mod">` (timeline `.ef-step/.ef-dot/.ef-timeline`, encart `.ef-on`).

**Limites assumées :** simulation **hors-ligne** (pas de connexion réelle à un PPF/PDP) ; le Factur-X généré est **représentatif** du format CII, à fiabiliser (schéma officiel) avant un usage réel ; le calendrier de la réforme a été décalé plusieurs fois → vérifier les dates en vigueur.

**Pistes de suite sur ce module :** statut « reçu » côté Achats (e-reporting / réception fournisseurs) ; embarquer le Factur-X dans un PDF/A-3 ; variante en ligne réelle via clé API d'un opérateur.

---

## Le projet
App de **pré-comptabilité française** (style Sage) en **un seul fichier `precompta.html`** autonome, **hors-ligne**, tout en français. Logique + UI dans des `<script>`. 3 thèmes (`noir` défaut, `liquid-clair`, `liquid-teinte`). Écran de connexion + portefeuille multi-dossiers. 2 démos : **AMA** (`d-ama`), **SCI DU 42** (`d-sci42`).
État actuel : ~690 Ko, 39 `<script>`, **38 modules d'extension** (`yada-addon` → `yada-addon38`), 23 entrées de navigation.
Feuille de route : voir **`ROADMAP.md`** (finalisation par module).
- **`yada-addon21` (T1)** : clôture de l'exercice — **OD de résultat** (solde 6/7 → 120/129) + **report des à‑nouveaux** (classes 1→5), carte page Éditions. Continuité comptable (bilan d'ouverture N+1 équilibré). Fonctions : `t1ResultatLignes/t1GenererResultat`, `t1ANLignes/t1GenererAN`, `t1SupprimerCloture`, `t1Card`.
- **`yada-addon22` (T2)** : **cohérence des comptes** — normalisation `c9` (9 chiffres) de tous les comptes d'écriture (migration de tous les dossiers + à chaque `save`), de sorte que l'**OD TVA solde réellement** les comptes alimentés par les factures (44571→445710000, 44566→445660000). `tvaDuMois` comparé en `c9`. Fonction : `t2Normaliser()`. + correctif chirurgical du solde banque (ligne ~3390 : `c9(l.compte)==='512000000'`).
- **`yada-addon23` (T4)** : **états de synthèse** — **Bilan** + **Compte de résultat** imprimables, carte page Éditions. CR calculé hors « OD RÉSULTAT » (valable avant/après clôture) ; Bilan toujours équilibré (résultat non affecté ajouté en capitaux propres). Fonctions : `t4Card`, `t4Afficher('bilan'|'cr')` (+ `etatBilan/etatCR` internes).
- **`yada-addon24` (T3)** : **lettrage unifié** — moteur commun `lzLettrer(refs)`/`lzDelettrer(refs)`/`lzProchaineLettre(cptC9)` (champ `l.lettre`, contrôle Σ débit = Σ crédit) ; **lettrage interactif dans l'éditeur** (clic sur lignes → `ecSel`, barre `.ec-letbar`, `ecLettrerSel/ecDelettrerSel`). Données partagées avec le compte auxiliaire. **Fondations T1→T4 terminées.**
- **`yada-addon25` (risque compta)** : **Règlements ↔ Banque** — `marquerRegle`/`ecart` génèrent l'écriture de trésorerie (encaissement client : crédit 411 / débit 512 ; paiement fournisseur : débit 401 / crédit 512) puis lettrent la facture. La créance/dette est réellement soldée par la trésorerie.
- **`yada-addon26` (risque compta)** : **Cession d'immobilisation** — `imCeder` génère l'OD de sortie équilibrée : 675 (VNC) + 28x (amort. cumulés) D = 21x (immo brute) C ; 512 (prix) D = 775 (produit) C. Idempotent (libellé « CESSION IMMOBILISATION … »). Fonction : `imCederComptabilise(im,date,prix)`.
- **`yada-addon27`** : éditeur d'écritures — **filtre / tri** (`ecSetFiltre/ecToggleSort`, barre `.ec-filtbar`). Affichage seul.
- **`yada-addon28`** : **Tiers — édition/suppression** d'une fiche (`tiersEditer/tiersEnregistrer/tiersSupprimer`, bouton ✎). Bloqué si tiers mouvementé ; pas de modif rétroactive des écritures.
- **`yada-addon29`** : **Éditions — balance âgée** clients & fournisseurs (`balanceAgeeCard`, ventilation par ancienneté). Lecture seule.
- **`yada-addon30`** : **Tableau de bord** — trésorerie réelle (solde 512, `soldeTresorerie()`) + CA/charges depuis les écritures (`dashTresoCard`).
- **`yada-addon31`** : **GED** — dépôt glisser-déposer de vrais fichiers (`db.parametres.pieces`, `gedAdd/gedCard`), carte Espace Client.
- **`yada-addon32`** : **Espace Client séparé** — `window.sessionRole` (cabinet|client) + `CLIENT_PAGES=['client','facturation','achats','tiers']` (navigation restreinte côté client) ; `choisirDossierClient/quitterEspaceClient` ; actions cabinet masquées.
- **`yada-addon33`** : **Messagerie client ↔ cabinet** + pièces demandées (`db.parametres.messages/demandes`, `messagerieCard`).
- **`yada-addon34`** : **FEC inverse** — bouton « ouvrir l'exercice précédent (N-1) » pour les à-nouveaux (`fecOuvrirPrecedent`).
- **`yada-addon35`** : **Autoliquidation de TVA (achats)** — case « Autoliquidation » dans Achats ; écriture 4 lignes équilibrée (60x HT + 445660000 TVA déd. D = 401 HT + 445710000 TVA coll. C). Net dû = HT ; TVA collectée + déductible déclarées sur la CA3. Fonction : `posterAchatAutoliq(o)` (override `validerAchat`/`majAc`).
- **`yada-addon36`** : **cohérence des KPI de synthèse** — Tableau de bord & Espace Client alignent **CA / Charges / Résultat** sur les **écritures** (classe 7/6 hors « OD RÉSULTAT »), comme le Compte de résultat (avant : basés sur les factures, ignoraient paie/dotations). `resEcritures()` ; greffe `dashCompta`/`pageEspaceClient`. L'Analytique reste basé factures (analyse par pièce).
- **`yada-addon37`** : badge de version (repère de déploiement, bas-droite) — confirme qu'une MAJ est en ligne (GitHub Pages).
- **`yada-addon38`** : **Connexion 2 espaces avant les dossiers** — écran de choix Cabinet/Client puis identifiant (e-mail)+mot de passe propres à l'espace (empreintes SHA-256 salées `CAB`/`CLI`, clair absent du source) ; **portail Client rattaché EXCLUSIVEMENT à un dossier** (`CLIENT_DOSSIER='d-ama'`) → accès **direct** à son Espace Client, **sans** portefeuille de dossiers ; cloisonnement des espaces ; verrouillage auto inactivité + déconnexion ; session `sessionStorage['yada-role']`. `secChoisir/secEssayer/secRetour/secVerrouiller`.
> **Hors périmètre hors-ligne** : OCR réel et IA en ligne (réseau/clé API requis) restent simulés ; e-reporting Achats à compléter ultérieurement.

## Règles de travail (IMPÉRATIF)
1. **Ajouter par-dessus l'existant sans rien casser.** Édition chirurgicale, jamais de réécriture globale. Les nouveautés = nouveaux **scripts d'extension** `yada-addonN` injectés avant `</body>` (greffe sur fonctions globales) + éventuels `<style id="...">` avant `</head>`.
2. **Numéros de ligne instables** → toujours re-chercher les ancres (grep) avant d'éditer.
3. **UTF-8 en clair** (accents/emoji), jamais `\uXXXX`. Attention aux apostrophes dans les chaînes JS en quotes simples : préférer les backticks pour le HTML, ou des guillemets doubles.
4. **Valider chaque modification** :
   - extraire chaque `<script>` et faire `node --check` (zéro erreur) ;
   - accolades CSS équilibrées (`{` == `}`) ;
   - balises `</head>`/`</body>`/`</html>` uniques ;
   - **rendu réel via Playwright** (Chromium) sur les 2 démos : parcourir les modules, capturer pageerror/console, vérifier que **toutes les écritures sont équilibrées** (Σ débit = Σ crédit).
   - Pré-requis test : `npm i -g playwright && npx playwright install chromium`.

## Architecture
- `render()` lit `current`, pose `document.body.dataset.page=current`, puis appelle le module via un objet de **dispatch réévalué à chaque rendu**. Réassigner `pageX = function(){…}` fonctionne → pattern de greffe : `const _p=pageX; pageX=function(){ return _p()+complement(); }`.
- **Persistance auto** : `save()` écrit tout `db` dans `localStorage` (clé `yada-db`) ; rechargé au démarrage (sinon `seed()` charge la démo). Export/Import JSON disponibles.
- Modale générique : `#modal` / `#modal-c` + `closeModal()`. Toasts : `toast(msg)`.

## Modèle de données `db`
`db = { cabinet:{dossiers[]}, dossiersData:{[id]:dataset}, activeId, …champs du dossier actif copiés au top-level (CHAMPS_DOSSIER, recopiés dans dossiersData[activeId] par persistActif()) }`.
Dataset : `societe` (raison, formeJur, siren, siret, tvaIntra, codeAPE, adresse, cp, ville, dirigeant, exoDebut/exoFin, exercices[], kbisRecu/kbisPdf, statutsRecu/statutsPdf…), `tiers[]` (type client/fournisseur, compteContre, compteTVA, taux, email, siret), `factures[]` (type achat/vente, tiersId, date, numero, ht/tva/ttc, compteContre, ecritureId), `ecritures[]` (journal ACH/VTE/BQ/OD/ODP/ODTVA, libelle, lignes:[{compte,lib,debit,credit,lettre?}]), `banque[]`, `reglements[]` (sens a_payer/a_encaisser, statut, restant), `docs[]` (documents commerciaux : type facture/devis/avoir, lignes[], ht/tva/ttc, statut brouillon/valide, envoye, ecritureId, **efact** pour e-invoice), `propositions[]` (Assistant IA), `relances{}`, `catalogue, immos, emprunts, paie, plan, journaux, seq, parametres` (dont **parametres.efact** = config opérateur e-invoice).

## Helpers globaux
`eur, r2, uid, c9, frDate, todayStr, ym, moisLabel, nextNum/nextNumUnique, save, render, toast, closeModal, head, flow, calcMontants(base,taux,'HT'|'TTC'), posterFacture(...), posterBanque(...), posterOD(...), genEcriture, analytique() → {prod,charge,parClient,parFourn,ca,achats,resultat}, tvaDuMois(m) → {col,ded,aDecaisser,credit}, moisDisponibles(), statsTiers(id), sageCode(t) (collectif 401/411 + 4 lettres — affichage), exoYear, addAnnees, exSuivant/exPrecedent, COMPTES, COMPTES_CHARGE, COMPTES_PRODUIT, PCG_COMPLET (~970 comptes), numIdentifiant, lookupSiret, tvaFromSiren, lookupConvention, relancesData/relancerClient, relancesCard, statutTag, dashRoute, chargerDossier, choisirDossier, datasetVide, societeDefaut, cabinetDefaut, chargerPlanBTP, voirDoc, telechargerDoc, docHTML, peutEnvoyer, genererEcritureDoc, transformerDevis, docEtatTag, ecTresorerie, ecEncoursParClient`.

## Modules (id → rôle)
`dash` tableau de bord · `societe` portefeuille · `client` **Espace Client** (chiffres clés, dépôt de pièces→OCR/IA, devis & factures, encours & relances, suivi par client) · `tiers` référentiel · `facturation` ventes : nouvelle facture (overlay), **cycle de vie** (attente→validé→envoyé verrouillé, suppression, lot), liste **Factures** (transfert ⚙ Générer), suivi/envoyées/saisie rapide/catalogue, **+ Facturation électronique opérateur relié (PPF/PDP) + Factur-X** · `achats` factures fournisseurs OCR (→ Assistant IA, panneau IA fournisseurs embarqué) · `compta` consultation (éditeur d'écritures façon Sage au double-clic) · `chargespaie` · `journal` · `ia` Assistant IA (écritures) · `tva` CA3 · `editions` (balance, grand livre) · `fec` import/export FEC (un FEC année N ouvre N **et** N+1) · `analytique` · `banque` · `saisiebq` (édition inline) · `rappro` lettrage · `reglements` · `immos` · `dossier` (création + suppression de dossier) · `infosociete` (fiche complète) · `coffre` · `parametrage`.

## Fonctionnalités majeures déjà livrées (addons 10→20)
Éditeur d'écritures façon Sage (double-clic) ; saisie banque inline ; facturation cycle de vie + lot ; Assistant IA (propositions d'écritures) ; achats → IA + panneau IA fournisseurs ; création de dossier (fiche + K-bis/Statuts) ; suppression de dossier ; Espace Client ; import FEC multi-exercice (N + N+1) ; sauvegarde automatique localStorage ; **facturation électronique opérateur relié + Factur-X** (dernière MAJ, voir en haut).

## Démarrage attendu d'une session
« Lis ce CLAUDE.md et `precompta.html`. Continue par ajouts chirurgicaux sans rien casser, en validant par `node --check` sur chaque `<script>` + un rendu Playwright sur les 2 démos (d-ama, d-sci42). »
