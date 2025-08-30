// Flynn.ai v2 Service Worker
// Provides offline functionality and caching for mobile web app

const CACHE_NAME = 'flynn-ai-v2-cache-v1';
const STATIC_CACHE_NAME = 'flynn-ai-static-v1';
const DYNAMIC_CACHE_NAME = 'flynn-ai-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/calls',
  '/events',
  '/calendar',
  '/settings',
  '/offline',
  '/manifest.json',
  // Add core CSS and JS files
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
];

// Dynamic assets to cache on demand
const CACHE_STRATEGIES = {
  // Cache First - For static assets
  CACHE_FIRST: 'cache-first',
  // Network First - For API calls and dynamic content  
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - For images and non-critical content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[Flynn.ai SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Flynn.ai SW] Caching static assets...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[Flynn.ai SW] Static assets cached successfully');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[Flynn.ai SW] Failed to cache static assets:', error);
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Flynn.ai SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[Flynn.ai SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Flynn.ai SW] Service Worker activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - Handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except for APIs we control)
  if (url.origin !== location.origin && !url.origin.includes('supabase')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // API routes - Network First strategy
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request);
    }
    
    // Static assets - Cache First strategy  
    if (isStaticAsset(url.pathname)) {
      return await cacheFirstStrategy(request);
    }
    
    // Pages - Stale While Revalidate strategy
    if (isPageRequest(url.pathname)) {
      return await staleWhileRevalidateStrategy(request);
    }
    
    // Default to network first
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.error('[Flynn.ai SW] Request handling failed:', error);
    return await getOfflineFallback(request);
  }
}

// Cache First Strategy - For static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Flynn.ai SW] Network failed for static asset, no cache available');
    throw error;
  }
}

// Network First Strategy - For API calls and dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses for offline access
      if (request.url.includes('/api/')) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Flynn.ai SW] Network failed, checking cache...');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy - For pages and images
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await caches.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[Flynn.ai SW] Background fetch failed:', error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  return await fetchPromise;
}

// Offline fallback for when all strategies fail
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Return offline page for navigation requests
  if (isPageRequest(url.pathname)) {
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Create basic offline response if no offline page cached
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Flynn.ai - Offline</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #4880ff, #6200ff);
              color: white;
              text-align: center;
            }
            .container { max-width: 400px; padding: 2rem; }
            .logo { width: 48px; height: 48px; background: white; border-radius: 12px; margin: 0 auto 1rem; }
            h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
            p { margin: 0 0 1.5rem 0; opacity: 0.9; }
            button { 
              background: rgba(255,255,255,0.2); 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 8px; 
              color: white; 
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo"></div>
            <h1>You're offline</h1>
            <p>Check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'text/html',
        }),
      }
    );
  }
  
  // Return error response for other requests
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }
  );
}

// Helper functions
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/icons/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname === '/manifest.json'
  );
}

function isPageRequest(pathname) {
  return (
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/calls') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  );
}

// Background sync for when connectivity returns
self.addEventListener('sync', (event) => {
  console.log('[Flynn.ai SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('[Flynn.ai SW] Performing background sync...');
  
  try {
    // Sync pending actions when connectivity returns
    // This could include:
    // - Uploading cached form submissions
    // - Syncing local changes to server
    // - Refreshing critical data
    
    console.log('[Flynn.ai SW] Background sync completed successfully');
  } catch (error) {
    console.error('[Flynn.ai SW] Background sync failed:', error);
  }
}

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[Flynn.ai SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New Flynn.ai notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Dashboard',
        icon: '/icons/dashboard-96x96.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/icons/close-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Flynn.ai', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Flynn.ai SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/dashboard'));
  }
});

console.log('[Flynn.ai SW] Service Worker loaded successfully');