# YADA — couche serveur Supabase (`@supabase/server`)

> ⚠️ **Séparé du site.** YADA (`../precompta.html`) est une **PWA statique** déployée sur
> **GitHub Pages**, qui synchronise déjà Supabase **côté navigateur** (clé anon + RLS +
> chiffrement de bout en bout, **sans clé secrète**). Ce dossier `server/` ajoute une
> **couche serveur** optionnelle ; elle **ne se déploie pas sur GitHub Pages** (Pages ne
> sert que des fichiers statiques) et nécessite un **runtime Node ou Supabase Edge Functions**.

## Sécurité
- La **clé secrète** (`SUPABASE_SECRET_KEY`, ex-`service_role`) **bypasse la RLS** :
  elle ne vit **que** dans les variables d'environnement du serveur, **jamais** dans le
  code client ni dans le dépôt. `.env` est git-ignoré ; ne committez que `.env.example`.

## Variables d'environnement
Copiées depuis le dialogue **Connect** du tableau de bord Supabase :
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`  *(serveur uniquement)*
- `SUPABASE_JWKS_URL`  *(vérification des JWT utilisateurs)*

## Lancer en local
```bash
npm install
cp .env.example .env   # puis collez vos vraies valeurs
node --env-file=.env index.mjs
# → http://localhost:8787  (requiert un JWT utilisateur : Authorization: Bearer <token>)
```

## Modes d'authentification (`withSupabase({ auth })`)
- `"user"` — JWT utilisateur valide (par défaut ici), vérifié via `SUPABASE_JWKS_URL`.
- `"publishable"` — clé publishable. · `"secret"` — clé secrète. · `"none"` — aucune.
- `ctx.supabase` = client **RLS-scoped** ; `ctx.supabaseAdmin` = client **admin (bypass RLS)**.

## Déploiement Supabase Edge Functions (recommandé pour ce SDK)
Sur Edge Functions, les variables ci-dessus sont **injectées automatiquement**.
Pour les modes d'auth autres que `"user"`, mettez `verify_jwt = false` pour la fonction
dans `supabase/config.toml`.

## Lien avec YADA
Cette couche peut servir d'**API d'écriture sécurisée** : au lieu d'écrire directement
dans `yada_sync` avec la clé anon, le client pourrait POSTer ici avec un **JWT utilisateur**,
le serveur validant l'auth puis écrivant via `ctx.supabase` (RLS) ou `ctx.supabaseAdmin`.
**Non câblé** au client pour l'instant (la synchro navigateur reste fonctionnelle telle quelle).
