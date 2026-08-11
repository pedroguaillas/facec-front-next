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
    supplierDeleteId: number | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchSuppliers: (pageUrl?: string) => Promise<void>;
    setSupplierDeleteId: (value: number | null) => void;
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
    const [supplierDeleteId, setSupplierDeleteId] = useState<number | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchSuppliers = useCallback(async (pageUrl = `providers?page=${page}`) => {
        if (status !== 'authenticated') return;
        if (search) {
            pageUrl = `${pageUrl}&search=${search}`;
        }
        const { data } = await getSuppliers(axiosAuth, pageUrl);
        if (data) {
            setSuppliers(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        }
    }, [status, axiosAuth, search, page])

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers])
    return (
        <SupplierContext.Provider value={{
            suppliers, search, page, meta, links, supplierDeleteId,
            setSearch, setPage, fetchSuppliers, setSupplierDeleteId
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
