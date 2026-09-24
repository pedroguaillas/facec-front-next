"use client";

import { useState } from "react";
import { Modal, PrimaryButton } from "@/components";
import { closeCashRegisterSchema } from "@/schemas/cash-register.schema";
import { closeCashRegister } from "@/services/cashRegisterServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { DenominationCount } from "@/types";
import { DenominationCountForm } from "./DenominationCountForm";

interface Props {
    cashRegisterId: number;
    onClose: () => void;
    onSaved: () => void;
}

export const CloseCashRegisterModal = ({ cashRegisterId, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [denominations, setDenominations] = useState<DenominationCount[]>([]);
    const [countedTotal, setCountedTotal] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = closeCashRegisterSchema.safeParse({ denominations });
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsSaving(true);
        const response = await closeCashRegister(cashRegisterId, axiosAuth, parsed.data);
        setIsSaving(false);

        if (response.error) {
            setErrors({ general: response.error });
            return;
        }

        onSaved();
    };

    return (
        <Modal isOpen title="Cerrar caja" onClose={onClose} modalSize="lg">
            <form onSubmit={handleSubmit}>
                <p className="text-sm opacity-70 my-2">Arqueo de cierre (opcional). Total contado: <strong>{countedTotal.toFixed(2)}</strong></p>
                <DenominationCountForm onChange={(counts, total) => { setDenominations(counts); setCountedTotal(total); }} />
                {errors.general && <p className="text-xs text-red-500 mt-1">{errors.general}</p>}

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Cerrar' type='submit' action='delete' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
