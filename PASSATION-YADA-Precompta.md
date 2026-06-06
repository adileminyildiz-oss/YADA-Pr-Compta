# YADA / Précompta — Document de passation (reprise dans une autre conversation)

> **Comment l'utiliser :** dans la nouvelle conversation, **collez ce document** ET **joignez le fichier `precompta.html`** (c'est lui le code source réel et à jour — ce document ne fait que le décrire). Demandez ensuite à continuer en repartant de votre fichier.

---

## 1. Le projet
Application web de **pré‑comptabilité française** « **YADA / Précompta** » (style Sage/Regate) pour cabinet comptable.
- **Un seul fichier HTML autonome** (`precompta.html`, ~652 Ko), tout le code (logique métier + UI) dans des balises `<script>`.
- **Hors‑ligne** : s'ouvre par double‑clic dans un navigateur, aucune installation.
- **Tout en français** ; **3 thèmes** : `noir` (défaut, dark liquid glass bleu), `liquid-clair`, `liquid-teinte`.
- **Écran de connexion** + **portefeuille de dossiers** (cabinet multi‑sociétés).
- **2 dossiers de démo** : **AMA** (négoce/BTP, id `d-ama`) et **SCI DU 42** (immobilier, id `d-sci42`).

## 2. Fichier de travail & méthode
- Source réelle = le fichier `precompta.html` que vous joignez.
- **Consigne permanente : ajouter par‑dessus l'existant sans rien casser**, par édition chirurgicale (ne jamais retout retaper).
- Le code de base est complété par **des scripts d'extension injectés avant `</body>`** : ids `yada-addon`, `yada-addon2` … `yada-addon20`. Chaque nouveauté = un nouvel addon (greffe sur fonctions globales) + parfois un `<style id="...">` ajouté avant `</head>`.
- **Numéros de ligne instables** : toujours re‑chercher les ancres (grep) avant d'éditer.
- **Écrire les accents/emoji en clair (UTF‑8)**, jamais en `\uXXXX`. Attention aux apostrophes dans les chaînes JS entre quotes simples (utiliser backticks pour le HTML).

### Validation systématique (à refaire à chaque modification)
1. Extraire chaque `<script>` → `node --check` (aucune erreur).
2. Accolades CSS équilibrées (compter `{` vs `}`).
3. Balises `</head>` / `</body>` uniques.
4. **Rendu réel via Playwright** (Chromium global) : parcourir les modules sur les 2 démos, capturer `pageerror`/console, vérifier que **toutes les écritures sont équilibrées** (Σ débit = Σ crédit).
   - Lancement type : `GROOT="$(npm root -g)" node script.cjs` avec `const {chromium}=require(path.join(process.env.GROOT,'playwright'))`.

## 3. Conventions & persistance
- **Sauvegarde automatique** : `save()` écrit tout `db` dans `localStorage` (clé `"yada-db"`) à chaque action ; au démarrage l'INIT recharge depuis `localStorage` (sinon `seed()` charge la démo). Export/Import JSON disponibles. « Réinitialiser (démo) » réécrit la démo. Si le stockage sature (gros PDF joints), un message invite à exporter.
- `render()` pose `document.body.setAttribute('data-page', current)` puis exécute le **dispatch** (objet littéral réévalué à chaque rendu) :
  `({dash:pageDash, societe:pageSociete, client:pageEspaceClient, tiers:pageTiers, facturation:pageFacturation, achats:pageAchats, compta:pageCompta, compteaux:pageCompteAux, chargespaie:pageChargesPaie, journal:pageJournal, ia:pageIA, tva:pageTVA, editions:pageEditions, fec:pageFEC, analytique:pageAnalytique, banque:pageBanque, saisiebq:pageSaisieBq, rappro:pageRappro, reglements:pageReglements, immos:pageImmos, dossier:pageDossier, infosociete:pageInfoSociete, coffre:pageCoffre, parametrage:pageParametrage})[current]()`.
  - **Réassigner un global `pageX = function(){…}` fonctionne** (capté à chaque render) → pattern de greffe : `const _p=pageX; pageX=function(){ return _p()+complement(); }`.
  - Post‑hooks render : tiers→majComptesTiers, facturation→faMaj, achats→majAc, banque→majBq, saisiebq→majSj.
