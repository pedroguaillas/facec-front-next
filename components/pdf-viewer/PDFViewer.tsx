import { Modal } from '@/components';
import { usePDFViewer } from './hooks/usePDFViewer';
import React from 'react';

export const PDFViewer = ({ pdf }: { pdf: { route: string, name: string } }) => {

    const { isOpen, isMobile, pdfUrl, toggle, downloadPdf, sharePdf, canShareFile } = usePDFViewer({ pdf });

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
                        <div className="py-2 text-center flex justify-center gap-4">
                            {isMobile && (
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Abrir PDF en nueva pestaña
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={downloadPdf}
                                className="text-blue-600 underline"
                            >
                                Descargar PDF
                            </button>
                            {canShareFile && (
                                <button
                                    type="button"
                                    onClick={sharePdf}
                                    className="text-blue-600 underline"
                                >
                                    Compartir
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <p>Cargando PDF...</p>
                )}
            </div>
        </Modal>
    );
}
