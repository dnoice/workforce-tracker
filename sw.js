// Service Worker for WorkForce Tracker
// Enables offline functionality and faster loading

const CACHE_NAME = 'workforce-tracker-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Return offline page if available
                    return caches.match('/index.html');
                });
            })
    );
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline data submission
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-time-entries') {
        event.waitUntil(syncTimeEntries());
    }
});

// Function to sync time entries when back online
async function syncTimeEntries() {
    try {
        // Get pending entries from IndexedDB or localStorage
        const pending = await getPendingEntries();
        
        if (pending && pending.length > 0) {
            // In a real app, you would sync with a server here
            console.log('Syncing', pending.length, 'pending entries');
            
            // Clear pending entries after successful sync
            await clearPendingEntries();
        }
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Helper function to get pending entries (placeholder)
async function getPendingEntries() {
    // This would retrieve from IndexedDB in a full implementation
    return [];
}

// Helper function to clear pending entries (placeholder)
async function clearPendingEntries() {
    // This would clear from IndexedDB in a full implementation
    return true;
}

// Push notification support (for future features)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('WorkForce Tracker', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        // Check for updates
        self.registration.update();
    }
});

// Periodic background sync (for future server integration)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-data') {
        event.waitUntil(updateData());
    }
});

async function updateData() {
    // Placeholder for future server sync functionality
    console.log('Checking for data updates...');
}

// Cache versioning and update notification
const broadcastUpdate = async () => {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
        client.postMessage({
            type: 'CACHE_UPDATED',
            version: CACHE_NAME
        });
    });
};

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully');
