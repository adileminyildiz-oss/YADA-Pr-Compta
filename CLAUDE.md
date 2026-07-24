# CLAUDE.md — YADA PRO

> Lu automatiquement par Claude Code au lancement. **Source de vérité : `index.html`**
> (application mono-fichier, autonome, hors-ligne / PWA).

---

## 🟢 État actuel — YADA PRO v0.1 (nouveau projet)

Nouveau départ, sans lien de code avec l'ancien « Précompta ». L'ancienne application complète
(494 versions) reste sauvegardée sur la branche **`archive/yada-v494`** (récupérable).

**YADA PRO = hub de factures.** Priorité actuelle : **créer des factures de vente avec plusieurs
thèmes d'habillage**.

### Ce qui fonctionne (`index.html`)
- **Coquille** : barre latérale (Tableau de bord · Envoyer · Réceptionner · Contacts) + contenu, responsive. Thème bleu nuit + Crystal.
- **Contacts** : ajout de clients / fournisseurs (nom, type, e-mail), répertoire.
- **Envoyer (factures de vente)** :
  - formulaire : client, date, échéance, **lignes** (désignation, qté, PU HT, TVA %), totaux HT/TVA/TTC en direct ;
  - **sélecteur de thème** : `Classique`, `Bandeau`, `Émeraude`, `Indigo`, `Minimal` (modèles visuels distincts) ;
  - numérotation auto `FAC-AAAA-NNNN` ; liste des factures émises ;
  - **Aperçu** (modale, thème changeable à la volée), **PDF** (impression via `@media print`), **Envoyer** (e-mail `mailto` pré-rempli, statut « envoyée »).
- **Réceptionner** *(différé, mais présent)* : dépôt/import d'une facture reçue (PDF/photo, glisser-déposer), fournisseur/date/montant/statut, boîte de réception.
- **PWA** : `manifest.webmanifest` + `sw.js` (cache `yada-pro-v1`, réseau d'abord), installable.
- Badge `YADA PRO · v0.1` ; `<meta name="yada-version" content="0.1.0">`.

### Modèle de données (localStorage clé `yadapro`)
`{ contacts:[{id,nom,type,email}], emises:[{id,numero,contactId,date,ech,theme,lignes,ht,tva,ttc,statut,dateEnvoi}], recues:[{id,fournisseur,date,montant,statut,nomFichier,fichier}], seq:{fac} }`

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
Envoi/réception e-mail réellement automatiques (nécessite un service externe/backend), catalogue
d'articles, remises/acomptes, devis→facture, export comptable, informations émetteur paramétrables.
