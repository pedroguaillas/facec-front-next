import { Modal } from '@/components';
import { useEffect, useState } from 'react';

export default function PDFViewer({ pdfUrl }: { pdfUrl: string }) {

    const [isOpen, setIsOpen] = useState(false);

    const toogle = () => {
        setIsOpen(!isOpen);
    }

    useEffect(() => {
        setIsOpen(true);
    }, [pdfUrl]);

    return (
        <Modal showCloseButton={false} isOpen={isOpen} onClose={toogle}>
            <div style={{ width: '100%', height: '80vh' }}>
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="PDF Viewer"
                        className='rounded-md shadow-md'
                    />
                ) : (
                    <p>Loading PDF...</p>
                )}
            </div>
        </Modal>
    );
}
