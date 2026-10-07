const CACHE_NAME = 'lfc-aare-v7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './announcements.html',
  './wsf-outline.html',
  './testimonies.html',
  './hymns.html',
  './book-of-the-month.html',
  './join.html',
  './manifest.webmanifest',
  './logo.png'
];

// 1. Install Event: Cache essential shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force the waiting service worker to become active immediately
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches (v6, v5, etc.)
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
    })
  );
  // Take control of all open pages/clients immediately
  self.clients.claim();
});

// 3. Fetch Event: Network-first strategy for HTML pages, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
