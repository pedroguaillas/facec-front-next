"use client";

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";
import { getShops } from "../services/shopsServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth"; // ✅ Importar el hook
import { useSession } from "next-auth/react";
import { Links, Meta, ShopProps } from "@/types";

interface ShopsContextType {
    shops: ShopProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchShops: (pageUrl?: string) => Promise<void>; // Exposed for manual fetches
}

const ShopsContext = createContext<ShopsContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const ShopsProvider = ({ children }: Props) => {
    const [shops, setShops] = useState<ShopProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    const fetchShops = useCallback(async (pageUrl = `shoplist?page=${page}`) => {
        if (status !== "authenticated") return;

        try {
            const data = await getShops(axiosAuth, pageUrl, search, page);
            setShops(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        } catch (error) {
            console.error("Error al obtener facturas:", error);
        }
    }, [status, axiosAuth, search, page]);

    useEffect(() => {
        fetchShops();
    }, [fetchShops]);

    return (
        <ShopsContext.Provider value={{
            shops, search, page, meta, links,
            fetchShops, setPage, setSearch,

        }}>
            {children}
        </ShopsContext.Provider>
    );
};

export const useShops = () => {
    const context = useContext(ShopsContext);
    if (!context) {
        throw new Error("useShops must be used within an ShopsProvider");
    }
    return context;
};