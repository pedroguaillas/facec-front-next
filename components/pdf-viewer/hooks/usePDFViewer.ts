"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useEffect, useState } from "react";

interface NavigatorExtended extends Navigator {
    standalone?: boolean;
}

const isStandalonePWA = () =>
    (window.navigator as NavigatorExtended).standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;

export const usePDFViewer = ({ pdf }: { pdf: { route: string, name: string } }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // Táctil: el iframe no sirve (Chrome Android no renderiza PDF; iOS solo muestra la 1.ª página)
    const [isTouch, setIsTouch] = useState<boolean>(false);
    // App instalada: abrir el blob en otra pestaña no tiene a dónde ir; se comparte o descarga
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [canShareFile, setCanShareFile] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const axiosAuth = useAxiosAuth();

    const toggle = () => setIsOpen(!isOpen);

    useEffect(() => {
        const query = window.matchMedia('(pointer: coarse)');
        const update = () => setIsTouch(query.matches);
        update();
        setIsStandalone(isStandalonePWA());
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        let url: string | null = null;
        let active = true;

        const fetchPdf = async () => {
            setError(null);
            setPdfUrl(null);
            setIsOpen(true);
            try {
                const response = await axiosAuth.get(pdf.route, {
                    responseType: 'blob',
                });
                if (!active) return;

                // Se fuerza el mimetype: si el backend no envía
                // "Content-Type: application/pdf", navegadores/WebViews
                // antiguos (tablets Android viejas) no reconocen el blob
                // como PDF y muestran una pantalla genérica de "archivo
                // desconocido" en vez de previsualizarlo.
                const blob = new Blob([response.data], { type: 'application/pdf' });
                url = URL.createObjectURL(blob);

                // Teléfono en el navegador con visor de PDF propio (Safari iOS): se muestra directo en la
                // pestaña, como antes; Safari tiene botón atrás. En la app instalada no (no hay atrás) y
                // Android Chrome no muestra PDF en pestaña (lo descarga): ahí quedan Compartir/Descargar
                const touch = window.matchMedia('(pointer: coarse)').matches;
                if (touch && !isStandalonePWA() && navigator.pdfViewerEnabled) {
                    window.location.href = url;
                    return;
                }

                setPdfBlob(blob);
                setPdfUrl(url);

                const file = new File([blob], `${pdf.name}.pdf`, { type: 'application/pdf' });
                setCanShareFile(
                    typeof navigator.canShare === "function" &&
                    navigator.canShare({ files: [file] })
                );
            } catch (err) {
                console.error('Error al obtener el PDF:', err);
                if (active) setError(navigator.onLine ? 'No se pudo cargar el PDF' : 'Sin conexión: no se pudo cargar el PDF');
            }
        };

        if (pdf) fetchPdf();

        return () => {
            active = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [pdf, axiosAuth]);

    const downloadPdf = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${pdf.name}.pdf`;
        link.click();
    };

    // En navegador (no instalada) abre el visor nativo en otra pestaña
    const openPdf = () => {
        if (!pdfUrl) return;
        const tab = window.open(pdfUrl, '_blank');
        if (!tab) downloadPdf(); // Bloqueado: descarga directa
    };

    const sharePdf = async () => {
        if (!pdfBlob) return;
        try {
            const file = new File([pdfBlob], `${pdf.name}.pdf`, { type: 'application/pdf' });
            await navigator.share({ files: [file], title: pdf.name });
        } catch (err) {
            // El usuario canceló el share sheet o el navegador lo rechazó
            console.error('Error al compartir el PDF:', err);
        }
    };

    return { isOpen, isTouch, isStandalone, pdfUrl, error, toggle, downloadPdf, openPdf, sharePdf, canShareFile };
};
