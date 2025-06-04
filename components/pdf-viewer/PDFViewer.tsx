import { Modal } from '@/components';
import { usePDFViewer } from './hooks/usePDFViewer';
import React from 'react';

export const PDFViewer = ({ pdf }: { pdf: { route: string, name: string } }) => {

    const { isOpen, isMobile, pdfUrl, toggle } = usePDFViewer({ pdf });

    // Evitar renderizar el modal si se redirige
    if (isMobile) {
        return null;
    }

    return (
        <Modal showCloseButton={false} isOpen={isOpen} onClose={toggle}>
            <div className={`w-full ${isMobile ? 'h-[90vh]' : 'h-[80vh]'} relative`}>
                {pdfUrl ? (
                    <>
                        <iframe
                            src={pdfUrl}
                            title="PDF Viewer"
                            className="w-full h-full border-none rounded-md shadow-md"
                        />
                        {isMobile && (
                            <div className="py-2 text-center">
                                <a
                                    href={pdfUrl}
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
