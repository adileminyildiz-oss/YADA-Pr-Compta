// YADA — Edge Function de synchronisation (Supabase / Deno).
//
// Déployable telle quelle : sur Supabase Edge Functions, SUPABASE_URL,
// SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY sont INJECTÉES automatiquement.
// On les passe à @supabase/server via l'option `env` → AUCUN secret à coller
// à la main. La clé secrète (service_role, qui bypasse la RLS) ne quitte jamais
// le serveur Edge.
//
// Endpoints :
//   GET  /yada-sync/health              → { ok:true }
//   GET  /yada-sync/sync?espace=<clé>    → [ { data, ts, enc } ]
//   POST /yada-sync/sync                 → upsert { espace, data, ts, enc }
//
// IMPORTANT : déployer avec verify_jwt = false (voir supabase/config.toml),
// car l'auth applicative est gérée par YADA, pas par un JWT Supabase.

import { withSupabase } from "npm:@supabase/server@^1.1.0";

const TABLE = Deno.env.get("YADA_TABLE") || "yada_sync";
const API_TOKEN = Deno.env.get("YADA_API_TOKEN") || ""; // jeton partagé optionnel
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOW_ORIGIN") || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function tokenOK(req: Request): boolean {
  if (!API_TOKEN) return true;
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return !!m && m[1] === API_TOKEN;
}

// Sur Edge, les noms injectés diffèrent de ceux attendus par @supabase/server :
// on mappe explicitement via `env` (aucune variable manuelle requise).
const env = {
  url: Deno.env.get("SUPABASE_URL") || "",
  publishableKeys: { default: Deno.env.get("SUPABASE_ANON_KEY") || "" },
  secretKeys: { default: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "" },
  jwks: null,
};

const handler = withSupabase(
  { auth: "none", cors: CORS, env },
  async (req, ctx) => {
    const url = new URL(req.url);
    // Le chemin inclut le préfixe de la fonction (/yada-sync/...) : on isole la fin.
    const path = url.pathname.replace(/^\/yada-sync/, "").replace(/\/+$/, "") || "/";

    if (path === "/health" || path === "/") {
      return json({ ok: true, service: "yada-sync", ts: Date.now() });
    }
    if (!tokenOK(req)) return json({ error: "Jeton invalide ou manquant." }, 401);

    if (path === "/sync" && req.method === "GET") {
      const espace = url.searchParams.get("espace");
      if (!espace) return json({ error: "Paramètre « espace » requis." }, 400);
      const { data, error } = await ctx.supabaseAdmin
        .from(TABLE).select("data, ts, enc").eq("id", espace).limit(1);
      if (error) return json({ error: error.message }, 400);
      return json(data || []);
    }

    if (path === "/sync" && req.method === "POST") {
      let body: { espace?: string; data?: unknown; ts?: number; enc?: unknown };
      try { body = await req.json(); } catch { return json({ error: "Corps JSON invalide." }, 400); }
      if (!body?.espace || body.data == null) {
        return json({ error: "Champs « espace » et « data » requis." }, 400);
      }
      const row = {
        id: body.espace,
        data: String(body.data),
        ts: Number(body.ts) || Date.now(),
        enc: body.enc ? 1 : 0,
        updated_at: new Date().toISOString(),
      };
      const { error } = await ctx.supabaseAdmin.from(TABLE).upsert(row, { onConflict: "id" });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, ts: row.ts });
    }

    return json({ error: "Route inconnue." }, 404);
  },
);

Deno.serve(handler);
