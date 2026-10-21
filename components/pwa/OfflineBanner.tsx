"use client";

import { useOnline } from "@/lib/hooks/useOnline";
import { FaWifi } from "react-icons/fa";

// Aviso mientras no hay red: evita llenar una venta completa y enterarse recién al guardar
export const OfflineBanner = () => {
    const online = useOnline();
    if (online) return null;

    return (
        <div role="status" aria-live="polite" className="flex items-center gap-2 px-4 py-2 text-sm bg-sri-wait-soft text-sri-wait border-b border-line">
            <FaWifi className="shrink-0" />
            <span>Sin conexión. Puedes revisar lo que ya está abierto; para guardar o enviar al SRI se necesita internet.</span>
        </div>
    );
};
