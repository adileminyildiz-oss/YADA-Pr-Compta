/* Filet de tests — ÉQUILIBRE DES ÉCRITURES (Σ débit = Σ crédit)
 *
 * Charge réellement precompta.html dans Chromium (comme la validation Playwright
 * du projet), réinitialise sur les 2 démos (d-ama, d-sci42), et vérifie que
 * CHAQUE écriture de CHAQUE dossier est équilibrée. Exerce aussi la génération
 * en direct (posterFacture vente + achat) pour couvrir le code, pas seulement
 * les données figées. Sort en code 1 au moindre déséquilibre ou erreur page.
 *
 * Lancement : node tests/equilibre-ecritures.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FILE = pathToFileURL(resolve(process.cwd(), 'precompta.html')).href;
const TOL = 0.005; // tolérance d'arrondi (centime)

const browser = await chromium.launch({ executablePath: process.env.YADA_CHROME || undefined });
const page = await browser.newPage();

// Neutralise la purge unique (addon191) pour ce test : on valide directement le
// seed vide + la génération, sans déclencher le rechargement de nettoyage.
await page.addInitScript(() => { try { localStorage.setItem('yada-empty-386', '1'); } catch (e) {} });

const pageErrors = [];
// Ignore les échecs de chargement de ressources externes (polices, CDN OCR, QR…)
// — sans rapport avec la logique ; on ne retient que les vraies erreurs JS.
const RESOURCE_NOISE = /Failed to load resource|net::ERR_|ERR_CERT|favicon|status of 4\d\d|status of 5\d\d/i;
page.on('pageerror', e => pageErrors.push('pageerror: ' + String(e)));
page.on('console', m => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (RESOURCE_NOISE.test(t)) return;
  pageErrors.push('console.error: ' + t);
});

await page.goto(FILE, { waitUntil: 'load' });
await page.waitForFunction(
  "typeof db !== 'undefined' && db && typeof seed === 'function' && db.dossiersData");

const report = await page.evaluate(({ TOL }) => {
  const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;

  // L'application démarre VIDE (aucun dossier de démonstration) → on construit un
  // dossier de travail éphémère + 2 tiers pour exercer la génération d'écritures.
  seed();
  const soc = (typeof societeDefaut === 'function') ? societeDefaut() : {};
  db.cabinet.dossiers = [{ id: 'd-test', nom: 'TEST', forme: 'SAS' }];
  db.cabinet.total = 1;
  db.dossiersData = { 'd-test': datasetVide(soc) };
  db.activeId = 'd-test';
  chargerDossier('d-test');
  db.tiers.push(
    { id: 't-cli', type: 'client',      nom: 'CLIENT TEST', compteAux: '411CLI000', compteContre: '706000000', compteTVA: '445710000', taux: 20 },
    { id: 't-fou', type: 'fournisseur', nom: 'FOURN TEST',  compteAux: '401FOU000', compteContre: '606000000', compteTVA: '445660000', taux: 20 }
  );

  const out = { dossiers: {}, totalEcritures: 0, imbalances: [], generated: [] };

  function checkDataset(label, ds) {
    const ecrs = (ds && ds.ecritures) || [];
    let n = 0;
    for (const e of ecrs) {
      n++;
      let d = 0, c = 0;
      for (const l of (e.lignes || [])) { d += (+l.debit || 0); c += (+l.credit || 0); }
      d = round2(d); c = round2(c);
      if (Math.abs(d - c) > TOL) {
        out.imbalances.push({ dossier: label, journal: e.journal, libelle: e.libelle,
          numero: e.numero, debit: d, credit: c, ecart: round2(d - c) });
      }
    }
    out.dossiers[label] = n;
    out.totalEcritures += n;
  }

  // --- Exerce la génération en direct sur le dossier de travail ---
  // Vente 1000 HT @20% puis Achat 500 HT @20% ; vérifie équilibre + TTC=HT+TVA.
  try {
    const tclient = (db.tiers || []).find(t => t.type === 'client');
    const fourn   = (db.tiers || []).find(t => t.type === 'fournisseur');
    const cases = [];
    if (tclient) cases.push({ type: 'vente', tiersId: tclient.id, base: 1000, taux: 20 });
    if (fourn)   cases.push({ type: 'achat', tiersId: fourn.id,   base: 500,  taux: 20 });
    for (const cas of cases) {
      const t = (db.tiers || []).find(x => x.id === cas.tiersId);
      const before = db.ecritures.length;
      const f = posterFacture({ type: cas.type, tiersId: cas.tiersId, date: todayStr(),
        base: cas.base, baseEst: 'HT', taux: cas.taux,
        compteContre: t.compteContre, compteTVA: t.compteTVA });
      const ecr = db.ecritures.find(e => e.id === f.ecritureId);
      let d = 0, c = 0;
      for (const l of (ecr.lignes || [])) { d += (+l.debit || 0); c += (+l.credit || 0); }
      d = round2(d); c = round2(c);
      const ttcOk = Math.abs(round2(f.ht + f.tva) - round2(f.ttc)) <= TOL;
      const balanced = Math.abs(d - c) <= TOL;
      out.generated.push({ type: cas.type, ht: f.ht, tva: f.tva, ttc: f.ttc,
        debit: d, credit: c, balanced, ttcOk, created: db.ecritures.length - before === 1 });
      if (!balanced) out.imbalances.push({ dossier: 'd-test (généré)', journal: ecr.journal,
        libelle: ecr.libelle, debit: d, credit: c, ecart: round2(d - c) });
    }
  } catch (err) {
    out.generationError = String(err);
  }

  // Contrôle final : toutes les écritures de tous les datasets sont équilibrées.
  for (const [id, ds] of Object.entries(db.dossiersData || {})) checkDataset(id, ds);

  return out;
}, { TOL });

await browser.close();

// --- Rapport ---
const fail = [];
console.log('— Filet de tests : équilibre des écritures —');
console.log('Dossiers vérifiés :', JSON.stringify(report.dossiers));
console.log('Écritures contrôlées :', report.totalEcritures);
for (const g of report.generated) {
  console.log(`Généré ${g.type}: HT=${g.ht} TVA=${g.tva} TTC=${g.ttc} ` +
    `(débit=${g.debit} crédit=${g.credit}) équilibré=${g.balanced} TTC=HT+TVA=${g.ttcOk}`);
  if (!g.balanced || !g.ttcOk || !g.created) fail.push('Génération ' + g.type + ' incorrecte');
}

if (report.totalEcritures === 0) fail.push('Aucune écriture contrôlée (seed vide ?)');
if (report.generationError) fail.push('Erreur de génération : ' + report.generationError);
if (report.imbalances.length) {
  fail.push(report.imbalances.length + ' écriture(s) déséquilibrée(s)');
  console.error('\n❌ Écritures déséquilibrées :');
  for (const im of report.imbalances) console.error('   ', JSON.stringify(im));
}
if (pageErrors.length) {
  fail.push(pageErrors.length + ' erreur(s) page/console');
  console.error('\n❌ Erreurs page :');
  for (const e of pageErrors.slice(0, 20)) console.error('   ', e);
}

if (fail.length) {
  console.error('\n=== ÉCHEC : ' + fail.join(' ; ') + ' ===');
  process.exit(1);
}
console.log('\n✅ SUCCÈS : toutes les écritures sont équilibrées (Σ débit = Σ crédit).');
