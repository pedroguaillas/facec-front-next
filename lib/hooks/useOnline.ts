"use client";

import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
};

// Estado de la conexión del dispositivo (en el servidor se asume en línea)
export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
