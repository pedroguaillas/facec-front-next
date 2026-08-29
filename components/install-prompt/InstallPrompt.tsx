"use client";

import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

export const InstallPrompt = () => {
    const { canInstall, isIOS, promptInstall, dismiss } = useInstallPrompt();

    if (!canInstall) return null;

    return (
        <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-4 md:max-w-sm z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-800 dark:text-gray-100">
                {isIOS ? (
                    <>Instala Facec: toca <strong>Compartir</strong> y luego <strong>&quot;Agregar a inicio&quot;</strong>.</>
                ) : (
                    <>Instala Facec en tu dispositivo para acceso rápido.</>
                )}
            </p>
            <div className="flex items-center gap-3 shrink-0">
                {!isIOS && (
                    <button
                        type="button"
                        onClick={promptInstall}
                        className="text-sm font-medium text-blue-600"
                    >
                        Instalar
                    </button>
                )}
                <button type="button" onClick={dismiss} className="text-sm text-gray-500" aria-label="Cerrar">
                    ✕
                </button>
            </div>
        </div>
    );
};
