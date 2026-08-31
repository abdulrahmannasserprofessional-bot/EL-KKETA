const CACHE_NAME = 'elkheta-v-2026-FORCE-NO-CACHE';
const STATIC_ASSETS = [
    'style.css',
    'logo.png',
    'favicon.ico'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(k => {
                    if (k !== CACHE_NAME) {
                        console.log('Purging old cache:', k);
                        return caches.delete(k);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Network-First for all HTML pages to guarantee students always get the fresh version
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    if (req.method !== 'GET') return;

    if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
        event.respondWith(
            fetch(req).catch(() => caches.match(req).then(res => res || caches.match('offline.html')))
        );
        return;
    }

    event.respondWith(
        fetch(req).catch(() => caches.match(req))
    );
});
