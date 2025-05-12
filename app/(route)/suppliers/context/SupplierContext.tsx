import { Links, Meta, SupplierProps } from "@/types";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { getSuppliers } from "../services/suppliersServices";
interface SupplierContextType {
    suppliers: SupplierProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchSuppliers: (pageUrl?: string) => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const SupplierProvider = ({ children }: Props) => {
    const [suppliers, setSuppliers] = useState<SupplierProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchSuppliers = useCallback(async (pageUrl = `providerlist?page=${page}`) => {
        if (status !== 'authenticated') return;
        try {
            const data = await getSuppliers(axiosAuth, pageUrl, search, page);
            if (data) {
                setSuppliers(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
        }
    }, [status, axiosAuth, search, page])

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers])
    return (
        <SupplierContext.Provider value={{
            suppliers, search, page, meta, links,
            setSearch, setPage, fetchSuppliers
        }}>
            {children}
        </SupplierContext.Provider>
    )
}

export const useSuppliers = () => {
    const context = useContext(SupplierContext);
    if (!context) throw new Error('useSuppliers must be used within a SupplierProvider');
    return context;
}
