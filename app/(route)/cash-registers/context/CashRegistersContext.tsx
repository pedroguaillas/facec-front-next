"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getCashRegisters } from "../services/cashRegistersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { CashRegisterProps, Links, Meta } from "@/types";

interface CashRegistersContextType {
    cashRegisters: CashRegisterProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchCashRegisters: (pageUrl?: string) => Promise<void>;
}

const CashRegistersContext = createContext<CashRegistersContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const CashRegistersProvider = ({ children }: Props) => {
    const [cashRegisters, setCashRegisters] = useState<CashRegisterProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchCashRegisters = useCallback(
        async (pageUrl = `cash-registers?page=${page}`) => {
            if (status !== "authenticated") return;

            if (search) {
                pageUrl = `${pageUrl}&search=${search}`
            }

            const { data } = await getCashRegisters(axiosAuth, pageUrl);
            if (data) {
                setCashRegisters(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
        },
        [status, axiosAuth, search, page],
    );

    useEffect(() => {
        fetchCashRegisters();
    }, [fetchCashRegisters]);

    return (
        <CashRegistersContext.Provider
            value={{ cashRegisters, search, page, meta, links, fetchCashRegisters, setSearch, setPage }}
        >
            {children}
        </CashRegistersContext.Provider>
    );
};

export const useCashRegisters = () => {
    const context = useContext(CashRegistersContext);
    if (!context) {
        throw new Error("useCashRegisters must be used within a CashRegistersProvider");
    }
    return context;
};
