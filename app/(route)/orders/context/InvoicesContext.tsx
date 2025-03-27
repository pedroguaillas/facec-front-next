"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Meta } from "@/types";

interface InvoicesContextType {
    invoices: OrderProps[];
    search: string;
    setSearch: (value: string) => void;
    page: number;
    setPage: (value: number) => void;
    meta: Meta | null;
    fetchInvoices: (pageUrl?: string | null) => Promise<void>; // Exposed for manual fetches
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const InvoicesProvider = ({ children }: Props) => {
    const [invoices, setInvoices] = useState<OrderProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    // Memorized fetch function
    const fetchInvoices = useCallback(
        async (pageUrl?: string | null) => {
            // Default to current page if no URL is provided
            const url = pageUrl || `orderlist?page=${page}`;
            try {
                const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL).href;
                const res = await axiosAuth.post(fullUrl, { search });
                setInvoices(res.data.data);
                setMeta(res.data.meta);
            } catch (error) {
                console.error("Error al obtener facturas:", error);
            }
        },
        [axiosAuth, search, page] // Dependencies: axiosAuth, search, page
    );

    // Fetch invoices when status, search, or page changes
    useEffect(() => {
        if (status === "authenticated") {
            fetchInvoices(); // Use current page by default
        }
    }, [status, search, page, fetchInvoices]);

    const value: InvoicesContextType = {
        invoices,
        search,
        setSearch,
        page,
        setPage,
        meta,
        fetchInvoices, // Expose fetchInvoices for manual control
    };

    return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
};

export const useInvoices = () => {
    const context = useContext(InvoicesContext);
    if (!context) {
        throw new Error("useInvoices must be used within an InvoicesProvider");
    }
    return context;
};