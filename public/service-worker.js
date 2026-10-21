// Service worker de Facec.
// - Estáticos con hash (/_next/static) e íconos: cache-first, abren rápido y sirven sin red.
// - Navegación: siempre red; sin conexión muestra /offline.html.
// - Nunca cachea páginas HTML, la API (otro origen) ni nada con sesión: son datos por empresa.
// Subir VERSION al cambiar este archivo para limpiar cachés viejas.
const VERSION = 'v2';
const STATIC_CACHE = `facec-static-${VERSION}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icon.svg', '/icon-192x192.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

const isStaticAsset = (url) =>
    url.pathname.startsWith('/_next/static/')
    || /\.(?:png|svg|ico|woff2?)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    // API de Laravel y terceros: siempre directo a la red
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
        return;
    }

    if (isStaticAsset(url)) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) return cached;
                const response = await fetch(request);
                if (response.ok) cache.put(request, response.clone());
                return response;
            }),
        );
    }
    // Resto (/api/auth de NextAuth, RSC, etc.): sin respondWith, va a la red normal
});
