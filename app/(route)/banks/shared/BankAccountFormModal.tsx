"use client";

import { useEffect, useState } from "react";
import { Modal, PrimaryButton, SelectOption, TextInput } from "@/components";
import { bankAccountTypeOptions, initialBankAccount } from "@/constants";
import { bankAccountSchema } from "@/schemas/bank-account.schema";
import { storeBankAccount, updateBankAccount } from "@/services/bankAccountServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { BankAccount } from "@/types";

interface Props {
    bankId: number;
    account: BankAccount | null;
    onClose: () => void;
    onSaved: () => void;
}

export const BankAccountFormModal = ({ bankId, account, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [form, setForm] = useState<BankAccount>(initialBankAccount);
    const [errors, setErrors] = useState<Partial<Record<keyof BankAccount, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setForm(account ?? { ...initialBankAccount, bank_id: bankId });
        setErrors({});
    }, [account, bankId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = bankAccountSchema.safeParse({ ...form, bank_id: bankId });
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsSaving(true);
        const response = account
            ? await updateBankAccount(account.id, axiosAuth, parsed.data)
            : await storeBankAccount(axiosAuth, parsed.data);
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }

        onSaved();
    };

    return (
        <Modal isOpen title={account ? 'Editar cuenta bancaria' : 'Nueva cuenta bancaria'} onClose={onClose} modalSize="sm">
            <form onSubmit={handleSubmit}>
                <TextInput type='text' label='Número de cuenta' value={form.account_number} error={errors.account_number} onChange={handleChange} name='account_number' maxLength={30} required />
                <SelectOption label="Tipo" name='type' options={bankAccountTypeOptions} selectedValue={form.type} handleSelect={handleChange} required />
                {!account && (
                    <TextInput type='number' label='Saldo inicial' value={form.opening_balance?.toString() ?? ''} error={errors.opening_balance} onChange={handleChange} name='opening_balance' />
                )}

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Guardar' type='submit' action='store' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
