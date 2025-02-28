//const CACHE_NAME = 'sudoku-cache-v6';
console.log("🚀 ~ SOC A SW.js: CACHE_NAME:", CACHE_NAME)

const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './script/sudoku.min.js',
  // Afegir altres recursos que vulguis al caché
];

self.addEventListener('install', function(event) {
  // Força que el SW prengui el control immediatament
  self.skipWaiting();

  // Resta del codi d'instal·lació...
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna la resposta del caché si existeix, en cas contrari fa una sol·licitud de xarxa
        return response || fetch(event.request);
      })
  );
});


self.addEventListener('activate', function(event) {
  // Força que el SW reclami el control de les pàgines clients
  event.waitUntil(self.clients.claim());

  // Resta del codi d'activació...
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
