const CACHE_NAME = 'lfc-aare-v4'; // Incremented cache version

// Cache core assets safely
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((asset) =>
          cache.add(asset).catch((err) => console.warn(`Failed to cache ${asset}:`, err))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Resilient Network-First / Fallback Fetch Handler
self.addEventListener('fetch', (event) => {
  // 1. Only intercept GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 2. SKIP SERVICE WORKER FOR APK DOWNLOADS
  // Let the browser handle .apk downloads directly over the network
  if (url.pathname.endsWith('.apk')) {
    return; // Early return allows standard browser network fetch
  }

  // 3. Network-first caching strategy with offline fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to index.html if requested offline page isn't found
          return caches.match('./index.html');
        });
      })
  );
});
