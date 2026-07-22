# CLAUDE.md — YADA 1.2 (nouveau départ)

> Ce fichier est lu automatiquement par Claude Code au lancement. Il décrit le projet, l'état
> actuel et les règles de travail. **Source de vérité : `index.html`** (application mono-fichier).

---

## 🟢 État actuel — YADA 1.2 : fondation propre (remise à zéro)

Le code accumulé des versions précédentes (application « Précompta », 494 versions, ~219 modules
d'extension dans `precompta.html`) a été **archivé puis retiré** à la demande, pour repartir sur une
base saine.

**Sauvegardes de l'ancienne version (récupérables) :**
- Branche Git **`archive/yada-v494`** (état v494 complet, sur le dépôt distant).
- Archive **`YADA-sauvegarde-v494-*.zip`** (remise à l'utilisateur).

**Ce que contient YADA 1.2 aujourd'hui (`index.html`) :**
- **Identité** YADA : logo (Y Crystal), palette bleu nuit + bleu Crystal, typographie système.
- **Coquille applicative** : barre latérale (marque + section « Modules » vide) + zone de contenu, responsive (mobile : barre en haut).
- **Noyau** : `render()` + variable `current` (routeur simple), `db` + `save()/load()` (persistance `localStorage` clé `yada12`), `PAGES`/`MODULES` prêts à être étendus.
- **Page d'accueil** « Nouveau départ » (état de la fondation + prochaines étapes).
- **PWA** : `manifest.webmanifest` + `sw.js` (réseau d'abord, hors-ligne), installable.
- Badge de version `#yada-ver` = « YADA 1.2 · build 1 » ; `<meta name="yada-version" content="1.2.0">`.

**Aucun module métier n'est encore branché** — le périmètre de YADA 1.2 est à définir.

---

## Architecture (YADA 1.2)

- **Mono-fichier** : tout (HTML/CSS/JS) dans `index.html`, autonome et hors-ligne.
- **Rendu** : `render()` lit `current` et appelle `PAGES[current]()`. Ajouter un module =
  1) l'ajouter à `MODULES` (`{id, ico, label}`) pour la barre latérale, 2) ajouter son entrée dans
  `PAGES` (`{id: fonctionPage}`). `go(id)` change de page.
- **Persistance** : `db` (objet) sérialisé dans `localStorage` par `save()`, rechargé par `load()`.
- **Extension recommandée** : garder l'esprit « ajouts chirurgicaux » — de nouveaux blocs de code
  cohérents plutôt qu'une réécriture globale, en validant à chaque étape.

## Fichiers du dépôt

- `index.html` — **l'application YADA 1.2** (source de vérité).
- `sw.js` — service worker (cache `yada-1_2-v1`).
- `manifest.webmanifest` — manifeste PWA (`start_url: ./index.html`).
- `version.json` — version (auto-alignée par la CI sur `<meta name="yada-version">`).
- `icon-192.png` / `icon-512.png` — icônes PWA.
- `tests/smoke.mjs` — filet de fumée (charge `index.html`, 0 erreur de page).
- `.github/workflows/` — CI : `tests.yml` (smoke) + `build-zip.yml` (archive + version.json).
- Docs de référence conservées : `CAHIER-DES-CHARGES.md`, `REGLES-COMPTABLES.md`, `ROADMAP.md`,
  `PASSATION-YADA-Precompta.md`, `README.md`.
- `server/`, `supabase/` — backend de synchro **hérité** de l'ancienne version (non branché en 1.2).

## Règles de travail

1. **Développer sur la branche dédiée** `claude/application-mobile-yada-pb2o09`, jamais directement
   sur `main`. PR (draft) vers `main` pour déployer (GitHub Pages).
2. **Ajouts chirurgicaux**, sans casser l'existant. UTF-8 en clair (accents/emoji), pas de `\uXXXX`.
3. **Valider chaque modification** :
   - `node --check` sur chaque `<script>` d'`index.html` (0 erreur) ;
   - accolades CSS équilibrées ; balises `</head>`/`</body>`/`</html>` uniques ;
   - **rendu réel** via Playwright / `node tests/smoke.mjs` (Chromium) → 0 erreur de page.
   - Local : `YADA_CHROME=/chemin/chrome node tests/smoke.mjs`.
4. **Versionner** : à chaque évolution, incrémenter le build (badge `#yada-ver` + `<meta name="yada-version">`).

## Démarrage attendu d'une session

« Lis ce CLAUDE.md et `index.html`. YADA 1.2 est une fondation propre : continue par ajouts
chirurgicaux (nouveaux modules dans `MODULES`/`PAGES`), en validant par `node --check` + un smoke
Playwright. Le périmètre fonctionnel est à définir avec l'utilisateur. »
