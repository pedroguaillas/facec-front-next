"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getCustomers } from "../services/customersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { CustomerProps, Links, Meta } from "@/types";

interface CustomersContextType {
    customers: CustomerProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchCustomers: (pageUrl?: string) => Promise<void>;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const CustomersProvider = ({ children }: Props) => {
    const [customers, setCustomers] = useState<CustomerProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    // Ejecuta al inicio y cuando cambie el search, page
    const fetchCustomers = useCallback(async (pageUrl = `customerlist?page=${page}`) => {
        if (status !== "authenticated") return;
        console.log('useCallback, fetchCustomers')

        try {
            const data = await getCustomers(axiosAuth, pageUrl, search, page);
            setCustomers(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        }
    }, [status, axiosAuth, search, page]);

    useEffect(() => {
        // Validado: se ejecuta solo al inicio
        fetchCustomers();
        console.log('useEffect, fetchCustomers')
    }, [fetchCustomers]);

    return (
        <CustomersContext.Provider value={{
            customers, search, page, meta, links,
            fetchCustomers, setSearch, setPage
        }}>
            {children}
        </CustomersContext.Provider>
    );
}

export const useCustomers = () => {
    const context = useContext(CustomersContext);
    if (!context) {
        throw new Error("useCustomers must be used within a CustomersProvider");
    }
    return context;
}