/* PWA Service Worker for Offline Military Weather Hazard Support System */
const CACHE_NAME = 'aras-fsb-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/data/latest_weather.json',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css'
];

/* Service Worker Install Event: Pre-cache Static Assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching PWA App Shell & Offline Assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.log('[SW] Cache addAll warning (non-fatal):', err);
      });
    })
  );
  self.skipWaiting();
});

/* Service Worker Activate Event: Cleanup Old Caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting Old Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* Service Worker Fetch Event: Network-First with Cache Fallback Strategy */
self.addEventListener('fetch', event => {
  // Skip non-GET requests or browser extension requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Clone response to store in cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails (Offline Mode)
        console.log('[SW] Network failed. Serving from Cache:', event.request.url);
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
