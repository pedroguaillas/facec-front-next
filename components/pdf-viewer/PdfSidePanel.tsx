"use client";

import { ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

interface Props {
    title: string;
    onClose: () => void;
    children: ReactNode;
}

// Panel a la derecha con el alto completo de la pantalla: el PDF (A4 o ticket) se lee entero,
// sin el recorte del modal centrado. Esc o clic fuera lo cierran
export const PdfSidePanel = ({ title, onClose, children }: Props) => {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    // El padre pasa una función nueva en cada render: el efecto se monta una sola vez
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        panelRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCloseRef.current();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
        };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-100 flex justify-end bg-black/40 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="flex flex-col h-dvh w-full max-w-3xl lg:w-[48vw] bg-surface border-l border-line shadow-2xl outline-none animate-panel-in"
            >
                <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-line">
                    <h2 id={titleId} className="text-base font-semibold text-ink-1 truncate">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="shrink-0 inline-flex items-center justify-center min-w-11 min-h-11 rounded-full text-ink-3 hover:bg-surface-sunken hover:text-ink-1 transition-colors cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
};