- Modale générique : `#modal` (.modal-bg) + `#modal-c`, affichée par `document.getElementById('modal').classList.add('show')`, fermée par `closeModal()`. Toasts via `toast(msg)`.

## 4. Modèle de données `db`
`db = { cabinet, dossiersData, activeId, … + champs du dossier actif (CHAMPS_DOSSIER copiés au top‑level) }`
- `db.cabinet.dossiers[]` : `{id, nom, forme, activite, ville, siren, actif, favori}` (portefeuille).
- `db.dossiersData[id]` : jeu de données complet d'un dossier ; `db.activeId` = dossier ouvert.
- Dossier actif (au top‑level, recopié dans `dossiersData[activeId]` par `persistActif()`) :
  - `societe` : `raison, formeJur, siren, siret, tvaIntra, codeAPE, capitalSocial, dateCreation, activite, adresse, cp, ville, pays, dirigeant, mailSociete, conventionCollective, banqueBenef, iban, bic, exoDebut, exoFin, exercices[], dossierNom, dossierCode, kbisRecu/kbisNom/kbisPdf, statutsRecu/statutsNom/statutsPdf, …`.
  - `tiers[]` : `{id, type:'client'|'fournisseur', nom, compteContre, compteTVA, taux, email, siren, siret, …}`.
  - `factures[]` : `{id, type:'achat'|'vente', tiersId, date, numero, taux, ht, tva, ttc, compteContre, compteTVA, ecritureId, source}`.
  - `ecritures[]` : `{id, factureId?, date, journal:'ACH'|'VTE'|'BQ'|'OD'|'ODP'|'ODTVA', libelle, piece?, lignes:[{compte, lib, debit, credit, lettre?}]}`.
  - `banque[]` : `{id, ecritureId, date, libelle, suivi(=pièce), tiersId, montant}`.
  - `reglements[]` : `{id, factureId, type, sens:'a_payer'|'a_encaisser', statut:'attente'|'partiel'|'regle', echeance, regle, restant, notes[], echelonne}`.
  - `docs[]` (documents commerciaux émis) : `{id, type:'facture'|'devis'|'avoir', clientId, date, echeance, numero, lignes[], ht, tva, ttc, statut:'brouillon'|'valide', envoye, dateEnvoi, ecritureId, devisId, transformeEn}`.
  - `propositions[]` (Assistant IA) : `{id, refType:'doc'|'achat', refId, type:'vente'|'achat', tiersId, date, libelle, ht, taux, compteContre, compteTVA, numero, sourceEntree?, confiance, statut:'a_valider'|'comptabilise'|'rejete', ecritureId?}`.
  - `relances{}` : `{ [tiersId]: {le, n} }`. Plus `catalogue, immos, emprunts, paie, plan, journaux, seq, parametres…`.

