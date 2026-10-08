const CACHE_NAME = 'lfc-aare-v2';
const STATIC_ASSETS = [
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

// Install Event: Cache Static Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network First with Cache Fallback for dynamic pages (Announcements/WSF/Hymns)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback for HTML navigation requests offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      })
  );
});

// Firebase Push Notification Listener
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'LFC Aare Notification',
    body: 'You have a new update from LFC Aare.',
    icon: './logo.png',
    badge: './logo.png'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      notificationData.title = parsed.notification?.title || parsed.title || notificationData.title;
      notificationData.body = parsed.notification?.body || parsed.body || notificationData.body;
      if (parsed.data?.url) {
        notificationData.data = { url: parsed.data.url };
      }
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data || { url: './index.html' },
      vibrate: [100, 50, 100]
    })
  );
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
