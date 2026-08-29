// Service worker mínimo: no cachea nada, solo satisface el criterio de
// instalabilidad de PWA (Android/Chrome exige un SW registrado para
// disparar el evento nativo `beforeinstallprompt`).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
    // Sin respondWith: deja pasar la petición a la red normalmente.
});
