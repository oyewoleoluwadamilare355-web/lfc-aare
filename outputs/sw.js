// Increment the version to force browsers to update the service worker
const CACHE_NAME = 'lfc-aare-v6';

// Static assets to cache for offline use
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

// 1. INSTALL EVENT
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE EVENT (Cleans up old cache versions like v4, v5)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT (With explicit APK bypass)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // CRITICAL FIX: Bypass Service Worker completely for .apk files
  if (requestUrl.pathname.endsWith('.apk') || event.request.url.includes('.apk')) {
    return; // Returning early lets the browser handle the network request naturally
  }

  // Bypass non-GET requests (e.g. POST, PUT)
  if (event.request.method !== 'GET') {
    return;
  }

  // Standard Network-first with Cache Fallback strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If valid response, clone and update cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to offline cache if network fails
        return caches.match(event.request);
      })
  );
});
