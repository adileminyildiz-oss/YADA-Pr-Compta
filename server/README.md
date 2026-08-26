# YADA — proxy de synchronisation Supabase (`@supabase/server`)

> ⚠️ **Séparé du site.** YADA (`../precompta.html`) est une **PWA statique** déployée sur
> **GitHub Pages**. Ce dossier `server/` est une **couche serveur optionnelle** : elle
> **ne se déploie pas sur GitHub Pages** (Pages ne sert que des fichiers statiques) et
> nécessite un **runtime Node** (Render, Railway, Fly, VPS…) ou **Supabase Edge Functions**.

## À quoi ça sert
Le client peut synchroniser **sans connaître la clé secrète Supabase** : il appelle ce
serveur, qui détient seul la clé secrète et lit/écrit la table `yada_sync`. Sans serveur,
le client sait déjà synchroniser **en direct** (clé anon + RLS + chiffrement de bout en
bout) — ce proxy sert à **masquer totalement la clé** et centraliser les écritures.

## Endpoints
| Méthode | Route | Rôle |
|--------|-------|------|
| `GET`  | `/health` | sonde de vie `{ ok:true }` |
| `GET`  | `/sync?espace=<clé>` | renvoie `[{ data, ts, enc }]` (0 ou 1 élément) |
| `POST` | `/sync` | upsert `{ espace, data, ts, enc }` |

La CORS (préflight `OPTIONS`) est gérée automatiquement par `withSupabase`.

## Sécurité
- La **clé secrète** (`SUPABASE_SECRET_KEY`, ex-`service_role`, qui **bypasse la RLS**) vit
  **uniquement** dans les variables d'environnement du serveur — **jamais** dans le code
  client ni dans le dépôt. `.env` est git-ignoré ; ne committez que `.env.example`.
- Jeton partagé optionnel **`YADA_API_TOKEN`** : si défini, chaque requête `/sync` doit
  porter `Authorization: Bearer <jeton>` (à coller aussi côté client, Paramétrage → Serveur YADA).
- Restreignez la CORS avec **`ALLOW_ORIGIN`** = l'URL exacte de votre site.

## Variables d'environnement
Copiées depuis le dialogue **Connect** du tableau de bord Supabase (voir `.env.example`) :
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` *(serveur uniquement)*,
`SUPABASE_JWKS_URL`, plus les options `YADA_TABLE`, `YADA_API_TOKEN`, `ALLOW_ORIGIN`, `PORT`.

## Pré-requis Supabase (une fois)
Dans **SQL Editor**, créez la table de synchro (idempotent) :
```sql
create table if not exists yada_sync (
  id text primary key, data text, ts bigint, enc int default 0,
  updated_at timestamptz default now()
);
alter table yada_sync add column if not exists enc int default 0;
```
La RLS n'est pas requise pour le proxy (il utilise la clé secrète qui la contourne) ;
laissez la table sans policy `anon` si vous n'utilisez QUE le serveur.

## Lancer en local
```bash
npm install
cp .env.example .env   # puis collez vos vraies valeurs
node --env-file=.env index.mjs
# → http://localhost:8787   (test : curl http://localhost:8787/health)
```
Ensuite, dans YADA (**Paramétrage → Synchronisation → Serveur YADA**), renseignez
l'**URL du serveur** (et le jeton si configuré) ; laissez ce champ **vide** pour rester
en mode Supabase direct.

## Déployer (Node)
Sur Render / Railway / Fly : déployez ce dossier, commande de démarrage `node index.mjs`,
et déclarez les variables d'environnement ci-dessus. Récupérez l'URL publique → à coller
dans YADA.

## Déployer (Supabase Edge Functions)
Sur Edge Functions, `SUPABASE_URL` / `SUPABASE_SECRET_KEY` sont **injectées
automatiquement**. L'auth n'étant pas `"user"`, mettez **`verify_jwt = false`** pour la
fonction dans `supabase/config.toml`. (L'adaptateur Node en bas d'`index.mjs` est ignoré :
le runtime appelle directement `app.fetch`.)

## Modes d'authentification (`withSupabase({ auth })`)
Ce proxy utilise `"none"` (l'app a sa propre porte d'auth) et s'appuie sur
`ctx.supabaseAdmin` (clé secrète). Autres modes possibles : `"user"` (JWT vérifié via
`SUPABASE_JWKS_URL`), `"publishable"`, `"secret"`.
