import { withSupabase } from "@supabase/server";
import { createServer } from "node:http";

/* ============================================================
   Couche serveur Supabase pour YADA (SÉPARÉE du site statique GitHub Pages).
   withSupabase valide l'auth et fournit :
     - ctx.supabase       → client RLS-scoped (respecte les Row Level Security)
     - ctx.supabaseAdmin  → client admin qui BYPASSE la RLS (clé secrète)
   La clé secrète n'est lue QUE via les variables d'environnement — jamais committée.
   ============================================================ */
const app = {
  // auth: "user" → exige un JWT utilisateur valide (vérifié via SUPABASE_JWKS_URL)
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    // Exemple : lire l'espace de synchro YADA de l'utilisateur (RLS appliquée)
    const { data, error } = await ctx.supabase
      .from("yada_sync")
      .select("id, ts, updated_at");
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json(data);
  }),
};

export default app;

/* --- Adaptateur Node pour test LOCAL : `node --env-file=.env index.mjs` ---
   Sur Supabase Edge Functions, ce bloc est inutile (le runtime appelle `fetch`
   et injecte SUPABASE_URL / SUPABASE_SECRET_KEY / etc. automatiquement ;
   pensez à verify_jwt = false dans supabase/config.toml pour les modes non-"user"). */
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
  }).listen(port, () => console.log("YADA Supabase server (local) → http://localhost:" + port));
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (d) => chunks.push(d));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
