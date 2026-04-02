/**
 * FoodHunt — Service Worker v3
 * Network-first for HTML/JS/CSS, cache fallback for offline
 */
const CACHE_NAME = 'foodhunt-v4';

// Install — skip waiting immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate — delete ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy: network-first for everything
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (external images, fonts, etc.)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Skip auth/admin API requests entirely
  if (url.pathname.includes('/auth/') || url.pathname.includes('/admin/')) return;

  // Network-first: try network, fallback to cache for offline support
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses for offline use
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: try cache
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // If no cache and it's a navigation, serve cached index
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
