import { withSupabase } from "@supabase/server";
import { createServer } from "node:http";

/* ============================================================
   Proxy de synchronisation YADA (couche serveur Supabase).
   SÉPARÉ du site statique GitHub Pages : à déployer sur un runtime
   Node (Render / Railway / Fly / VPS) ou Supabase Edge Functions.

   Pourquoi : le client (precompta.html) peut envoyer/recevoir l'espace
   de synchro SANS connaître la clé secrète Supabase. La clé secrète
   (service_role, qui bypasse la RLS) ne vit QUE dans l'environnement
   du serveur — jamais dans le navigateur, jamais committée.

   Endpoints (Web API standard) :
     GET  /health              → { ok:true }
     GET  /sync?espace=<clé>    → [ { data, ts, enc } ]  (0 ou 1 élément)
     POST /sync                 → upsert { espace, data, ts, enc }

   Auth : "none" (l'app a sa propre porte d'authentification). Un jeton
   partagé OPTIONNEL (YADA_API_TOKEN) peut être exigé via l'en-tête
   Authorization: Bearer <jeton> pour fermer l'accès au proxy.
   ============================================================ */

const TABLE = process.env.YADA_TABLE || "yada_sync";
const API_TOKEN = process.env.YADA_API_TOKEN || ""; // optionnel : jeton partagé
const CORS = {
  "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Max-Age": "86400",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function tokenOK(req) {
  if (!API_TOKEN) return true; // pas de jeton configuré → accès ouvert
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return !!m && m[1] === API_TOKEN;
}

/* withSupabase gère la CORS preflight (OPTIONS) et crée le contexte.
   auth:"none" → toute requête est acceptée ; on s'appuie sur ctx.supabaseAdmin
   (clé secrète) pour lire/écrire en contournant la RLS. */
const app = {
  fetch: withSupabase({ auth: "none", cors: CORS }, async (req, ctx) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/health" || path === "/") {
      return json({ ok: true, service: "yada-sync", ts: Date.now() });
    }

    if (!tokenOK(req)) {
      return json({ error: "Jeton invalide ou manquant." }, 401);
    }

    if (path === "/sync" && req.method === "GET") {
      const espace = url.searchParams.get("espace");
      if (!espace) return json({ error: "Paramètre « espace » requis." }, 400);
      const { data, error } = await ctx.supabaseAdmin
        .from(TABLE)
        .select("data, ts, enc")
        .eq("id", espace)
        .limit(1);
      if (error) return json({ error: error.message }, 400);
      return json(data || []);
    }

    if (path === "/sync" && req.method === "POST") {
      let body;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Corps JSON invalide." }, 400);
      }
      const espace = body && body.espace;
      if (!espace || body.data == null) {
        return json({ error: "Champs « espace » et « data » requis." }, 400);
      }
      const row = {
        id: espace,
        data: String(body.data),
        ts: Number(body.ts) || Date.now(),
        enc: body.enc ? 1 : 0,
        updated_at: new Date().toISOString(),
      };
      const { error } = await ctx.supabaseAdmin
        .from(TABLE)
        .upsert(row, { onConflict: "id" });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, ts: row.ts });
    }

    return json({ error: "Route inconnue." }, 404);
  }),
};

export default app;

/* --- Adaptateur Node pour exécution autonome : `node --env-file=.env index.mjs`
   Sur Supabase Edge Functions, ce bloc est inutile (le runtime appelle `fetch`
   et injecte SUPABASE_URL / SUPABASE_SECRET_KEY automatiquement ; pensez à
   verify_jwt = false dans supabase/config.toml car l'auth n'est pas "user"). */
if (process.env.YADA_LOCAL_SERVER !== "0") {
  const port = process.env.PORT || 8787;
  createServer(async (nreq, nres) => {
    try {
      const url = "http://" + (nreq.headers.host || "localhost") + nreq.url;
      const method = nreq.method || "GET";
      const hasBody = method !== "GET" && method !== "HEAD";
      const body = hasBody ? await readBody(nreq) : undefined;
      const request = new Request(url, { method, headers: nreq.headers, body });
      const response = await app.fetch(request);
      nres.statusCode = response.status;
      response.headers.forEach((v, k) => nres.setHeader(k, v));
      nres.end(Buffer.from(await response.arrayBuffer()));
    } catch (e) {
      nres.statusCode = 500;
      nres.end(String((e && e.message) || e));
    }
  }).listen(port, () =>
    console.log("YADA Supabase sync proxy → http://localhost:" + port)
  );
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (d) => chunks.push(d));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
