import { Modal } from '@/components';
import { usePDFViewer } from './hooks/usePDFViewer';
import { FaDownload, FaExternalLinkAlt, FaFilePdf, FaShareAlt } from 'react-icons/fa';
import React from 'react';
import { PdfSidePanel } from './PdfSidePanel';

const actionClass = 'flex-1 inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.97]';

// Escritorio: vista previa en un panel a la derecha de alto completo (el visor del navegador descarga e imprime).
// Celular/tablet: sin vista previa; compartir (guardar en Archivos, WhatsApp, imprimir), descargar o abrir.
// Nunca se navega fuera de la app (en la PWA instalada no hay botón atrás)
export const PDFViewer = ({ pdf }: { pdf: { route: string, name: string } }) => {

    const { isOpen, isTouch, isStandalone, pdfUrl, error, toggle, downloadPdf, openPdf, sharePdf, canShareFile } = usePDFViewer({ pdf });

    const preview = !isTouch;

    if (preview) {
        if (!isOpen) return null;
        return (
            <PdfSidePanel title={pdf.name} onClose={toggle}>
                {error ? (
                    <p className="py-8 text-center text-sm text-sri-fail">{error}</p>
                ) : !pdfUrl ? (
                    <p className="py-8 text-center text-sm text-ink-3">Cargando PDF...</p>
                ) : (
                    <iframe src={pdfUrl} title={pdf.name} className="w-full h-full border-none bg-white" />
                )}
            </PdfSidePanel>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={toggle} title={pdf.name} modalSize="sm">
            {error ? (
                <p className="py-8 text-center text-sm text-sri-fail">{error}</p>
            ) : !pdfUrl ? (
                <p className="py-8 text-center text-sm text-ink-3">Cargando PDF...</p>
            ) : (
                <>
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <FaFilePdf className="text-4xl text-danger" />
                        <p className="text-sm text-ink-2">El PDF está listo.</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-3">
                        {canShareFile && (
                            <button type="button" onClick={sharePdf} className={`${actionClass} bg-primary text-white hover:bg-primaryhover`}>
                                <FaShareAlt /> Compartir
                            </button>
                        )}
                        <button type="button" onClick={downloadPdf} className={`${actionClass} border border-line-strong text-ink-1 hover:bg-surface-sunken`}>
                            <FaDownload /> Descargar
                        </button>
                        {!isStandalone && (
                            <button type="button" onClick={openPdf} className={`${actionClass} border border-line-strong text-ink-1 hover:bg-surface-sunken`}>
                                <FaExternalLinkAlt /> Abrir
                            </button>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
};
