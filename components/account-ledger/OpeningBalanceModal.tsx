"use client";

import { useState } from "react";
import { Modal, PrimaryButton, TextInput } from "@/components";
import { openingBalanceSchema } from "@/schemas/opening-balance.schema";
import { registerCustomerOpeningBalance, registerProviderOpeningBalance } from "@/services/accountLedgerServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import { getDate } from "@/helpers/dateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";

interface Props {
    partyType: 'customer' | 'provider';
    partyId: number;
    onClose: () => void;
    onSaved: () => void;
}

export const OpeningBalanceModal = ({ partyType, partyId, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(getDate());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = openingBalanceSchema.safeParse({ amount, date: date || undefined });
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsSaving(true);
        const response = partyType === 'customer'
            ? await registerCustomerOpeningBalance(axiosAuth, partyId, parsed.data)
            : await registerProviderOpeningBalance(axiosAuth, partyId, parsed.data);
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
        <Modal isOpen title="Registrar saldo anterior" onClose={onClose} modalSize="sm">
            <p className="text-sm opacity-70 my-2">
                Lo que {partyType === 'customer' ? 'este cliente ya debía' : 'ya le debías a este proveedor'} antes de usar el sistema. Solo se puede registrar una vez.
            </p>
            <form onSubmit={handleSubmit}>
                <TextInput type="text" inputMode="decimal" label="Monto" name="amount" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} required />
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
