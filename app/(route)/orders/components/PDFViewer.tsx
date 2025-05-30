import { Modal } from '@/components';
import { useEffect, useState } from 'react';

// Extend the Navigator interface to include the 'standalone' property
interface NavigatorExtended extends Navigator {
    standalone?: boolean;
}

export default function PDFViewer({
    pdfUrl,
    base64Pdf,
    filename = 'documento.pdf',
}: {
    pdfUrl?: string;
    base64Pdf?: string;
    filename?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [finalPdfUrl, setFinalPdfUrl] = useState<string | null>(null);

    const isIOS = () =>
        typeof window !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

    const isChromeIOS = () =>
        typeof window !== 'undefined' && /CriOS/.test(navigator.userAgent);

    const isStandalonePWA = () =>
        typeof window !== 'undefined' &&
        'standalone' in window.navigator &&
        (window.navigator as NavigatorExtended).standalone;

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

    // Convertir base64 a Blob si es necesario
    useEffect(() => {
        if (base64Pdf) {
            const binary = atob(base64Pdf);
            const array = Uint8Array.from(binary, char => char.charCodeAt(0));
            const blob = new Blob([array], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setFinalPdfUrl(url);
        } else if (pdfUrl) {
            setFinalPdfUrl(pdfUrl);
        }
    }, [base64Pdf, pdfUrl]);

    // Mostrar, redirigir o descargar
    useEffect(() => {
        if (!finalPdfUrl) return;

        if (isIOS() && (isStandalonePWA() || isChromeIOS())) {
            // Redirigir directamente en PWA o Chrome iOS
            window.location.href = finalPdfUrl;
        } else if (!canDisplayPDF()) {
            // Forzar descarga si no se puede mostrar
            const link = document.createElement('a');
            link.href = finalPdfUrl;
            link.download = filename;
            link.click();
        } else {
            // Mostrar en modal
            setIsOpen(true);
        }
    }, [finalPdfUrl, filename]);

    const canDisplayPDF = () => {
        return typeof window !== 'undefined' && 'PDFViewer' in window || !/MSIE|Trident/.test(navigator.userAgent);
    };

    // No mostrar modal si ya se redirige
    if ((isIOS() && (isStandalonePWA() || isChromeIOS())) || !canDisplayPDF()) {
        return null;
    }

    return (
        <Modal showCloseButton={false} isOpen={isOpen} onClose={toggle}>
            <div className={`w-full ${isMobile ? 'h-[90vh]' : 'h-[80vh]'} relative`}>
                {finalPdfUrl ? (
                    <>
                        <iframe
                            src={finalPdfUrl}
                            title="PDF Viewer"
                            className="w-full h-full border-none rounded-md shadow-md"
                        />
                        {isMobile && (
                            <div className="py-2 text-center">
                                <a
                                    href={finalPdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Abrir PDF en nueva pestaña
                                </a>
                            </div>
                        )}
                    </>
                ) : (
                    <p>Cargando PDF...</p>
                )}
            </div>
        </Modal>
    );
}
