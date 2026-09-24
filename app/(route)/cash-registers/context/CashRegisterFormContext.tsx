"use client";

import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { getCashRegister } from "../services/cashRegistersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { initialCashRegister } from "@/constants";
import { CashRegister } from "@/types";

interface CashRegisterFormContextType {
    cashRegister: CashRegister;
    errors: Partial<Record<keyof CashRegister, string>>;
    setCashRegister: Dispatch<SetStateAction<CashRegister>>;
    setErrors: Dispatch<SetStateAction<Partial<Record<keyof CashRegister, string>>>>;
    refetchCashRegister: () => Promise<void>;
}

const CashRegisterFormContext = createContext<CashRegisterFormContextType | undefined>(undefined);

interface Props {
    id?: string;
    children: React.ReactNode;
}

export const CashRegisterFormProvider = ({ id, children }: Props) => {
    const [cashRegister, setCashRegister] = useState<CashRegister>(initialCashRegister);
    const [errors, setErrors] = useState<Partial<Record<keyof CashRegister, string>>>({});
    const axiosAuth = useAxiosAuth();

    const fetchCashRegister = useCallback(async () => {
        if (!id) return;

        const { data } = await getCashRegister(axiosAuth, id);
        if (data) {
            setCashRegister(data);
        }
    }, [id, axiosAuth]);

    useEffect(() => {
        fetchCashRegister();
    }, [fetchCashRegister]);

    return (
        <CashRegisterFormContext.Provider value={{ cashRegister, errors, setCashRegister, setErrors, refetchCashRegister: fetchCashRegister }}>
            {children}
        </CashRegisterFormContext.Provider>
    )
}

export const useCashRegisterFormContext = () => {
    const context = useContext(CashRegisterFormContext);
    if (context === undefined) {
        throw new Error("useCashRegisterFormContext must be used within a CashRegisterFormProvider")
    }
    return context;
}
