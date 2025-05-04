"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getCarriers } from "../services/carriersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Links, Meta, CarrierProps } from "@/types";

interface CarriersContextType {
    carriers: CarrierProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchCarriers: (pageUrl?: string) => Promise<void>; // Exposed for manual fetches
}

const CarriersContext = createContext<CarriersContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const CarriersProvider = ({ children }: Props) => {
    const [carriers, setCarriers] = useState<CarrierProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    const fetchCarriers = useCallback(async (pageUrl = `carrierlist?page=${page}`) => {
        if (status !== "authenticated") return;
        console.log('useCallback, fetchCarriers')

        try {
            const data = await getCarriers(axiosAuth, pageUrl, search, page);
            setCarriers(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        } catch (error) {
            console.error("Error al obtener productos:", error);
        }
    }, [status, axiosAuth, search, page]); // Dependencias correctas

    useEffect(() => {
        console.log('useEffect, start')
        fetchCarriers();
    }, [fetchCarriers]);

    return (
        <CarriersContext.Provider value={{
            carriers, search, page, meta, links,
            fetchCarriers, setSearch, setPage
        }}>
            {children}
        </CarriersContext.Provider>
    );
}

export const useCarriers = () => {
    const context = useContext(CarriersContext);
    if (!context) {
        throw new Error("useOrders must be used within an OrdersProvider");
    }
    return context;
}