## 5. Helpers globaux réutilisables
`eur(n)`, `r2(n)`, `uid()`, `c9(code)` (code sur 9 chiffres), `frDate`, `todayStr`, `ym`, `moisLabel`, `nextNum/nextNumUnique`, `save`, `render`, `toast`, `closeModal`, `head(title,desc)`, `flow([...])`,
`calcMontants(base,taux,'HT'|'TTC')`, `posterFacture({type,tiersId,date,base,baseEst,taux,compteContre,compteTVA,numero,echeance})`, `posterBanque(...)`, `genEcriture(f)`,
`analytique()` → `{prod, charge, parClient, parFourn, ca, achats, resultat}`, `tvaDuMois(m)` → `{col, ded, aDecaisser, credit}`, `moisDisponibles()`, `statsTiers(id)`,
`sageNum(n)`, `sageCode(t)` (collectif 401/411 + 4 lettres — **affichage** : les lignes tiers sont stockées sur le **collectif** 401/411), `exoYear()`, `addAnnees(iso,n)`, `exSuivant()/exPrecedent()` (navigation d'exercice via `societe.exercices`),
`COMPTES` (libellés), `COMPTES_CHARGE`, `COMPTES_PRODUIT`, `PCG_COMPLET` (~970 comptes), `numIdentifiant(num)` (9→SIREN, 14→SIRET), `lookupSiret(q)` (API recherche‑entreprises), `tvaFromSiren`, `lookupConvention`,
`relancesData()` → `{attente[], relances[]}`, `relancerClient(tid)`, `statutTag(r)`, `dashRoute(type,name)`, `chargerDossier(id)`, `choisirDossier(id)`, `datasetVide(soc)`, `societeDefaut()`, `cabinetDefaut()`, `chargerPlanBTP()`, `voirDoc(id)`, `telechargerDoc(id)`, `peutEnvoyer(d)`, `genererEcritureDoc(id)`, `transformerDevis(id)`.

## 6. Modules (navigation)
| Section | id | Libellé | Rôle |
|---|---|---|---|
| Pilotage | `dash` | Tableau de bord | KPIs, dernières écritures, trésorerie, import de docs, 2 histogrammes 12 mois |
| Pilotage | `societe` | Sociétés (portefeuille) | Liste des dossiers du cabinet |
| **Espace Client** | `client` | **Espace Client** | Chiffres clés, dépôt de pièces (→OCR/IA), devis & factures, relances/encours, suivi par client |
| Référentiel | `tiers` | Tiers (clients/fournisseurs) | Fiches + règles d'affectation ; lookup SIRET ; saisie société obligatoire pour client société |
| Ventes | `facturation` | Facturation client | Nouvelle facture, **cycle de vie** (attente→validé→envoyé🔒, suppression, lot), liste **Factures** (transfert ⚙ Générer), suivi ventes, envoyées, saisie rapide, catalogue, **Facturation électronique — opérateur relié (PPF/PDP) + Factur-X** |
| Achats | `achats` | Factures fournisseurs (OCR) | Capture manuelle/scan/OCR ; scan/OCR → **Assistant IA** ; liste allégée ; **panneau IA fournisseurs** embarqué |
| Comptabilité | `compta` | Consultation des comptes | Style Sage ; **double‑clic compte → éditeur d'écritures façon Sage** (cf. §7) |
| Comptabilité | `chargespaie` | Charges et Paie | |
| Comptabilité | `journal` | Journal comptable | Tri/filtre (ACH/VTE/BQ/OD), recherche |
| Comptabilité | `ia` | **Assistant IA (écritures)** | Propose les écritures (tiers/montant/date/TVA), vérification/correction, comptabilisation unité/lot |
| Comptabilité | `tva` | Module TVA (CA3) | CA3/CA12/franchise ; lien dépôt impots.gouv |
| Comptabilité | `editions` | Éditions | Balance, Grand livre… |
| Comptabilité | `fec` | Import / Export FEC | Import FEC → **ouvre l'exercice N ET N+1** (cf. §7) |
| Pilotage | `analytique` | Analytique & rentabilité | CA/charges, revenus & dépenses fixes récurrents |
| Trésorerie | `banque` | Banque (512) | |
| Trésorerie | `saisiebq` | Saisie journal Banque | **Édition inline** d'une écriture par double‑clic (cf. §7) |
| Trésorerie | `rappro` | Rapprochement (lettrage) | |
| Trésorerie | `reglements` | Suivi des règlements | Statuts, relances |
| Immobilisations | `immos` | Immobilisations & Financements | |
| Dossier | `dossier` | Société & création du dossier | Édition société, création de dossier, + **carte « Dossiers du cabinet » (Ouvrir / Supprimer)** |
| Dossier | `infosociete` | Informations société | Fiche complète (champs `is-*`) |
| Dossier | `coffre` | Coffre‑fort identifiants | |
| Dossier | `parametrage` | Paramétrage & plan comptable | |

## 7. Fonctionnalités clés ajoutées (addons 10→20)
- **Éditeur d'écritures par compte façon Sage** (addon11) — double‑clic sur un compte en **Consultation** ouvre un overlay `#ec-overlay` « Compte auxiliaire » (barre titre, menus, colonnes Date·Jnl·Pièce·Compte·Libellé·Débit·Crédit·**Solde courant**·L). Édition des lignes, ajout/retrait, **équilibrage obligatoire** (notification : compte d'attente 471 **ou** sélection du bon compte), **ligne rouge sous chaque écriture soldée**. **Ciblage par tiers** quand on clique un auxiliaire (sinon collectif). Fonctions : `ouvrirEcrituresCompte(code)`, `ecRender`, `ecSetLine/ecAddLine/ecDelLine/ecSolder/ecNotifSolde/ecCompteAttente/ecSolderSur`.
- **Saisie journal Banque — édition inline simplifiée** (addon12) — double‑clic sur une écriture → cases modifiables **sur place** (sans bordure, rien ne se déplace, pas de ligne/bouton ajouté), enregistrement auto à la sortie de case, re‑double‑clic pour terminer. `sjRenderEcr/sjRowsEdit/sjEdit/sjSaveFields`.
- **Facturation — cycle de vie & lot** (addon13) — `documentsClientsCard()` : en attente de validation → validé → envoyé🔒 (verrouillé), **suppression seul moyen de retirer** (retire doc+écriture+facture+règlement), **valider/envoyer en lot**. `validerDoc/validerLot/envoyerLot/supprimerDoc/docEtatTag`.
- **Assistant IA — écritures** (addon14, page `ia`) — `iaProposerDepuisDoc`, `iaSync` (propositions auto depuis docs clients en attente), `iaProposerAchat` (depuis formulaire achats), `iaPreview`, `iaComptabiliser/iaRejeter/iaToutComptabiliser`. Correction des champs + aperçu en direct.
- **Achats → IA + liste allégée** (addon15) — `acAction()` (mode manuel : Valider + Proposer IA ; mode scan/OCR : **Envoyer à l'Assistant IA** via `ocrVersIA()`), `suiviFacturesAchat()` allégée (7 colonnes).
- **Création de dossier depuis l'accueil** (addon16) — `ouvrirCreationDossier()` : formulaire **fiche complète** + lookup SIREN/SIRET + **dépôt K‑bis & Statuts obligatoires** → `creerDossierComplet()` crée le dossier (plan BTP) et l'ouvre.
- **Suppression de dossier** (addon17) — `dossiersGestionCard()` dans la page Dossier + `supprimerDossier(id)` (gère le dossier actif → retour accueil).
- **Panneau IA fournisseurs embarqué** (addon18) — `iaFournisseursCard()` greffé en bas d'`pageAchats`.
- **Espace Client** (addon19, page `client`) — `pageEspaceClient()` : chiffres clés + trésorerie, dépôt de pièces (`dashRoute`), mes devis & factures, `relancesCard()`, suivi par client (`ecTresorerie/ecEncoursParClient`).
- **Mode Client séparé** (addon26, greffes `ecranSelectionDossier`/`buildNav`/`render`/`retourSelectionDossier`/`dashRoute`) — rôle de session `window.sessionRole` (`cabinet`|`client`). Écran de connexion : bouton « 👤 Accès client » → `selClientMode` → cartes ouvrant via `choisirDossierClient()`. En mode client : navigation réduite à « Mon espace », `current` forcé sur `client`, actions cabinet masquées dans `.side-foot` (export/import/reset), « Changer de dossier » → `quitterEspaceClient()`. `db.body[data-role]` posé.
- **Messagerie client ↔ cabinet + pièces demandées** (addon27, dans `pageEspaceClient`) — `messagerieCard()` adaptée au rôle : fil de discussion (`msgEnvoyer`, `db.parametres.messages`) + pièces demandées (`demAjouter/demBascule/demSupprimer`, `db.parametres.demandes`). Le cabinet demande des pièces ; le client répond, dépose via la GED et marque « fournie ».
- **GED — dépôt glisser-déposer de vrais fichiers** (addon24, dans `pageEspaceClient`) — carte « Pièces du dossier (GED) » : zone de drop réelle (`gedDrop/gedFile`) qui stocke les PDF/photos en dataURL dans `db.parametres.pieces` (persisté + isolé par dossier), liste avec `gedVoir/gedTelecharger/gedSupprimer`. Fiabilise aussi les zones de dépôt du tableau de bord (`dashDrop/dashFile` archivent réellement le fichier).
- **Éditeur Sage — filtre / tri** (addon25, greffe `ecEcritures`+`ecRender`) — barre `.ec-filtbar` injectée sous la barre d'outils : champ de filtre plein texte (date/journal/pièce/compte/libellé/lettre via `ecSetFiltre`) + tri par date (`ecToggleSort`). Filtre réinitialisé à l'ouverture d'un compte.
- **Pièces légales — ouvrir/joindre K-bis & Statuts** (addon21, dans `pageInfoSociete`) — carte « Pièces légales du dossier » : `ouvrirKbis()/ouvrirStatuts()` (visualisation du PDF stocké en dataURL via `window.open`+iframe) et `joindreKbis()/joindreStatuts()` (FileReader → `db.societe.kbisPdf/statutsPdf`). Insérée juste avant la carte « Enregistrer ».
- **Pastille compteur menu « Assistant IA »** (addon22, greffe `buildNav`) — badge `.ia-badge` ajouté sur l'entrée IA du menu, comptant les `db.propositions` au statut `a_valider`.
- **Sélecteur d'exercice visible** (addon23, greffe `head()`) — encart `.exo-sel` dans l'en-tête de page (Exercice AAAA + dates), boutons ‹/› reliés à `exPrecedent()/exSuivant()`.
- **Facturation électronique — opérateur relié** (addon20, dans `pageFacturation`) — `efacturationCard()` : connexion d'un opérateur agréé **PPF/PDP** (`efactCfg/efactConnecter/efactDeconnecter`), **transmission** au format **Factur-X** (`efactTransmettre`), **cycle de vie** (Déposée→Émise→Mise à disposition→Approuvée→Encaissée, branche Refusée — `efactAvancer/efactRefuser`), **flux horodaté** (`efactFlux`), **Factur-X (XML CII) téléchargeable** (`efactXML`). Config dans `db.parametres.efact`, statut par facture dans `doc.efact`. Simulation hors‑ligne ; Factur-X représentatif.
- **Import FEC multi‑exercice** — un FEC année N crée le dossier avec **exercices N et N+1** (`exercices:[N, N+1]`), bascule N+1 sans re‑création.
- **Sauvegarde automatique** — `save()` → `localStorage`, rechargé à l'INIT.

## 8. Pistes proposées (non faites)
- Lettrage interactif (colonne L) dans l'éditeur Sage.
- Variante **IA en ligne réelle** (lecture PDF/photo via API + clé) pour pré‑remplir automatiquement.
- Cas FEC inverse (N → ouvrir aussi N‑1 pour les À‑nouveaux).

> ✅ **Faits (quick wins, addons 21→23)** : bouton « Ouvrir/Joindre K‑bis & Statuts » dans la fiche société · pastille compteur sur l'entrée « Assistant IA » du menu · sélecteur d'exercice visible dans l'en‑tête.
> ✅ **Faits (confort, addons 24→25)** : dépôt glisser‑déposer de vrais fichiers (GED dossier) · filtre/tri dans la barre d'outils de l'éditeur Sage.
> ✅ **Faits (gros chantiers, addons 26→27)** : accès « mode Client » séparé (navigation réduite, actions cabinet masquées) · messagerie client ↔ cabinet + pièces demandées/fournies.

## 9. À dire en début de nouvelle conversation
> « Je reprends le projet YADA/Précompta (fichier unique `precompta.html` ci‑joint). Voici le document de passation. Continue en repartant de MON fichier, par ajouts chirurgicaux sans rien casser, en validant via node --check + Playwright sur les 2 démos. »
