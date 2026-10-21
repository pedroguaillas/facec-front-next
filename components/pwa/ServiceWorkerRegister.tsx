"use client";

import { useEffect } from "react";

// Registra el service worker en toda la app (antes solo en login). En desarrollo lo quita:
// cachear los chunks de Turbopack dejaría código viejo en pantalla
export const ServiceWorkerRegister = () => {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;
        if (process.env.NODE_ENV !== "production") {
            navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(r => r.unregister()));
            return;
        }
        navigator.serviceWorker.register("/service-worker.js").catch(() => { });
    }, []);

    return null;
};
