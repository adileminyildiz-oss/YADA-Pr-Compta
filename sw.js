/* YADA PRO — Service Worker.
   Réseau d'abord pour les pages (dernière version en ligne), repli cache hors-ligne.
   Cache-first pour icônes / manifeste. */
var CACHE = 'yada-pro-v5';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASSETS.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function isPage(req){ if (req.mode === 'navigate') return true; var u = req.url || ''; return /\.html(\?|$)/.test(u) || /\/$/.test(u); }

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (/version\.json(\?|$)/.test(req.url)) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(function () { return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }); }));
    return;
  }
  if (isPage(req)) {
    e.respondWith(fetch(req).then(function (resp) {
      try { var copy = resp.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } catch (err) {}
      return resp;
    }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match('./index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (cached) {
    return cached || fetch(req).then(function (resp) {
      try { var copy = resp.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } catch (err) {}
      return resp;
    }).catch(function () { return new Response('', { status: 504, statusText: 'Hors-ligne' }); });
  }));
});
