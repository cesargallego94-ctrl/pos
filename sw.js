const CACHE_NAME = 'nomada-pos-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Instalación: cachear recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación: limpiar caches viejos
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
});

// Estrategia: cache-first para recursos, luego red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          networkResponse => {
            // Opcional: cachear nuevas respuestas (solo para recursos estáticos)
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
        // Si falla todo, mostrar página offline (opcional)
        return new Response('Sin conexión', { status: 503 });
      })
  );
});