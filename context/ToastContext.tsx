"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

type ToastType = 'success' | 'error';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 3500;
let nextId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = ++nextId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), TOAST_DURATION);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div
                className="fixed bottom-4 right-4 left-4 sm:left-auto z-[110] flex flex-col items-end gap-2 pointer-events-none"
                role="status"
                aria-live="polite"
            >
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className="pointer-events-auto flex items-center gap-3 w-full sm:w-auto sm:min-w-72 max-w-sm px-4 py-3 rounded-lg shadow-lg text-sm text-white animate-toast-in bg-slate-800 dark:bg-slate-700"
                    >
                        {t.type === 'success'
                            ? <FaCheckCircle className="shrink-0 text-emerald-400" />
                            : <FaExclamationCircle className="shrink-0 text-red-400" />}
                        <span className="flex-1">{t.message}</span>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer"
                            aria-label="Cerrar notificación"
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
