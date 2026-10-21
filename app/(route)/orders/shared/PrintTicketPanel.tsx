"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaPrint, FaSpinner } from "react-icons/fa";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

interface Props {
    orderId: string | number;
    serie?: string;
    // Se llama al cerrar el diálogo de impresión (imprimió o canceló) o al pulsar Continuar
    onDone: () => void;
}

const actionClass = 'inline-flex items-center justify-center gap-1.5 min-h-9 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.97]';

// Tras guardar la venta (empresa que imprime tickets, en computadora): carga el ticket térmico en un
// iframe invisible y abre directo el diálogo de impresión del navegador. Al cerrarlo vuelve a la lista;
// no hay modal que cerrar. Solo se ve una tarjeta pequeña mientras carga o si algo falla
export const PrintTicketPanel = ({ orderId, serie, onDone }: Props) => {
    const axiosAuth = useAxiosAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const started = useRef(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'printing' | 'error'>('loading');

    useEffect(() => {
        let url: string | null = null;
        let active = true;
        axiosAuth.get(`orders/${orderId}/printf`, { responseType: 'blob' })
            .then(response => {
                if (!active) return;
                url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                setPdfUrl(url);
            })
            .catch(() => {
                if (active) setStatus('error');
            });
        return () => {
            active = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [axiosAuth, orderId]);

    // El diálogo de impresión del visor PDF no dispara afterprint ni bloquea: mientras está abierto la
    // página no recibe eventos, así que el primer movimiento, tecla o foco después indica que se cerró
    const waitForDialogClose = () => {
        const events: [EventTarget, string][] = [[window, 'focus'], [document, 'mousemove'], [document, 'keydown'], [document, 'pointerdown']];
        const finish = () => {
            events.forEach(([target, type]) => target.removeEventListener(type, finish));
            onDone();
        };
        // Margen para que el diálogo alcance a abrirse antes de escuchar
        setTimeout(() => events.forEach(([target, type]) => target.addEventListener(type, finish)), 800);
    };

    const print = () => {
        try {
            iframeRef.current?.contentWindow?.focus();
            iframeRef.current?.contentWindow?.print();
            setStatus('printing');
            waitForDialogClose();
        } catch {
            setStatus('error');
        }
    };

    // El visor del PDF tarda un momento en estar listo después del load del iframe
    const handleLoad = () => {
        if (started.current) return;
        started.current = true;
        setTimeout(print, 300);
    };

    return (
        <>
            {pdfUrl && (
                // Invisible pero renderizado: con display:none o tamaño 0 el visor no carga y no imprime
                <iframe
                    ref={iframeRef}
                    src={pdfUrl}
                    title={serie ? `Ticket ${serie}` : 'Ticket'}
                    onLoad={handleLoad}
                    aria-hidden="true"
                    tabIndex={-1}
                    className="fixed bottom-0 right-0 w-[400px] h-[600px] opacity-0 pointer-events-none -z-10"
                />
            )}

            {status !== 'printing' && (
                <div role="status" aria-live="polite" className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[110] w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface shadow-lg p-4 animate-toast-in">
                    {status === 'loading' ? (
                        <p className="flex items-center gap-2 text-sm text-ink-2">
                            <FaSpinner className="animate-spin shrink-0" /> Preparando ticket{serie ? ` ${serie}` : ''}…
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-ink-1">No se pudo abrir la impresión del ticket.</p>
                            <p className="text-xs text-ink-3 mt-1">Puedes imprimirlo luego desde la lista de ventas.</p>
                            <div className="flex justify-end gap-2 mt-3">
                                {pdfUrl && (
                                    <button type="button" onClick={() => window.open(pdfUrl, '_blank')} className={`${actionClass} border border-line-strong text-ink-1 hover:bg-surface-sunken`}>
                                        <FaPrint /> Abrir ticket
                                    </button>
                                )}
                                <button type="button" onClick={onDone} autoFocus className={`${actionClass} bg-primary text-white hover:bg-primaryhover`}>
                                    Continuar <FaArrowRight />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};
