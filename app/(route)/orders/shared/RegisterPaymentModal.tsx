"use client";

import { useEffect, useState } from "react";
import { Modal, PaymentReceiptInput, PrimaryButton, SelectPaymentSource, TextInput, usePaymentReceipt } from "@/components";
import { registerPaymentSchema } from "@/schemas/payment.schema";
import { getInvoice, registerOrderPayment } from "../services/invoiceServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import { getDate } from "@/helpers/dateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { MovementSourceType } from "@/types";

interface Props {
    orderId: number;
    onClose: () => void;
    onSaved: () => void;
}

export const RegisterPaymentModal = ({ orderId, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [total, setTotal] = useState<number | null>(null);
    const [paid, setPaid] = useState(0);
    const [isCredit, setIsCredit] = useState(false);
    const [amount, setAmount] = useState('');
    const [sourceType, setSourceType] = useState<MovementSourceType | ''>('');
    const [sourceId, setSourceId] = useState<number | ''>('');
    const [date, setDate] = useState(getDate());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { receipt, setReceipt, uploadReceipt } = usePaymentReceipt();
    const [receiptNumber, setReceiptNumber] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            const { data } = await getInvoice(axiosAuth, String(orderId));
            if (data) {
                const orderTotal = Number(data.order.total);
                const orderPaid = Number(data.order.paid ?? 0);
                setTotal(orderTotal);
                setPaid(orderPaid);
                // Por defecto se abona todo lo pendiente; el usuario puede bajarlo
                setAmount(String(Number(Math.max(0, orderTotal - orderPaid).toFixed(2))));
                setIsCredit(data.order.payment_type === 'CREDITO');
            }
        };
        fetchOrder();
    }, [axiosAuth, orderId]);

    const pending = total !== null ? Number((total - paid).toFixed(2)) : null;

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
        const response = await registerOrderPayment(axiosAuth, orderId, { ...parsed.data, receipt_id, ...(sourceType === 'bank_account' && receiptNumber.trim() && { receipt_number: receiptNumber.trim() }) });
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
        <Modal isOpen title="Registrar pago" onClose={onClose} modalSize="sm">
            {total === null ? (
                <p className="text-sm opacity-70">Cargando...</p>
            ) : !isCredit ? (
                <p className="text-sm opacity-70">Este documento no es a crédito, no admite abonos.</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <p className="text-sm opacity-70 my-2">
                        Total: <strong>{total.toFixed(2)}</strong> · Pagado: <strong>{paid.toFixed(2)}</strong> · Pendiente: <strong>{pending?.toFixed(2)}</strong>
                    </p>

                    <TextInput type="text" inputMode="decimal" label="Monto a abonar" name="amount" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} required />
                    <SelectPaymentSource sourceType={sourceType} sourceId={sourceId} error={errors.source_type || errors.source_id} onChange={handleSelectSource} />
                    {sourceType === 'bank_account' && (
                        <PaymentReceiptInput number={receiptNumber} numberError={errors.receipt_number} onNumberChange={(value) => { setReceiptNumber(value); setErrors(prev => ({ ...prev, receipt_number: '' })); }} file={receipt} error={errors.receipt || errors.receipt_id} onChange={(file) => { setReceipt(file); setErrors(prev => ({ ...prev, receipt: '', receipt_id: '' })); }} />
                    )}
                    <TextInput type="date" label="Fecha" name="date" value={date} onChange={(e) => setDate(e.target.value)} max={getDate()} />

                    <div className='flex justify-end mt-4'>
                        <div className='w-28'>
                            <PrimaryButton label='Abonar' type='submit' action='store' isLoading={isSaving} />
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    )
}
