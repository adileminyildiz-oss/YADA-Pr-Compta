# CLAUDE.md — YADA PRO

> Lu automatiquement par Claude Code au lancement. **Source de vérité : `index.html`**
> (application mono-fichier, autonome, hors-ligne / PWA).

---

## 🟢 État actuel — YADA PRO v0.1 (nouveau projet)

Nouveau départ, sans lien de code avec l'ancien « Précompta ». L'ancienne application complète
(494 versions) reste sauvegardée sur la branche **`archive/yada-v494`** (récupérable).

**YADA PRO = hub de factures multi-société** (Facturation · Suivi · Gestion de société).

### Ce qui fonctionne (`index.html`)
- **Coquille** : barre latérale (**sélecteur de société active** + Tableau de bord · Envoyer · Réceptionner · Contacts · Sociétés) + contenu, **responsive** (mobile : barre du haut sticky = marque + société + **nav horizontale scrollable** `.nav-list`, cartes empilées, aperçu facture `zoom .46`). **Design « Minimaliste »** (v3.5, allégé) : monochrome encre-sur-blanc, fond gris chaud très clair (`--bg:#f7f7f6`), surfaces blanches, **cartes plates** (bordure fine `--line`, **sans ombre** `--shadow:none`), accent = **encre** (`--accent:#1a1a1a` : boutons primaires noirs, onglet/filtre actif noir), beaucoup d'air (grand padding/gaps), zéro dégradé, typo sans-serif simple. Seule couleur : sémantique discrète (encaissé vert, reste dû/retard brique, échéance ambre). L'aperçu/document de facture reste sur fond blanc (papier). Toute la charte passe par les tokens CSS `:root` (couleurs, `--radius`, `--shadow`) — les thèmes de **facture** (`.inv.*`) restent indépendants et inchangés.
- **Sociétés (multi-société)** : enregistrer/éditer plusieurs sociétés (nom, adresse, SIRET, TVA, e-mail, tél, IBAN, **logo**), **société active** (bascule). Chaque société a **sa propre facturation** (numérotation dédiée qui **repart à 0001 chaque année** — `nextNum` calcule le compteur à partir du plus grand numéro existant de l'année en cours pour la société, insensible aux suppressions/imports), son **émetteur** (affiché sur la facture), son **format par défaut** (thème) et un éventuel **format importé** (modèle HTML avec balises `{{…}}` remplies par `renderCustomFormat`, modèle d'exemple téléchargeable). Paramétrage par société : **préfixe de numérotation** (`AMA-FAC-2026-0001`), **conditions de paiement par défaut** (`condDefaut`, appliquées à la création), **mentions légales** (pied de facture), **devise par défaut**, **modèle d'e-mail de relance** (objet + corps). **Duplication** d'une société (`socDupliquer`). `factureHTML(f)` utilise la société de la facture (`societeOf(f)`).
- **Suivi (paiements)** : par société, statut de paiement par facture (**à encaisser / partielle / payée / en retard** si échéance dépassée — `factPaie(f)`), **encaissements** (montant + date, `factEncaisser`), **reste dû**, **relance** e-mail (`factRelance`, **modèle paramétrable par société** — objet + corps avec balises `{{client}}` `{{numero}}` `{{echeance}}` `{{reste}}` `{{ttc}}` `{{societe}}` `{{jours}}`, `relanceRemplir`/`relanceVars` ; modèle standard si vide), filtres (toutes/à encaisser/**à échoir ≤7j**/en retard/payées), **jours avant échéance** (`joursEch`, badge « dans N j »), KPIs facturé/encaissé/reste dû. Tableau de bord enrichi (CA facturé, encaissé, reste dû, en retard, **à échoir ≤7j**, priorités avec badges d’échéance), avec **filtre par période** (`dashPeriode` : tout / année / trimestre / mois en cours, `dansPeriode`/`periodeLabel`) qui scope les KPIs et la carte TVA (les listes opérationnelles restent globales).
- **Catalogue d'articles** : produits/prestations réutilisables (désignation, unité, PU HT, TVA). Insertion d'une ligne de facture en 1 clic depuis « Envoyer » → « Depuis le catalogue » (`emCatalogue`/`emAjoutCat`) ; enregistrement des lignes saisies vers le catalogue (`emLignesToCat`), duplication d'un article (`catDupliquer`). Saisie : touche Entrée sur une désignation = nouvelle ligne + focus (`emAddLigne`).
- **Contacts (fiche enrichie)** : clients / fournisseurs (nom, type, e-mail, **tél, SIREN, adresse**), ajout/**édition** (`ctEdit`), répertoire. **Fiche client** (`ficheClient`) = coordonnées + **historique des factures** (facturé/encaissé/reste dû + tableau) + **relevé de compte imprimable** (`releveImprimer`). L'**adresse + SIREN** du client apparaissent sur la facture.
- **Envoyer (factures de vente)** :
  - **type de document** : **facture / devis / avoir** (numérotation `FAC`/`DEV`/`AV`, avoir en négatif) ; **devis → facture** en un clic (`transformerDevis`) ;
  - formulaire : client (+ **ajout rapide** de client), date, **conditions** (comptant/30/45/60 j) → **échéance auto**, **lignes** (désignation, qté, PU HT, TVA %), **devise** (€/$/£/CHF/$CA), **remise** (€/%), **acompte** → **net à payer**, **moyen de règlement** + **note/commentaire** (affichés sur la facture), totaux en direct ;
  - **sélecteur de thème** : `Classique`, `Bandeau`, `Émeraude`, `Indigo`, `Minimal` (modèles visuels distincts) ;
  - **Aperçu en direct** de la facture dans le thème choisi (panneau à côté du formulaire, `#em-preview`, `zoom` CSS) ;
  - numérotation auto `FAC-AAAA-NNNN` ; **liste** des factures émises avec **recherche** (n°/client), **filtres de statut** (tous/brouillons/envoyées/payées/**archivées**, `docStatutFilt`), **tri par colonne** (numéro/client/date/TTC, `emSortSet`), colonne **Thème**, **Dupliquer**, **Archiver** (`emArchiver`) et **Supprimer** ;
  - **Aperçu** (modale, thème changeable à la volée), **PDF** (impression via `@media print`), **impression groupée** de tous les documents de la vue courante en un seul PDF (`emImprimerListe`/`emListeFiltree`, saut de page entre factures), **Envoyer** (e-mail `mailto` pré-rempli, statut « envoyée »).
- **Statistiques** : par société, KPIs (CA total, encaissé, panier moyen), **CA des 12 derniers mois** (histogramme CSS), **top clients** (barres horizontales). `pageStats`/`moisDerniers`.
- **Données** : **export CSV** des ventes et des encaissements (société active, séparateur « ; », BOM Excel — `exportVentesCSV`/`exportEncaissementsCSV`), **sauvegarde JSON** (`sauvegardeJSON`) et **restauration** (`restaurerJSON`, remplace `db`, re-migration), **téléchargement de l'application pour PC** (`telechargerApp` — récupère le HTML mono-fichier et l'enregistre en `YADA-PRO.html`, ouvrable hors-ligne par double-clic ; repli `document.documentElement.outerHTML` en `file://` ; **bouton « Installer l'app » aussi dans le pied de la barre latérale**, visible sur toutes les pages).
- **Réceptionner (achats/dépenses)** : dépôt/import d'une facture reçue (PDF/photo, glisser-déposer), fournisseur/date/**montant TTC**/**dont TVA**/**catégorie**/statut, boîte de réception (`recListe` : recherche fournisseur + filtre par catégorie). Résumé achats (total dépenses, TVA déductible). Le **tableau de bord** affiche une carte **TVA & dépenses** (TVA collectée sur ventes − TVA déductible sur achats = à reverser).
- **PWA** : `manifest.webmanifest` + `sw.js` (cache `yada-pro-v1`, réseau d'abord), installable.
- Badge `YADA PRO · v0.1` ; `<meta name="yada-version" content="0.1.0">`.

### Modèle de données (localStorage clé `yadapro`)
`{ societes:[{id,nom,adresse,siret,tva,email,tel,iban,prefixe,mentions,condDefaut,devise,logo,theme,customFormat,seq}], societeActive, contacts:[{id,nom,type,email,tel,siren,adresse}], emises:[{id,type('facture'|'devis'|'avoir'),numero,societeId,contactId,date,ech,cond,theme,devise,moyen,note,lignes,remiseType,remiseVal,htBrut,remise,ht,tva,ttc,acompte,net,encaissements:[{montant,date}],statut,archive,dateEnvoi,transformeEn}], recues:[{id,fournisseur,date,montant,tva,categorie,statut,nomFichier,fichier}], catalogue:[{id,desc,unite,pu,taux}], seq:{fac} }`
Migration au chargement : `ensureSocietes()` crée une société par défaut si besoin et rattache les factures orphelines à la société active.

## Thèmes de facture
Définis dans `THEMES` (JS). Chaque thème = une classe `.inv.th-<id>` qui surcharge des variables CSS
(`--ia` accent, `--ihbg`/`--ihtx` en-tête de tableau, layout « bandeau »). `factureHTML(f)` rend la
facture avec la classe du thème `f.theme`. Ajouter un thème = 1 entrée `THEMES` + 1 bloc CSS `.inv.th-<id>`.

## Architecture
- **Mono-fichier** `index.html`. Rendu : `render()` lit `current` et appelle `PAGES[current]()`.
- Ajouter un module : entrée dans `NAV` + fonction page + entrée dans `PAGES`.
- Persistance : `db` sérialisé par `save()` (try/catch : si quota dépassé, le fichier joint d'une facture reçue est abandonné).
- Fonctions exposées globales (classic script) : `go`, `emCreer`, `emApercu`, `emImprimer`, `emEnvoyer`, `emSetTheme`, `factureHTML`, `THEMES`, `db`, etc.

## Règles de travail
1. **Développer sur** `claude/application-mobile-yada-pb2o09`, jamais sur `main`. PR draft → `main` (déploie via GitHub Pages).
2. Ajouts chirurgicaux, UTF-8 en clair (pas de `\uXXXX`).
3. **Valider chaque modif** : `node --check` sur chaque `<script>` (0 erreur) ; accolades CSS équilibrées ; `node --check sw.js` ; **rendu réel** `node tests/smoke.mjs` (Chromium, 0 erreur de page + facture créée/rendue par thème). Local : `YADA_CHROME=/chemin/chrome node tests/smoke.mjs`.
4. Versionner : incrémenter le build (badge `#yada-ver` + `<meta name="yada-version">`).

## À venir (idées)
Envoi/réception e-mail réellement automatiques (nécessite un service externe/backend), dépenses/achats
(activer le module Réceptionner), export FEC.
