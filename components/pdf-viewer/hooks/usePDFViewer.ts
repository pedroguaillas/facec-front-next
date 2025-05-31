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
    const axiosAuth = useAxiosAuth(); // ✅ Usa el hook dentro del componente

    const isIOS = () =>
        typeof window !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

    const isChromeIOS = () =>
        typeof window !== 'undefined' && /CriOS/.test(navigator.userAgent);

    const isStandalonePWA = () =>
        typeof window !== 'undefined' &&
        ('standalone' in window.navigator && (window.navigator as NavigatorExtended).standalone);

    const canDisplayPDF = () => {
        return typeof window !== 'undefined' && 'PDFViewer' in window || !/MSIE|Trident/.test(navigator.userAgent);
    };

    const toggle = () => setIsOpen(!isOpen);

    // Detectar si es móvil
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 760);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Hacer fetch del PDF como blob
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

    // Mostrar o redirigir según el dispositivo
    useEffect(() => {
        if (!pdfUrl) return;

        if (isIOS() && (isStandalonePWA() || isChromeIOS())) {
            window.location.href = pdfUrl;
        } else if (!canDisplayPDF()) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${pdf.name}.pdf`;
            link.click();
        } else {
            setIsOpen(true);
        }
    }, [pdfUrl, pdf]);

    return { isOpen, isMobile, pdfUrl, toggle, isIOS, isStandalonePWA, isChromeIOS, canDisplayPDF }
}
