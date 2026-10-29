"use client";

import { useState } from "react";
import { Modal, PrimaryButton, TextInput } from "@/components";
import { openCashRegisterSchema } from "@/schemas/cash-register.schema";
import { openCashRegister } from "@/services/cashRegisterServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { DenominationCount } from "@/types";
import { DenominationCountForm } from "./DenominationCountForm";

interface Props {
    cashRegisterId: number;
    onClose: () => void;
    onSaved: () => void;
}

export const OpenCashRegisterModal = ({ cashRegisterId, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [initialBalance, setInitialBalance] = useState('');
    const [denominations, setDenominations] = useState<DenominationCount[]>([]);
    const [countedTotal, setCountedTotal] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = openCashRegisterSchema.safeParse({ initial_balance: initialBalance, denominations });
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsSaving(true);
        const response = await openCashRegister(cashRegisterId, axiosAuth, parsed.data);
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }
        if (response.error) {
            setErrors({ initial_balance: response.error });
            return;
        }

        onSaved();
    };

    return (
        <Modal isOpen title="Abrir caja" onClose={onClose} modalSize="lg">
            <form onSubmit={handleSubmit}>
                <TextInput type="text" inputMode="decimal" label="Saldo inicial" name="initial_balance" value={initialBalance} error={errors.initial_balance} onChange={(e) => setInitialBalance(e.target.value)} required />

                <p className="text-sm opacity-70 my-2">Arqueo de apertura (opcional). Total contado: <strong>{countedTotal.toFixed(2)}</strong></p>
                <DenominationCountForm onChange={(counts, total) => { setDenominations(counts); setCountedTotal(total); setInitialBalance(total > 0 ? String(total) : ''); }} />

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Abrir' type='submit' action='store' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
