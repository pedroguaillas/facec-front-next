"use client";

import { useState } from "react";
import { Modal, PrimaryButton, SelectPaymentSource, TextInput } from "@/components";
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
        const response = partyType === 'customer'
            ? await registerCustomerAdvance(axiosAuth, partyId, parsed.data)
            : await registerProviderAdvance(axiosAuth, partyId, parsed.data);
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
                <TextInput type="number" label="Monto" name="amount" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} required />
                <SelectPaymentSource sourceType={sourceType} sourceId={sourceId} error={errors.source_type || errors.source_id} onChange={handleSelectSource} />
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
