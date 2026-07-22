/* YADA 1.2 — filet de fumée (smoke test).
   Charge index.html dans Chromium, vérifie qu'il n'y a AUCUNE erreur de page
   et que la coquille (barre latérale + accueil) se rend bien.
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
await page.waitForTimeout(400);

const checks = await page.evaluate(() => ({
  hasApp: !!document.querySelector('#app aside'),
  hasBrand: /YADA/.test(document.querySelector('.brand .name')?.textContent || ''),
  hasAccueil: /Nouveau départ/.test(document.body.textContent || ''),
  hasVer: /YADA 1\.2/.test(document.getElementById('yada-ver')?.textContent || ''),
  renderFn: typeof window.render === 'function'
}));

await browser.close();

const fail = [];
if (errors.length) fail.push('erreurs de page: ' + errors.slice(0, 5).join(' | '));
for (const [k, v] of Object.entries(checks)) if (!v) fail.push('échec: ' + k);

if (fail.length) {
  console.error('❌ SMOKE ÉCHOUÉ');
  fail.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('✅ SMOKE OK — YADA 1.2 se charge (coquille + accueil), 0 erreur de page.');
console.log('  checks:', JSON.stringify(checks));
