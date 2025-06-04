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

                const blob = response.data;
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (error) {
                console.error('Error al obtener el PDF:', error);
            }
        };

        if (pdf) {
            fetchPdf();
        }
    }, [pdf, axiosAuth]);

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
                    window.location.href = pdfUrl; // Fallback si bloqueado
                }
            }
        } else if (!canDisplayPDF()) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${pdf.name}.pdf`;
            link.click();
        } else {
            setIsOpen(true);
        }
    }, [pdfUrl, pdf]);

    return { isOpen, isMobile, pdfUrl, toggle };
};
