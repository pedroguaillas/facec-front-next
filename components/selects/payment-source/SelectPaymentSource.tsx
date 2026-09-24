"use client";

import { useEffect, useState } from "react";
import { SelectOption } from "@/components";
import { getAllBankAccounts } from "@/services/bankAccountServices";
import { getAllCashRegisters } from "@/services/cashRegisterServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { BankAccountProps, CashRegisterProps, MovementSourceType } from "@/types";

interface Props {
    sourceType: MovementSourceType | '';
    sourceId: number | '';
    error?: string;
    onChange: (sourceType: MovementSourceType, sourceId: number) => void;
}

export const SelectPaymentSource = ({ sourceType, sourceId, error, onChange }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [bankAccounts, setBankAccounts] = useState<BankAccountProps[]>([]);
    const [cashRegisters, setCashRegisters] = useState<CashRegisterProps[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            const [banks, registers] = await Promise.all([
                getAllBankAccounts(axiosAuth),
                getAllCashRegisters(axiosAuth),
            ]);
            if (banks.data) setBankAccounts(banks.data.data);
            if (registers.data) setCashRegisters(registers.data.data);
        };
        fetchOptions();
    }, [axiosAuth]);

    const options = [
        ...bankAccounts.map(account => ({
            value: `bank_account:${account.id}`,
            label: `Banco - ${account.bank.name} ${account.atts.account_number}`,
        })),
        ...cashRegisters
            .filter(cashRegister => cashRegister.active_session)
            .map(cashRegister => ({
                value: `cash_register_session:${cashRegister.active_session!.id}`,
                label: `Caja - ${cashRegister.atts.name}`,
            })),
    ];

    const selectedValue = sourceType && sourceId ? `${sourceType}:${sourceId}` : '';

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [type, id] = e.target.value.split(':');
        onChange(type as MovementSourceType, Number(id));
    };

    return (
        <SelectOption
            label="Cuenta bancaria o caja"
            name="source_id"
            options={options}
            selectedValue={selectedValue}
            error={error}
            handleSelect={handleSelect}
            select
            required
        />
    )
}
