"use client";

import { useEffect, useState } from "react";
import { Modal, PrimaryButton, SelectOption, SelectUser, Switch, TextInput } from "@/components";
import { cashRegisterTypeOptions, initialCashRegister } from "@/constants";
import { cashRegisterSchema } from "@/schemas/cash-register.schema";
import { storeCashRegister, updateCashRegister } from "@/services/cashRegisterServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { CashRegister, CashRegisterType } from "@/types";

type CashRegisterFormValues = Pick<CashRegister, 'id' | 'name' | 'type' | 'responsible_id' | 'uses_sessions'>;

interface Props {
    cashRegister: CashRegisterFormValues | null;
    existingTypes: CashRegisterType[];
    onClose: () => void;
    onSaved: () => void;
}

export const CashRegisterFormModal = ({ cashRegister, existingTypes, onClose, onSaved }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [form, setForm] = useState<CashRegisterFormValues>(initialCashRegister);
    const [errors, setErrors] = useState<Partial<Record<keyof CashRegisterFormValues | 'initial_balance', string>>>({});
    const [initialBalance, setInitialBalance] = useState('');
    const [message, setMessage] = useState<string>();
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

        setMessage(undefined);
        // El monto inicial solo aplica al crear una caja siempre abierta (el backend da 422 si usa sesiones)
        const withBalance = !cashRegister && !form.uses_sessions;
        const parsed = cashRegisterSchema.safeParse({ ...form, initial_balance: withBalance ? initialBalance : undefined });
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
        if (response.error) {
            setMessage(response.error);
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
                <div className="mt-3 border-t border-line pt-3">
                    <Switch
                        name="uses_sessions"
                        label="Apertura y cierre de caja"
                        checked={!!form.uses_sessions}
                        onChange={(e) => { setForm(prev => ({ ...prev, uses_sessions: e.target.checked })); setErrors(prev => ({ ...prev, initial_balance: '' })); }}
                        description={form.uses_sessions
                            ? 'Abres la caja con un monto, al cerrar cuentas el efectivo y ves si cuadra (arqueo).'
                            : 'La caja queda siempre abierta y solo registra lo que entra y sale. Actívalo si quieres cuadrar la caja cada día.'}
                    />
                </div>
                {!cashRegister && !form.uses_sessions && (
                    <TextInput
                        type="number"
                        label="Efectivo con el que arranca"
                        name="initial_balance"
                        value={initialBalance}
                        error={errors.initial_balance}
                        onChange={(e) => { setInitialBalance(e.target.value); setErrors(prev => ({ ...prev, initial_balance: '' })); }}
                        inputMode="decimal"
                        placeholder="0.00"
                        hint={form.type === 'GENERAL'
                            ? 'Lo que hoy tienes en efectivo. Puedes dejarlo en blanco.'
                            : 'Se toma de la caja general (debe estar abierta y tener saldo). Puedes dejarlo en blanco.'}
                    />
                )}
                {message && <p className="mt-2 text-sm text-red-500" role="alert">{message}</p>}

                <div className='flex justify-end mt-4'>
                    <div className='w-28'>
                        <PrimaryButton label='Guardar' type='submit' action='store' isLoading={isSaving} />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
