"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorExtended extends Navigator {
    standalone?: boolean;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export const useInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/service-worker.js").catch(() => { });
        }

        setIsStandalone(
            (window.navigator as NavigatorExtended).standalone === true ||
            window.matchMedia("(display-mode: standalone)").matches
        );
        setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
        setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
    };

    const dismiss = () => {
        localStorage.setItem(DISMISSED_KEY, "1");
        setDismissed(true);
    };

    const canInstall = !isStandalone && !dismissed && (Boolean(deferredPrompt) || isIOS);

    return { canInstall, isIOS, promptInstall, dismiss };
};
