"use client";

import { useEffect, useState } from "react";
import { SelectOption } from "@/components";
import { getAllBankAccounts } from "@/services/bankAccountServices";
import { getAllCashRegisters } from "@/services/cashRegisterServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { BankAccountProps, CashRegisterProps, RecurringSourceType } from "@/types";

interface Props {
    sourceType: RecurringSourceType | '';
    sourceId: number | '';
    error?: string;
    onChange: (sourceType: RecurringSourceType, sourceId: number) => void;
}

// A diferencia de la venta, la plantilla guarda la CAJA (no la sesión): al emitir se usa la sesión abierta de ese día
export const RecurringSourceSelect = ({ sourceType, sourceId, error, onChange }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [bankAccounts, setBankAccounts] = useState<BankAccountProps[]>([]);
    const [cashRegisters, setCashRegisters] = useState<CashRegisterProps[]>([]);

    useEffect(() => {
        Promise.all([getAllBankAccounts(axiosAuth), getAllCashRegisters(axiosAuth)]).then(([banks, registers]) => {
            if (banks.data) setBankAccounts(banks.data.data);
            if (registers.data) setCashRegisters(registers.data.data);
        });
    }, [axiosAuth]);

    const options = [
        ...bankAccounts.map(account => ({
            value: `bank_account:${account.id}`,
            label: `Banco - ${account.bank.name} ${account.atts.account_number}`,
        })),
        ...cashRegisters.map(cashRegister => ({
            value: `cash_register:${cashRegister.id}`,
            label: `Caja - ${cashRegister.atts.name}`,
        })),
    ];

    const selected = cashRegisters.find(it => sourceType === 'cash_register' && it.id === sourceId);
    // Con apertura y cierre, si ese día la caja está cerrada la emisión falla
    const usesSessions = !!selected?.atts.uses_sessions;

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [type, id] = e.target.value.split(':');
        onChange(type as RecurringSourceType, Number(id));
    };

    return (
        <div className="min-w-0">
            <SelectOption
                label="Cuenta bancaria o caja"
                name="source_id"
                options={options}
                selectedValue={sourceType && sourceId ? `${sourceType}:${sourceId}` : ''}
                error={error}
                handleSelect={handleSelect}
                select
                required
            />
            {usesSessions && !error && (
                <p className="-mt-1 mb-2 text-xs text-sri-wait">Esta caja se abre y cierra: si está cerrada el día de emisión, esa factura queda con error.</p>
            )}
        </div>
    );
};
