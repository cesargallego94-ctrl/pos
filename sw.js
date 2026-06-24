const CACHE_NAME = 'nomada-pos-v1';
const urlsToCache = [
  '/pos/',
  '/pos/index.html',
  '/pos/manifest.json',
  '/pos/icon-192.png',
  '/pos/icon-512.png',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Forzar activación inmediata
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim(); // Tomar control de las pestañas abiertas
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Sirve desde caché
        }
        return fetch(event.request).then(
          networkResponse => {
            // Guarda en caché las nuevas respuestas
            if (event.request.url.startsWith('https://cdn.jsdelivr.net')) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clone);
              });
            }
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // Si falla todo, muestra una página offline (opcional)
        return new Response('Sin conexión', { status: 503 });
      })
  );
});
