/* YADA PRO — filet de fumée.
   Charge index.html dans Chromium, vérifie 0 erreur de page et que le cœur
   fonctionne : navigation, formulaire d'émission, sélecteur de thèmes, et
   qu'une facture peut être créée dans chaque thème (rendu du modèle).
   CI : .github/workflows/tests.yml. Local : YADA_CHROME=/chemin/chrome node tests/smoke.mjs */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const url = pathToFileURL(resolve(process.cwd(), 'index.html')).href;
const exe = process.env.YADA_CHROME || undefined;

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(300);

const res = await page.evaluate(() => {
  const out = {};
  out.hasNav = !!document.querySelector('aside .nav-btn');
  out.hasThemes = Array.isArray(window.THEMES) && window.THEMES.length >= 3;
  // Créer un client, aller sur Envoyer, créer une facture dans chaque thème.
  window.db.contacts = [{ id: 'c1', nom: 'Client Test', type: 'client', email: 't@ex.fr' }];
  const rendered = [];
  (window.THEMES || []).forEach((t) => {
    window.emResetDraft();
    window.emDraft.contactId = 'c1';
    window.emDraft.theme = t.id;
    window.emDraft.lignes = [{ desc: 'Prestation', qte: 2, pu: 100, taux: 20 }];
    const before = window.db.emises.length;
    window.emCreer();
    const f = window.db.emises[window.db.emises.length - 1];
    const html = window.factureHTML(f);
    rendered.push({ theme: t.id, created: window.db.emises.length === before + 1, ttcOk: Math.abs(f.ttc - 240) < 0.01, classOk: html.indexOf('th-' + t.id) >= 0 });
  });
  out.rendered = rendered;
  out.allOk = rendered.length >= 3 && rendered.every((r) => r.created && r.ttcOk && r.classOk);
  return out;
});

await browser.close();

const fail = [];
if (errors.length) fail.push('erreurs de page: ' + errors.slice(0, 5).join(' | '));
if (!res.hasNav) fail.push('échec: navigation absente');
if (!res.hasThemes) fail.push('échec: THEMES absents');
if (!res.allOk) fail.push('échec: création/rendu par thème: ' + JSON.stringify(res.rendered));

if (fail.length) {
  console.error('❌ SMOKE ÉCHOUÉ');
  fail.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✅ SMOKE OK — YADA PRO : nav + facture de vente créée et rendue dans chaque thème (' + res.rendered.map((r) => r.theme).join(', ') + '), 0 erreur de page.');
