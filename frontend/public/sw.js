/**
 * FoodHunt — Service Worker
 * Cache-first for static assets, network-first for API
 */
const CACHE_NAME = 'foodhunt-v2';
const STATIC_CACHE = 'foodhunt-static-v2';
const API_CACHE = 'foodhunt-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install — cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== API_CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // API requests: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    // Don't cache auth or admin endpoints
    if (url.pathname.includes('/auth/') || url.pathname.includes('/admin/')) return;

    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/) || url.pathname === '/')) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for offline events
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-events') {
    event.waitUntil(syncOfflineEvents());
  }
});

async function syncOfflineEvents() {
  // Read queued events from IndexedDB and send them
  // This is a stub — implement with IndexedDB in full version
}
