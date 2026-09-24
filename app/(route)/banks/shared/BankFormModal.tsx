"use client";

import { useEffect, useState } from "react";
import { Modal, PrimaryButton, TextInput } from "@/components";
import { initialBank } from "@/constants";
import { bankSchema } from "@/schemas/bank.schema";
import { storeBank, updateBank } from "@/services/bankServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Bank } from "@/types";

interface Props {
    bank: Bank | null;
    onClose: () => void;
    onSaved: () => void;
}

export const BankFormModal = ({ bank, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [form, setForm] = useState<Bank>(initialBank);
    const [errors, setErrors] = useState<Partial<Record<keyof Bank, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setForm(bank ?? initialBank);
        setErrors({});
    }, [bank]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = bankSchema.safeParse(form);
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsSaving(true);
        const response = bank
            ? await updateBank(bank.id + '', axiosAuth, parsed.data)
            : await storeBank(axiosAuth, parsed.data);
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }

        onSaved();
    };

    return (
        <Modal isOpen title={bank ? 'Editar banco' : 'Nuevo banco'} onClose={onClose} modalSize="sm">
            <form onSubmit={handleSubmit}>
                <TextInput type='text' label='Nombre' value={form.name} error={errors.name} onChange={handleChange} name='name' maxLength={150} required />

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Guardar' type='submit' action='store' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
