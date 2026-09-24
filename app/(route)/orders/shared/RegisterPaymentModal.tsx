"use client";

import { useEffect, useState } from "react";
import { Modal, PrimaryButton, SelectPaymentSource, TextInput } from "@/components";
import { registerPaymentSchema } from "@/schemas/payment.schema";
import { getInvoice, registerOrderPayment } from "../services/invoiceServices";
import { parseZodErrors } from "@/helpers/zodHelper";
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
    const [date, setDate] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            const { data } = await getInvoice(axiosAuth, String(orderId));
            if (data) {
                setTotal(data.order.total);
                setPaid(data.order.paid ?? 0);
                setIsCredit(data.order.payment_type === 'CREDITO');
            }
        };
        fetchOrder();
    }, [axiosAuth, orderId]);

    const pending = total !== null ? Number((total - paid).toFixed(2)) : null;

    const handleSelectSource = (type: MovementSourceType, id: number) => {
        setSourceType(type);
        setSourceId(id);
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
        const response = await registerOrderPayment(axiosAuth, orderId, parsed.data);
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

                    <TextInput type="number" label="Monto a abonar" name="amount" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} required />
                    <SelectPaymentSource sourceType={sourceType} sourceId={sourceId} error={errors.source_type || errors.source_id} onChange={handleSelectSource} />
                    <TextInput type="date" label="Fecha" name="date" value={date} onChange={(e) => setDate(e.target.value)} />

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
