/*
 * test-rendu.cjs — Test de rendu & d'intégrité de precompta.html (exécution réelle via jsdom)
 *
 * Pourquoi : Playwright/Chromium ne sont pas toujours installables (politique réseau).
 * Ce harnais charge precompta.html, EXÉCUTE réellement tous les scripts (y compris les
 * addons), parcourt les 23 modules sur les 2 démos, teste les addons et vérifie
 * l'équilibre comptable (Σ débit = Σ crédit) de chaque écriture.
 *
 * Pré-requis :  npm i jsdom        (puis  node test-rendu.cjs)
 *   ou, si jsdom est installé ailleurs :  NODE_PATH=/chemin/node_modules node test-rendu.cjs
 *
 * Complément (ne remplace pas) au contrôle Playwright décrit dans CLAUDE.md.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync(require('path').join(__dirname,'precompta.html'), 'utf8');
const errors = [];
let pass = 0, fail = 0;
function ok(cond, label, extra) { if (cond) { pass++; console.log('  ✓ ' + label); } else { fail++; console.log('  ✗ ' + label + (extra ? ' — ' + extra : '')); } }

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
  beforeParse(window) {
    window.alert = () => {}; window.confirm = () => true; window.prompt = () => null;
    window.scrollTo = () => {}; window.print = () => {}; window.open = () => null;
    if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
  }
});
const { window } = dom;
window.addEventListener('error', e => errors.push('pageerror: ' + (e.error && e.error.stack || e.message)));
const ev = s => window.eval(s);
const J = s => JSON.parse(window.eval('JSON.stringify(' + s + ')'));

setTimeout(runTests, 600);

function balanceCheck(tag) {
  const ec = J('db.ecritures||[]');
  let bad = 0, gD = 0, gC = 0;
  ec.forEach(e => { let d = 0, c = 0; (e.lignes || []).forEach(l => { d += (+l.debit || 0); c += (+l.credit || 0); }); gD += d; gC += c;
    if (Math.abs(d - c) > 0.01) { bad++; if (bad <= 3) console.log('     déséquilibre [' + tag + ']: ' + (e.journal||'?') + ' ' + (e.libelle||'') + ' D=' + d.toFixed(2) + ' C=' + c.toFixed(2)); } });
  ok(bad === 0, 'Équilibre par écriture [' + tag + '] — ' + ec.length + ' écritures');
  ok(Math.abs(gD - gC) < 0.01, 'Équilibre global [' + tag + '] ΣD=' + gD.toFixed(2) + ' ΣC=' + gC.toFixed(2));
}

function runTests() {
  try {
    console.log('\n=== 1. Chargement initial ===');
    ok(errors.length === 0, 'Aucune erreur au chargement', errors.slice(0,3).join(' | '));
    ok(ev('typeof db') === 'object', 'db initialisée');
    ok(ev('Array.isArray(PAGES) && PAGES.length>0'), 'PAGES présent (' + ev('PAGES.length') + ' modules)');
    ok(typeof window.render === 'function', 'render() global');

    const ids = J('PAGES.map(p=>p.id)');
    ['d-ama', 'd-sci42'].forEach(id => {
      console.log('\n=== 2. Dossier ' + id + ' : parcours des ' + ids.length + ' modules ===');
      const before = errors.length;
      try { ev("choisirDossier('" + id + "')"); } catch (e) { errors.push('choisirDossier: ' + e.message); }
      ok(ev('connecte') === true, 'Dossier ouvert (connecte=true)');
      let modErr = 0;
      ids.forEach(pid => { try { ev("current='" + pid + "'; render();"); } catch (e) { modErr++; console.log('     ✗ ' + pid + ': ' + e.message); } });
      ok(modErr === 0, 'Tous les modules rendus sans exception');
      ok(errors.length === before, 'Aucune pageerror pendant le parcours', errors.slice(before, before+2).join(' | '));
      balanceCheck(id);
    });

    ev("choisirDossier('d-ama')");

    console.log('\n=== 3. Addon21 — K-bis / Statuts ===');
    const infoHtml = ev("pageInfoSociete()");
    ok(/Pièces légales du dossier/.test(infoHtml), 'Carte « Pièces légales » dans Informations société');
    ok(typeof window.ouvrirKbis === 'function' && typeof window.joindreStatuts === 'function', 'Fonctions ouvrir/joindre exposées');

    console.log('\n=== 4. Addon22 — Pastille menu IA ===');
    ev("db.propositions=[{id:'p1',statut:'a_valider'},{id:'p2',statut:'a_valider'},{id:'p3',statut:'comptabilise'}]; connecte=true; current='dash'; render();");
    let badge = window.document.querySelector('#nav .ia-badge');
    ok(!!badge, 'Pastille présente sur le menu');
    ok(badge && badge.textContent === '2', 'Pastille = nb propositions à valider (2)', badge && badge.textContent);
    ev("db.propositions=[]; render();");
    ok(!window.document.querySelector('#nav .ia-badge'), 'Pastille disparaît quand 0 proposition');

    console.log('\n=== 5. Addon23 — Sélecteur d\'exercice ===');
    const h = ev("head('Test','desc')");
    ok(/exo-sel/.test(h), 'Encart exo-sel injecté dans head()');
    ok(/exPrecedent\(\)/.test(h) && /exSuivant\(\)/.test(h), 'Boutons ‹ › reliés à exPrecedent/exSuivant');

    console.log('\n=== 6. Addon24 — GED (stockage réel) ===');
    ok(typeof window.gedAjouterFichier === 'function', 'gedAjouterFichier exposé');
    const file = new window.File(['contenu pdf factice'], 'releve-mars.pdf', { type: 'application/pdf' });
    window.gedAjouterFichier(file, 'autre').then(() => {
      const store = window.gedStore();
      ok(store.length >= 1, 'Fichier stocké dans db.parametres.pieces (' + store.length + ')');
      ok(store[store.length-1].data && store[store.length-1].data.indexOf('data:') === 0, 'Contenu en dataURL');
      ok(/Pièces du dossier \(GED\)/.test(window.gedCard()), 'Carte GED rendue');
      continueTests();
    }).catch(e => { fail++; console.log('  ✗ GED: ' + e.message); continueTests(); });
  } catch (e) { console.log('FATAL: ' + e.stack); finish(); }
}

function continueTests() {
  try {
    console.log('\n=== 7. Addon25 — Filtre/tri éditeur Sage ===');
    ok(typeof window.ecEcritures === 'function' && typeof window.ecSetFiltre === 'function', 'ecEcritures + ecSetFiltre exposés');
    try { ev("ouvrirEcrituresCompte('411')"); } catch (e) {}
    ok(ev('ecFiltre') === '', 'Filtre réinitialisé à l\'ouverture d\'un compte');
    ok(!!window.document.querySelector('#ec-win .ec-filtbar'), 'Barre de filtre injectée dans l\'éditeur');

    console.log('\n=== 8. Addon26 — Mode Client séparé ===');
    window.choisirDossierClient('d-ama');
    ok(ev('sessionRole') === 'client', 'sessionRole = client');
    ok(ev('current') === 'client', 'Page forcée sur Espace Client');
    ok(window.document.querySelectorAll('#nav .nav-btn').length === 1, 'Navigation réduite à 1 entrée', 'trouvé ' + window.document.querySelectorAll('#nav .nav-btn').length);
    ev("current='compta'; render();");
    ok(ev('current') === 'client', 'Accès module cabinet bloqué (retombe sur client)');
    const footHidden = Array.from(window.document.querySelectorAll('.side-foot button')).filter(b => /Exporter|Importer|Réinitialiser/.test(b.textContent) && b.style.display === 'none').length;
    ok(footHidden >= 3, 'Actions cabinet masquées (' + footHidden + ')');
    window.quitterEspaceClient();
    ok(ev('sessionRole') === 'cabinet' && ev('connecte') === false, 'quitterEspaceClient → cabinet/déconnecté');

    console.log('\n=== 9. Addon27 — Messagerie client↔cabinet ===');
    ev("choisirDossier('d-ama')"); window.sessionRole = 'cabinet';
    ok(typeof window.msgEnvoyer === 'function' && typeof window.demAjouter === 'function', 'Fonctions messagerie/demandes exposées');
    ev("current='client'; render();");
    let inp = window.document.getElementById('msg-inp');
    ok(!!inp, 'Champ message présent dans l\'Espace Client');
    if (inp) { inp.value = 'Bonjour, où en est le bilan ?'; window.msgEnvoyer(); }
    ok(window.msgStore().length === 1 && window.msgStore()[0].de === 'cabinet', 'Message cabinet enregistré');
    let dinp = window.document.getElementById('dem-inp'); if (dinp) { dinp.value = 'Relevé bancaire de mars'; window.demAjouter(); }
    ok(window.demStore().length === 1 && window.demStore()[0].statut === 'demandee', 'Pièce demandée enregistrée');
    window.sessionRole = 'client'; window.demBascule(window.demStore()[0].id);
    ok(window.demStore()[0].statut === 'fournie', 'Pièce marquée fournie côté client');
    ev("current='client'; render();");
    inp = window.document.getElementById('msg-inp'); if (inp) { inp.value = 'Le voici, merci'; window.msgEnvoyer(); }
    ok(window.msgStore().length === 2 && window.msgStore()[1].de === 'client', 'Réponse client enregistrée');

    console.log('\n=== 10. Isolation par dossier ===');
    const amaPieces = (window.gedStore() || []).length, amaMsg = window.msgStore().length;
    window.sessionRole = 'cabinet'; ev("choisirDossier('d-sci42')");
    ok((window.gedStore() || []).length === 0, 'Pièces GED isolées par dossier', 'sci42=' + window.gedStore().length + ' ama=' + amaPieces);
    ok(window.msgStore().length === 0, 'Messages isolés par dossier (ama avait ' + amaMsg + ')');

    finish();
  } catch (e) { console.log('ERREUR: ' + e.stack); finish(); }
}

function finish() {
  console.log('\n========================================');
  console.log('RÉSULTAT : ' + pass + ' réussis, ' + fail + ' échoués');
  if (errors.length) { console.log('\nErreurs JS capturées (' + errors.length + ') :'); errors.slice(0,8).forEach(e => console.log('  - ' + e)); }
  console.log('========================================');
  process.exit(fail === 0 && errors.length === 0 ? 0 : 1);
}
