const CACHE = 'islamapp-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      try {
        const fresh = await fetch(e.request);
        if (fresh && fresh.ok && new URL(e.request.url).origin === self.location.origin) {
          cache.put(e.request, fresh.clone());
        }
        return fresh;
      } catch {
        const cached = await cache.match(e.request);
        return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })
  );
});
