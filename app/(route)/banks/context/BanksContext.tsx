"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getBankAccounts } from "../services/bankAccountsServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { BankAccountProps, Links, Meta } from "@/types";

// Una pyme suele tener pocas cuentas: se traen de una vez para poder sumar el total
const ACCOUNTS_URL = 'bank-accounts?paginate=50';

interface BanksContextType {
    accounts: BankAccountProps[];
    meta: Meta | null;
    links: Links | null;
    isLoading: boolean;
    fetchAccounts: (pageUrl?: string) => Promise<void>;
}

const BanksContext = createContext<BanksContextType | undefined>(undefined);

export const BanksProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<BankAccountProps[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchAccounts = useCallback(
        async (pageUrl = ACCOUNTS_URL) => {
            if (status !== "authenticated") return;

            const { data } = await getBankAccounts(axiosAuth, pageUrl);
            if (data) {
                setAccounts(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
            setIsLoading(false);
        },
        [status, axiosAuth],
    );

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    return (
        <BanksContext.Provider value={{ accounts, meta, links, isLoading, fetchAccounts }}>
            {children}
        </BanksContext.Provider>
    );
};

export const useBanks = () => {
    const context = useContext(BanksContext);
    if (!context) {
        throw new Error("useBanks must be used within a BanksProvider");
    }
    return context;
};
