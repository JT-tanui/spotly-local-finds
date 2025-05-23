// Service Worker for Dinex PWA
const CACHE_NAME = 'dinex-cache-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets here
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Become active for all clients
  self.clients.claim();
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  // For API calls, try network first, then fallback to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // For static assets, try cache first, then network
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    STATIC_ASSETS.includes(new URL(event.request.url).pathname)
  ) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // For navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkWithOfflineFallback(event.request));
    return;
  }
  
  // Default: try network, fallback to cache
  event.respondWith(networkFirstStrategy(event.request));
});

// Cache first, fallback to network strategy
async function cacheFirstStrategy(request) {
  const cacheResponse = await caches.match(request);
  return cacheResponse || fetchAndCache(request);
}

// Network first, fallback to cache strategy
async function networkFirstStrategy(request) {
  try {
    const response = await fetchAndCache(request);
    return response;
  } catch (error) {
    console.log('Network request failed, falling back to cache', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse;
  }
}

// Network with offline fallback strategy for navigation requests
async function networkWithOfflineFallback(request) {
  try {
    const response = await fetchAndCache(request);
    return response;
  } catch (error) {
    console.log('Navigation request failed, falling back to offline page', error);
    const cachedResponse = await caches.match(OFFLINE_URL);
    return cachedResponse;
  }
}

// Fetch and cache helper function
async function fetchAndCache(request) {
  const response = await fetch(request);
  
  // Only cache valid responses (status 200)
  if (response.status === 200) {
    const responseClone = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseClone);
    });
  }
  
  return response;
}

// Push notification event
self.addEventListener('push', (event) => {
  let data = {};
  
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Dinex',
      body: event.data.text()
    };
  }
  
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data || {}
  };
  
  event.waitUntil(self.registration.showNotification(data.title || 'Dinex', options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open the app and navigate to a specific page if provided in the notification data
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window client already exists, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window/tab
      return self.clients.openWindow(urlToOpen);
    })
  );
});
