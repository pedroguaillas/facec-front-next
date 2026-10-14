"use client";

import { useEffect, useState } from "react";
import { Modal, PrimaryButton, SelectOption, TextInput } from "@/components";
import { bankAccountTypeOptions, initialBankAccount } from "@/constants";
import { bankAccountSchema } from "@/schemas/bank-account.schema";
import { bankSchema } from "@/schemas/bank.schema";
import { storeBankAccount, updateBankAccount } from "@/services/bankAccountServices";
import { storeBank } from "@/services/bankServices";
import { getBanks } from "../services/banksServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { BankAccount, BankProps } from "@/types";

// Opción del select para escribir un banco que aún no existe (se crea al guardar la cuenta)
const NEW_BANK = 'new';

type FormErrors = Partial<Record<keyof BankAccount | 'bank_name', string>>;

interface Props {
    account: BankAccount | null;
    onClose: () => void;
    onSaved: (account: BankAccount) => void;
}

export const BankAccountFormModal = ({ account, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [form, setForm] = useState<BankAccount>(account ?? initialBankAccount);
    const [banks, setBanks] = useState<BankProps[] | null>(null);
    const [bankChoice, setBankChoice] = useState<string>(account ? String(account.bank_id) : '');
    const [bankName, setBankName] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getBanks(axiosAuth, 'banks?paginate=100').then(({ data }) => {
            const list = data?.data ?? [];
            setBanks(list);
            // Sin bancos registrados se pasa directo a escribir el nombre
            if (list.length === 0) setBankChoice(NEW_BANK);
        });
    }, [axiosAuth]);

    const isNewBank = bankChoice === NEW_BANK;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectBank = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBankChoice(e.target.value);
        setErrors(prev => ({ ...prev, bank_id: '', bank_name: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Se validan ambos a la vez para mostrar todos los errores juntos
        const parsedBank = isNewBank ? bankSchema.safeParse({ name: bankName.trim() }) : null;
        const parsed = bankAccountSchema.safeParse({ ...form, bank_id: isNewBank ? 1 : bankChoice });
        const nextErrors: FormErrors = parsed.success ? {} : parseZodErrors(parsed.error);
        if (parsedBank && !parsedBank.success) nextErrors.bank_name = parseZodErrors(parsedBank.error).name;
        if (!parsed.success || (parsedBank && !parsedBank.success)) {
            setErrors(nextErrors);
            return;
        }

        setIsSaving(true);
        let bankId = Number(bankChoice);
        if (isNewBank) {
            const bankResponse = await storeBank(axiosAuth, { name: bankName.trim() });
            if (!bankResponse.data) {
                setIsSaving(false);
                setErrors({ bank_name: bankResponse.errors?.name ?? bankResponse.error ?? 'No se pudo crear el banco' });
                return;
            }
            bankId = bankResponse.data.id;
            // Si falla la cuenta, el banco ya queda en la lista para reintentar
            setBanks(prev => [...(prev ?? []), { id: bankId, atts: { name: bankResponse.data!.name } }]);
            setBankChoice(String(bankId));
        }

        const payload = { ...parsed.data, bank_id: bankId };
        const response = account
            ? await updateBankAccount(account.id, axiosAuth, payload)
            : await storeBankAccount(axiosAuth, payload);
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }
        if (response.data) onSaved(response.data);
    };

    const bankOptions = [
        ...(banks ?? []).map(bank => ({ value: String(bank.id), label: bank.atts.name })),
        { value: NEW_BANK, label: '+ Otro banco…' },
    ];

    return (
        <Modal isOpen title={account ? 'Editar cuenta' : 'Nueva cuenta bancaria'} onClose={onClose} modalSize="sm">
            <form onSubmit={handleSubmit} noValidate>
                {banks === null ? (
                    <p className="my-2 text-sm text-ink-3">Cargando bancos…</p>
                ) : (
                    <>
                        {banks.length > 0 && (
                            <SelectOption label="Banco" name="bank_id" select options={bankOptions} selectedValue={bankChoice} error={errors.bank_id} handleSelect={handleSelectBank} required />
                        )}
                        {isNewBank && (
                            <TextInput
                                type="text"
                                label={banks.length > 0 ? 'Nombre del banco' : 'Banco'}
                                name="bank_name"
                                value={bankName}
                                error={errors.bank_name}
                                onChange={(e) => { setBankName(e.target.value); setErrors(prev => ({ ...prev, bank_name: '' })); }}
                                placeholder="Ej. Banco Pichincha"
                                maxLength={150}
                                autoFocus
                                required
                            />
                        )}
                    </>
                )}

                <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-x-3">
                    <TextInput type="text" label="Número de cuenta" value={form.account_number} error={errors.account_number} onChange={handleChange} name="account_number" inputMode="numeric" maxLength={30} required />
                    <SelectOption label="Tipo" name="type" options={bankAccountTypeOptions} selectedValue={form.type} handleSelect={handleChange} required />
                </div>

                {!account && (
                    <TextInput
                        type="number"
                        label="Saldo actual"
                        value={form.opening_balance?.toString() ?? ''}
                        error={errors.opening_balance}
                        onChange={handleChange}
                        name="opening_balance"
                        inputMode="decimal"
                        hint="Lo que hoy marca tu estado de cuenta. Puedes dejarlo en blanco."
                    />
                )}

                <div className="mt-4 sm:flex sm:justify-end">
                    <div className="sm:w-32">
                        <PrimaryButton label="Guardar" type="submit" action="store" isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    );
};
