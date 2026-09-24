"use client";

import { useEffect, useState } from "react";
import { SelectOption } from "@/components";
import { getAllBankAccounts } from "@/services/bankAccountServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { BankAccountProps } from "@/types";

interface Props {
    label?: string;
    name: string;
    selectedValue: number | string;
    error?: string;
    excludeId?: number;
    handleSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectBankAccount = ({ label = 'Cuenta bancaria', name, selectedValue, error, excludeId, handleSelect }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [accounts, setAccounts] = useState<BankAccountProps[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data } = await getAllBankAccounts(axiosAuth);
            if (data) {
                setAccounts(data.data);
            }
        }
        fetchAccounts();
    }, [axiosAuth]);

    const options = accounts
        .filter(account => account.id !== excludeId)
        .map(account => ({
            value: account.id,
            label: `${account.bank.name} - ${account.atts.account_number}`,
        }));

    return (
        <SelectOption
            label={label}
            name={name}
            options={options}
            selectedValue={selectedValue}
            error={error}
            handleSelect={handleSelect}
            select
            required
        />
    )
}
