# Déployer la synchro YADA en Supabase Edge Function

> Résultat : une URL `https://<ref>.functions.supabase.co/yada-sync` que vous
> collez dans YADA (Paramétrage → 🖧 Serveur YADA). La clé secrète reste sur
> Supabase, jamais dans le navigateur.

## 0. Pré-requis SQL (une fois)
Dans **SQL Editor** du tableau de bord Supabase :
```sql
create table if not exists yada_sync (
  id text primary key, data text, ts bigint, enc int default 0,
  updated_at timestamptz default now()
);
alter table yada_sync add column if not exists enc int default 0;
```

## Option A — Tableau de bord (le plus simple, sans rien installer)
1. Supabase → **Edge Functions** → **Create a new function**.
2. Nom : **`yada-sync`**.
3. **Important** : décochez / désactivez **« Verify JWT »** (la fonction doit être publique ;
   l'auth est gérée par YADA).
4. Collez le contenu de **`index.ts`** (ce dossier) dans l'éditeur, puis **Deploy**.
5. (Optionnel) **Edge Functions → Secrets** : ajoutez `YADA_API_TOKEN` (un mot de passe au
   choix) pour fermer l'accès, et/ou `ALLOW_ORIGIN` = l'URL exacte de votre site.
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` sont **déjà injectées**.
6. URL de la fonction : **`https://<ref>.functions.supabase.co/yada-sync`**
   (test : ouvrez `…/yada-sync/health` → `{ "ok": true }`).

## Option B — CLI Supabase
```bash
supabase login
supabase link --project-ref <VOTRE-REF>
supabase functions deploy yada-sync --no-verify-jwt
# secrets optionnels :
supabase secrets set YADA_API_TOKEN=monjeton ALLOW_ORIGIN=https://adileminyildiz-oss.github.io
```

## Dans YADA (sur chaque appareil)
**Paramétrage → ☁ Synchronisation → 🖧 Serveur YADA** :
- **URL du serveur** = `https://<ref>.functions.supabase.co/yada-sync`
- **Jeton partagé** = la valeur de `YADA_API_TOKEN` (si vous en avez défini un, sinon vide)
- Gardez la **même clé d'espace** partout · cochez **Activer** · **Tester la connexion** → OK ✓

Laissez l'URL du serveur **vide** pour revenir au mode Supabase direct (sans serveur).
