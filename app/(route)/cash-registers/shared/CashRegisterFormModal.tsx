"use client";

import { useEffect, useState } from "react";
import { Modal, PrimaryButton, SelectOption, SelectUser, TextInput } from "@/components";
import { cashRegisterTypeOptions, initialCashRegister } from "@/constants";
import { cashRegisterSchema } from "@/schemas/cash-register.schema";
import { storeCashRegister, updateCashRegister } from "@/services/cashRegisterServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { CashRegister, CashRegisterType } from "@/types";

type CashRegisterFormValues = Pick<CashRegister, 'id' | 'name' | 'type' | 'responsible_id'>;

interface Props {
    cashRegister: CashRegisterFormValues | null;
    existingTypes: CashRegisterType[];
    onClose: () => void;
    onSaved: () => void;
}

export const CashRegisterFormModal = ({ cashRegister, existingTypes, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [form, setForm] = useState<CashRegisterFormValues>(initialCashRegister);
    const [errors, setErrors] = useState<Partial<Record<keyof CashRegisterFormValues, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    const hasGeneral = existingTypes.includes('GENERAL');
    const hasChica = existingTypes.includes('CHICA');
    const onlyOtroAllowed = !cashRegister && hasGeneral && hasChica;
    const typeLabel = cashRegisterTypeOptions.find(opt => opt.value === form.type)?.label ?? form.type;
    const typeOptions = cashRegisterTypeOptions.filter(opt =>
        !((opt.value === 'GENERAL' && hasGeneral) || (opt.value === 'CHICA' && hasChica))
    );

    useEffect(() => {
        if (cashRegister) {
            setForm(cashRegister);
        } else {
            setForm({ ...initialCashRegister, type: onlyOtroAllowed ? 'OTRO' : initialCashRegister.type });
        }
        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cashRegister]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = cashRegisterSchema.safeParse(form);
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsSaving(true);
        const response = cashRegister
            ? await updateCashRegister(cashRegister.id + '', axiosAuth, parsed.data)
            : await storeCashRegister(axiosAuth, parsed.data);
        setIsSaving(false);

        if (response.errors) {
            setErrors(response.errors);
            return;
        }

        onSaved();
    };

    return (
        <Modal isOpen title={cashRegister ? 'Editar caja' : 'Nueva caja'} onClose={onClose} modalSize="sm">
            <form onSubmit={handleSubmit}>
                <TextInput type='text' label='Nombre' value={form.name} error={errors.name} onChange={handleChange} name='name' maxLength={150} required />
                {cashRegister ? (
                    <p className="text-sm opacity-70 my-2">Tipo: <strong>{typeLabel}</strong></p>
                ) : onlyOtroAllowed ? (
                    <p className="text-sm opacity-70 my-2">Tipo: <strong>Otro</strong> (ya existen cajas General y Chica)</p>
                ) : (
                    <SelectOption label="Tipo" name='type' options={typeOptions} selectedValue={form.type} handleSelect={handleChange} required />
                )}
                <SelectUser name='responsible_id' selectedValue={form.responsible_id} error={errors.responsible_id} handleSelect={handleChange} />

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Guardar' type='submit' action='store' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
