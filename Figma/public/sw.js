// Service Worker for HAIDA PWA
// Implements advanced caching strategies for optimal performance

const CACHE_VERSION = 'haida-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Resources to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old versions
            return cacheName.startsWith('haida-') &&
                   cacheName !== STATIC_CACHE &&
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== IMAGE_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (APIs, etc.)
  if (url.origin !== location.origin) {
    return;
  }

  // Strategy: Cache First for static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Strategy: Cache First for images
  if (isImage(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Strategy: Network First for HTML/API
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Helper: Check if URL is a static asset
function isStaticAsset(pathname) {
  return (
    pathname.match(/\.(js|css|woff2?|ttf|otf|eot)$/) ||
    pathname.startsWith('/assets/')
  );
}

// Helper: Check if URL is an image
function isImage(pathname) {
  return pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/);
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);

    // Return offline page if available
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page if available
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Placeholder for future offline data sync
  console.log('[SW] Syncing data...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New notification from HAIDA',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification('HAIDA', options)
  );
});
