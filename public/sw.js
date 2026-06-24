const CACHE_NAME = 'coconut-farm-cache-v4';
const STATIC_ASSETS_CACHE = 'coconut-farm-static-v4';

const ASSETS = [
  '/farmer',
  '/qr-scan',
  '/daily-update',
  '/tree-update',
  '/favicon.ico',
  '/zxing/zxing_reader.wasm',
  '/zxing/zxing_full.wasm',
  '/zxing/zxing_writer.wasm',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`Failed to pre-cache ${asset}:`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== STATIC_ASSETS_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  const url = new URL(event.request.url);

  // Cache Next.js static assets (JS, CSS chunks) with Cache-First (since they are immutable with build hashes)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request.clone()).then((networkResponse) => {
          if (networkResponse.ok) {
            const resClone = networkResponse.clone();
            caches.open(STATIC_ASSETS_CACHE).then((cache) => {
              cache.put(event.request.clone(), resClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          return new Response('Offline and resource not cached', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
    return;
  }

  // Cache Next.js dynamic images with Stale-While-Revalidate
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = Promise.resolve().then(() => {
          if (!self.navigator.onLine) {
            throw new Error('Offline');
          }
          return fetch(event.request.clone()).then((networkResponse) => {
            if (networkResponse.ok) {
              const resClone = networkResponse.clone();
              caches.open(STATIC_ASSETS_CACHE).then((cache) => {
                cache.put(event.request.clone(), resClone);
              });
            }
            return networkResponse;
          });
        }).catch((err) => {
          console.log('Background fetch failed or offline:', err);
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Network First, fallback to cache for HTML navigation
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If it's a valid HTML/page response, cache it dynamically
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        const url = new URL(event.request.url);
        
        // 1. Try to match the exact request (ignoring search params)
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // 2. Explicit string fallback for tree-update
          if (url.pathname === '/tree-update') {
            return caches.match('/tree-update');
          }
          
          // 3. Ultimate fallback to farmer dashboard for any navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/farmer');
          }
          
          return new Response('Offline and not in cache', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
