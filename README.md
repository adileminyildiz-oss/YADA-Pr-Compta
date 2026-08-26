# YADA / Précompta

Application web de **pré‑comptabilité française** (style Sage/Regate) pour cabinet comptable — **un seul fichier HTML autonome**, qui fonctionne **hors‑ligne** dans le navigateur, sans installation ni serveur.

## Démarrage rapide
1. Téléchargez `precompta.html`.
2. **Double‑cliquez** dessus → il s'ouvre dans votre navigateur (Chrome, Edge, Firefox, Safari).
3. Sur l'écran d'accueil : ouvrez un dossier de démonstration (**AMA** ou **SCI DU 42**) ou créez le vôtre.

> Les données sont **sauvegardées automatiquement** dans le navigateur (localStorage). Pour transférer vos données vers un autre poste : bouton **« Exporter les données »** (fichier `.json`) puis **« Importer »** ailleurs.

## Fonctionnalités
- **Dossiers multi‑sociétés** (portefeuille cabinet), création de dossier avec fiche complète + dépôt K‑bis / Statuts, suppression de dossier.
- **Facturation client** : devis / factures / avoirs, cycle de vie (en attente → validé → envoyé verrouillé), suppression, validation & envoi **en lot**, transfert en comptabilité.
- **Factures fournisseurs (OCR)** : saisie manuelle, scan / OCR → **Assistant IA**, liste allégée.
- **Assistant IA — écritures** : propose l'écriture (tiers, montant, date, libellé, TVA), vérification/correction, comptabilisation à l'unité ou en lot.
- **Comptabilité** : consultation des comptes avec **éditeur d'écritures façon Sage** (double‑clic), journal (tri/filtre), **TVA (CA3)**, éditions (balance, grand livre), **import/export FEC** (un FEC année N ouvre les exercices N **et** N+1).
- **Trésorerie** : banque, saisie journal banque avec **édition inline**, rapprochement/lettrage, suivi des règlements + relances.
- **Espace Client** : chiffres clés, dépôt de pièces, devis & factures, encours & relances, suivi par client.
- **3 thèmes** (noir / liquide clair / liquide teinté).

## Architecture (résumé)
Tout le code est dans le fichier `precompta.html` (logique + UI dans des `<script>`). Les évolutions sont ajoutées par **scripts d'extension** (`yada-addon…`) injectés avant `</body>`, sans réécrire l'existant. Voir **`PASSATION-YADA-Precompta.md`** et **`CLAUDE.md`** pour le détail (modèle de données, modules, helpers, méthode de validation).

## Développer avec Claude Code
Ce dépôt contient un **`CLAUDE.md`** : ouvrez le dossier avec [Claude Code](https://code.claude.com/docs/en/setup) (`claude`) et il chargera automatiquement le contexte et les règles du projet.

## Licence
Projet privé — à adapter selon votre choix (ex. MIT) si vous le rendez public.
