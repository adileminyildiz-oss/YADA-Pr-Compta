# CLAUDE.md — YADA PRO

> Lu automatiquement par Claude Code au lancement. **Source de vérité : `index.html`**
> (application mono-fichier, autonome, hors-ligne / PWA).

---

## 🟢 État actuel — YADA PRO v0.1 (nouveau projet)

Nouveau départ, sans lien de code avec l'ancien « Précompta ». L'ancienne application complète
(494 versions) reste sauvegardée sur la branche **`archive/yada-v494`** (récupérable).

**YADA PRO = hub de factures multi-société** (Facturation · Suivi · Gestion de société).

### Ce qui fonctionne (`index.html`)
- **Coquille** : barre latérale (**sélecteur de société active** + Tableau de bord · Envoyer · Réceptionner · Contacts · Sociétés) + contenu, responsive. Thème bleu nuit + Crystal.
- **Sociétés (multi-société)** : enregistrer/éditer plusieurs sociétés (nom, adresse, SIRET, TVA, e-mail, tél, IBAN, **logo**), **société active** (bascule). Chaque société a **sa propre facturation** (numérotation dédiée `soc.seq`), son **émetteur** (affiché sur la facture), son **format par défaut** (thème) et un éventuel **format importé** (modèle HTML avec balises `{{…}}` remplies par `renderCustomFormat`, modèle d'exemple téléchargeable). `factureHTML(f)` utilise la société de la facture (`societeOf(f)`).
- **Suivi (paiements)** : par société, statut de paiement par facture (**à encaisser / partielle / payée / en retard** si échéance dépassée — `factPaie(f)`), **encaissements** (montant + date, `factEncaisser`), **reste dû**, **relance** e-mail (`factRelance`), filtres (toutes/à encaisser/en retard/payées), KPIs facturé/encaissé/reste dû. Tableau de bord enrichi (CA facturé, encaissé, reste dû, en retard).
- **Catalogue d'articles** : produits/prestations réutilisables (désignation, unité, PU HT, TVA). Insertion d'une ligne de facture en 1 clic depuis « Envoyer » → « Depuis le catalogue » (`emCatalogue`/`emAjoutCat`) ; enregistrement des lignes saisies vers le catalogue (`emLignesToCat`).
- **Contacts** : ajout de clients / fournisseurs (nom, type, e-mail), répertoire.
- **Envoyer (factures de vente)** :
  - **type de document** : **facture / devis / avoir** (numérotation `FAC`/`DEV`/`AV`, avoir en négatif) ; **devis → facture** en un clic (`transformerDevis`) ;
  - formulaire : client (+ **ajout rapide** de client), date, **conditions** (comptant/30/45/60 j) → **échéance auto**, **lignes** (désignation, qté, PU HT, TVA %), **remise** (€/%), **acompte** → **net à payer**, totaux en direct ;
  - **sélecteur de thème** : `Classique`, `Bandeau`, `Émeraude`, `Indigo`, `Minimal` (modèles visuels distincts) ;
  - **Aperçu en direct** de la facture dans le thème choisi (panneau à côté du formulaire, `#em-preview`, `zoom` CSS) ;
  - numérotation auto `FAC-AAAA-NNNN` ; **liste** des factures émises avec **recherche** (n°/client), colonne **Thème**, **Dupliquer** et **Supprimer** ;
  - **Aperçu** (modale, thème changeable à la volée), **PDF** (impression via `@media print`), **Envoyer** (e-mail `mailto` pré-rempli, statut « envoyée »).
- **Données** : **export CSV** des ventes et des encaissements (société active, séparateur « ; », BOM Excel — `exportVentesCSV`/`exportEncaissementsCSV`), **sauvegarde JSON** (`sauvegardeJSON`) et **restauration** (`restaurerJSON`, remplace `db`, re-migration).
- **Réceptionner (achats/dépenses)** : dépôt/import d'une facture reçue (PDF/photo, glisser-déposer), fournisseur/date/**montant TTC**/**dont TVA**/**catégorie**/statut, boîte de réception. Résumé achats (total dépenses, TVA déductible). Le **tableau de bord** affiche une carte **TVA & dépenses** (TVA collectée sur ventes − TVA déductible sur achats = à reverser).
- **PWA** : `manifest.webmanifest` + `sw.js` (cache `yada-pro-v1`, réseau d'abord), installable.
- Badge `YADA PRO · v0.1` ; `<meta name="yada-version" content="0.1.0">`.

### Modèle de données (localStorage clé `yadapro`)
`{ societes:[{id,nom,adresse,siret,tva,email,tel,iban,logo,theme,customFormat,seq}], societeActive, contacts:[{id,nom,type,email}], emises:[{id,type('facture'|'devis'|'avoir'),numero,societeId,contactId,date,ech,cond,theme,lignes,remiseType,remiseVal,htBrut,remise,ht,tva,ttc,acompte,net,encaissements:[{montant,date}],statut,dateEnvoi,transformeEn}], recues:[{id,fournisseur,date,montant,tva,categorie,statut,nomFichier,fichier}], catalogue:[{id,desc,unite,pu,taux}], seq:{fac} }`
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
(activer le module Réceptionner), fiche client enrichie (adresse, historique), export FEC, statistiques de vente.
