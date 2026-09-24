"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getBanks } from "../services/banksServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { BankProps, Links, Meta } from "@/types";

interface BanksContextType {
    banks: BankProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    bankDeleteId: number | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchBanks: (pageUrl?: string) => Promise<void>;
    setBankDeleteId: (value: number | null) => void;
}

const BanksContext = createContext<BanksContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const BanksProvider = ({ children }: Props) => {
    const [banks, setBanks] = useState<BankProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [bankDeleteId, setBankDeleteId] = useState<number | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchBanks = useCallback(
        async (pageUrl = `banks?page=${page}`) => {
            if (status !== "authenticated") return;

            if (search) {
                pageUrl = `${pageUrl}&search=${search}`
            }

            const { data } = await getBanks(axiosAuth, pageUrl);
            if (data) {
                setBanks(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
        },
        [status, axiosAuth, search, page],
    );

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    return (
        <BanksContext.Provider
            value={{
                banks, search, page, meta, links, bankDeleteId,
                fetchBanks, setSearch, setPage, setBankDeleteId,
            }}
        >
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
