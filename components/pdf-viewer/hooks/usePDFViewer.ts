"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useEffect, useState } from "react";

interface NavigatorExtended extends Navigator {
    standalone?: boolean;
}

export const usePDFViewer = ({ pdf }: { pdf: { route: string, name: string } }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [canShareFile, setCanShareFile] = useState<boolean>(false);
    const axiosAuth = useAxiosAuth();

    const isIOS = () =>
        typeof window !== "undefined" && /iPhone/i.test(navigator.userAgent);

    const isAndroid = () =>
        typeof window !== "undefined" && /Android/i.test(navigator.userAgent);

    const isStandalonePWA = () =>
        typeof window !== "undefined" &&
        (
            (window.navigator as NavigatorExtended).standalone === true ||
            window.matchMedia('(display-mode: standalone)').matches
        );

    const canDisplayPDF = () =>
        typeof window !== "undefined" && 'PDFViewer' in window || !/MSIE|Trident/.test(navigator.userAgent);

    const toggle = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 760);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                const response = await axiosAuth.get(pdf.route, {
                    responseType: 'blob',
                });

                // Se fuerza el mimetype: si el backend no envía
                // "Content-Type: application/pdf", navegadores/WebViews
                // antiguos (tablets Android viejas) no reconocen el blob
                // como PDF y muestran una pantalla genérica de "archivo
                // desconocido" en vez de previsualizarlo.
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setPdfBlob(blob);
                setPdfUrl(url);

                const file = new File([blob], `${pdf.name}.pdf`, { type: 'application/pdf' });
                setCanShareFile(
                    typeof navigator !== "undefined" &&
                    typeof navigator.canShare === "function" &&
                    navigator.canShare({ files: [file] })
                );
            } catch (error) {
                console.error('Error al obtener el PDF:', error);
            }
        };

        if (pdf) {
            fetchPdf();
        }

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdf, axiosAuth]);

    const downloadPdf = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${pdf.name}.pdf`;
        link.click();
    };

    const sharePdf = async () => {
        if (!pdfBlob) return;
        try {
            const file = new File([pdfBlob], `${pdf.name}.pdf`, { type: 'application/pdf' });
            await navigator.share({ files: [file], title: pdf.name });
        } catch (error) {
            // El usuario canceló el share sheet o el navegador lo rechazó
            console.error('Error al compartir el PDF:', error);
        }
    };

    useEffect(() => {
        if (!pdfUrl) return;

        if (isIOS()) {
            window.location.href = pdfUrl;
        } else if (isAndroid()) {
            if (isStandalonePWA()) {
                window.location.href = pdfUrl;
            } else {
                const newTab = window.open(pdfUrl, '_blank');
                if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                    downloadPdf(); // Fallback si bloqueado: descarga directa
                }
            }
        } else if (!canDisplayPDF()) {
            downloadPdf();
        } else {
            setIsOpen(true);
        }
    }, [pdfUrl, pdf]);

    return { isOpen, isMobile, pdfUrl, toggle, downloadPdf, sharePdf, canShareFile };
};
