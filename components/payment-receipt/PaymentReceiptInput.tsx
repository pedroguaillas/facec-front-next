"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaReceipt } from "react-icons/fa";
import { FileDropInput } from "../file-drop-input/FileDropInput";
import { Modal } from "../modal/Modal";
import { TextInput } from "../text-input/TextInput";

export const RECEIPT_ACCEPT = ".jpg,.jpeg,.png,.webp";
const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RECEIPT_MAX_MB = 5;

// Validación local del comprobante: solo imagen y hasta 5 MB (el backend valida igual)
export const receiptError = (file: File | null): string | null => {
    if (!file) return null;
    if (!RECEIPT_TYPES.includes(file.type)) return 'El comprobante debe ser una imagen (JPG, PNG o WEBP)';
    if (file.size > RECEIPT_MAX_MB * 1024 * 1024) return `El comprobante no puede pesar más de ${RECEIPT_MAX_MB} MB`;
    return null;
};

interface Props {
    number: string;
    numberError?: string;
    onNumberChange: (number: string) => void;
    file: File | null;
    error?: string;
    onChange: (file: File | null) => void;
}

// Comprobante de un pago o cobro con cuenta bancaria: número y imagen con vista previa ampliable
export const PaymentReceiptInput = ({ number, numberError, onNumberChange, file, error, onChange }: Props) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [zoom, setZoom] = useState(false);
    const localError = receiptError(file);

    useEffect(() => {
        if (!file || receiptError(file)) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div>
            <TextInput type="text" label="Número de comprobante (opcional)" name="receipt_number" value={number} error={numberError} onChange={(e) => onNumberChange(e.target.value)} maxLength={49} />
            <FileDropInput
                name="receipt"
                label="Imagen del comprobante (opcional)"
                accept={RECEIPT_ACCEPT}
                file={file}
                icon={<FaReceipt />}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                onClear={() => onChange(null)}
            />
            {preview && (
                <button
                    type="button"
                    onClick={() => setZoom(true)}
                    title="Ver comprobante"
                    className="block w-full rounded-lg border border-line bg-surface p-1 cursor-zoom-in"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Vista previa del comprobante" className="mx-auto max-h-48 object-contain rounded" />
                </button>
            )}
            {(localError || error) && <p className="mt-1 text-sm text-red-500">{localError || error}</p>}
            {/* Portal: dentro del modal del pago el `fixed` quedaría atrapado por su transform */}
            {zoom && preview && createPortal(
                <Modal isOpen onClose={() => setZoom(false)} title="Comprobante de pago" modalSize="lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Comprobante de pago" className="mx-auto max-h-[75vh] object-contain" />
                </Modal>,
                document.body,
            )}
        </div>
    );
};
