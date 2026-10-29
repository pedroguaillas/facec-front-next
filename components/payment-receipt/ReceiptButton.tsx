"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaReceipt } from "react-icons/fa";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getMovementReceipt, updateMovementReceipt } from "@/services/paymentReceiptServices";
import { Movement } from "@/types";
import { Modal } from "../modal/Modal";
import { PrimaryButton } from "../primary-button/PrimaryButton";
import { PaymentReceiptInput } from "./PaymentReceiptInput";
import { uploadReceiptFile } from "./usePaymentReceipt";

interface Props {
    movement: Movement;
    // Movimiento actualizado tras editar el comprobante
    onUpdated?: (movement: Movement) => void;
}

// Solo los movimientos con cuenta bancaria llevan comprobante (número e imagen)
const isBankMovement = (movement: Movement) =>
    movement.source_type === 'bank_account' || movement.destination_type === 'bank_account';

// Comprobante de un movimiento: ver el guardado y, con banco, agregarlo o cambiarlo después
export const ReceiptButton = ({ movement, onUpdated }: Props) => {
    const [open, setOpen] = useState(false);
    const editable = isBankMovement(movement) && !!onUpdated;
    const hasReceipt = !!movement.atts.has_receipt;
    if (!hasReceipt && !editable) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer whitespace-nowrap"
            >
                <FaReceipt aria-hidden="true" /> {hasReceipt || movement.atts.receipt_number ? 'Comprobante' : 'Agregar comprobante'}
            </button>
            {open && createPortal(
                <ReceiptModal movement={movement} editable={editable} onClose={() => setOpen(false)} onUpdated={(updated) => { onUpdated?.(updated); setOpen(false); }} />,
                document.body,
            )}
        </>
    );
};

interface ModalProps {
    movement: Movement;
    editable: boolean;
    onClose: () => void;
    onUpdated: (movement: Movement) => void;
}

const ReceiptModal = ({ movement, editable, onClose, onUpdated }: ModalProps) => {
    const axiosAuth = useAxiosAuth();
    const hasReceipt = !!movement.atts.has_receipt;
    const [saved, setSaved] = useState<{ url: string; isPdf: boolean } | null>(null);
    const [failed, setFailed] = useState(false);
    const [number, setNumber] = useState(movement.atts.receipt_number ?? '');
    const [file, setFile] = useState<File | null>(null);
    const [remove, setRemove] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!hasReceipt) return;
        let url: string | null = null;
        let active = true;
        getMovementReceipt(axiosAuth, movement.id).then(({ data }) => {
            if (!active) return;
            if (!data) {
                setFailed(true);
                return;
            }
            url = URL.createObjectURL(data);
            setSaved({ url, isPdf: data.type === 'application/pdf' });
        });
        return () => {
            active = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [axiosAuth, movement.id, hasReceipt]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const { receipt_id, error } = await uploadReceiptFile(axiosAuth, file);
        if (error) {
            setIsSaving(false);
            setErrors({ receipt: error });
            return;
        }
        const response = await updateMovementReceipt(axiosAuth, movement.id, {
            receipt_number: number.trim() || null,
            // Imagen nueva reemplaza la anterior; "Quitar" la elimina; si no, sin cambio
            ...(receipt_id ? { receipt_id } : remove && { receipt_id: null }),
        });
        setIsSaving(false);
        if (response.data) {
            onUpdated(response.data);
            return;
        }
        setErrors(response.errors ?? { receipt_number: response.error ?? 'No se pudo guardar el comprobante' });
    };

    // Imagen guardada (se oculta si se elige otra o se marca para quitar)
    const savedView = hasReceipt && !file && !remove && (
        failed ? (
            <p className="py-2 text-sm text-ink-3">No se pudo cargar el comprobante.</p>
        ) : !saved ? (
            <p className="py-2 text-sm text-ink-3">Cargando…</p>
        ) : (
            <div>
                {saved.isPdf ? (
                    <iframe src={saved.url} title="Comprobante de pago" className="w-full h-[60vh] rounded border border-line" />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={saved.url} alt="Comprobante de pago" className="mx-auto max-h-[60vh] object-contain" />
                )}
                <div className="mt-2 flex gap-4 text-sm">
                    <a href={saved.url} download={`comprobante-${movement.id}`} className="text-primary hover:underline">Descargar</a>
                    {editable && (
                        <button type="button" onClick={() => setRemove(true)} className="text-red-500 hover:underline cursor-pointer">Quitar imagen</button>
                    )}
                </div>
            </div>
        )
    );

    return (
        <Modal isOpen onClose={onClose} title="Comprobante de pago" modalSize="lg">
            {!editable ? (
                <>
                    {movement.atts.receipt_number && <p className="mb-2 text-sm text-ink-2">Número: <strong>{movement.atts.receipt_number}</strong></p>}
                    {savedView}
                </>
            ) : (
                <form onSubmit={handleSubmit}>
                    {savedView}
                    {remove && (
                        <p className="mb-2 text-sm text-ink-3">
                            La imagen se quitará al guardar. <button type="button" onClick={() => setRemove(false)} className="text-primary hover:underline cursor-pointer">Deshacer</button>
                        </p>
                    )}
                    <PaymentReceiptInput
                        number={number}
                        numberError={errors.receipt_number}
                        onNumberChange={(value) => { setNumber(value); setErrors(prev => ({ ...prev, receipt_number: '' })); }}
                        file={file}
                        error={errors.receipt || errors.receipt_id}
                        onChange={(value) => { setFile(value); setErrors(prev => ({ ...prev, receipt: '', receipt_id: '' })); }}
                    />
                    <div className="flex justify-end mt-4">
                        <div className="w-28">
                            <PrimaryButton label="Guardar" type="submit" action="store" isLoading={isSaving} />
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
};
