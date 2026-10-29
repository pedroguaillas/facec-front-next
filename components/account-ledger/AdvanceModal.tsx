"use client";

import { useState } from "react";
import { Modal, PrimaryButton, SelectPaymentSource, TextInput } from "@/components";
import { PaymentReceiptInput } from "../payment-receipt/PaymentReceiptInput";
import { usePaymentReceipt } from "../payment-receipt/usePaymentReceipt";
import { registerPaymentSchema } from "@/schemas/payment.schema";
import { registerCustomerAdvance, registerProviderAdvance } from "@/services/accountLedgerServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import { getDate } from "@/helpers/dateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { MovementSourceType } from "@/types";

interface Props {
    partyType: 'customer' | 'provider';
    partyId: number;
    onClose: () => void;
    onSaved: () => void;
}

export const AdvanceModal = ({ partyType, partyId, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [amount, setAmount] = useState('');
    const [sourceType, setSourceType] = useState<MovementSourceType | ''>('');
    const [sourceId, setSourceId] = useState<number | ''>('');
    const [date, setDate] = useState(getDate());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { receipt, setReceipt, uploadReceipt } = usePaymentReceipt();
    const [receiptNumber, setReceiptNumber] = useState('');

    const handleSelectSource = (type: MovementSourceType, id: number) => {
        setSourceType(type);
        setSourceId(id);
        // El comprobante solo va con cuenta bancaria
        if (type !== 'bank_account') setReceipt(null);
        setErrors(prev => ({ ...prev, source_type: '', source_id: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = registerPaymentSchema.safeParse({
            amount,
            source_type: sourceType,
            source_id: sourceId,
            date: date || undefined,
        });
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsSaving(true);
        const { receipt_id, error: receiptUploadError }: { receipt_id?: number; error?: string } =
            sourceType === 'bank_account' ? await uploadReceipt() : {};
        if (receiptUploadError) {
            setIsSaving(false);
            setErrors({ receipt: receiptUploadError });
            return;
        }
        const response = partyType === 'customer'
            ? await registerCustomerAdvance(axiosAuth, partyId, { ...parsed.data, receipt_id, ...(sourceType === 'bank_account' && receiptNumber.trim() && { receipt_number: receiptNumber.trim() }) })
            : await registerProviderAdvance(axiosAuth, partyId, { ...parsed.data, receipt_id, ...(sourceType === 'bank_account' && receiptNumber.trim() && { receipt_number: receiptNumber.trim() }) });
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }
        if (response.error) {
            setErrors({ amount: response.error });
            return;
        }

        onSaved();
    };

    return (
        <Modal isOpen title="Registrar anticipo" onClose={onClose} modalSize="sm">
            <p className="text-sm opacity-70 my-2">
                Dinero recibido {partyType === 'customer' ? 'del cliente' : 'del proveedor'} antes de la factura/compra. Se aplicará automáticamente a la próxima venta o compra a crédito.
            </p>
            <form onSubmit={handleSubmit}>
                <TextInput type="text" inputMode="decimal" label="Monto" name="amount" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} required />
                <SelectPaymentSource sourceType={sourceType} sourceId={sourceId} error={errors.source_type || errors.source_id} onChange={handleSelectSource} />
                {sourceType === 'bank_account' && (
                    <PaymentReceiptInput number={receiptNumber} numberError={errors.receipt_number} onNumberChange={(value) => { setReceiptNumber(value); setErrors(prev => ({ ...prev, receipt_number: '' })); }} file={receipt} error={errors.receipt || errors.receipt_id} onChange={(file) => { setReceipt(file); setErrors(prev => ({ ...prev, receipt: '', receipt_id: '' })); }} />
                )}
                <TextInput type="date" label="Fecha" name="date" value={date} onChange={(e) => setDate(e.target.value)} max={getDate()} />

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Guardar' type='submit' action='store' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
