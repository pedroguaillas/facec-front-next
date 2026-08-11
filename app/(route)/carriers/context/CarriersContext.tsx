"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Links, Meta, CarrierProps } from "@/types";
import { getCarriers } from "@/services/carrierServices";

interface CarriersContextType {
    carriers: CarrierProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    carrierDeleteId: number | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchCarriers: (pageUrl?: string) => Promise<void>; // Exposed for manual fetches
    setCarrierDeleteId: (value: number | null) => void;
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
    const [carrierDeleteId, setCarrierDeleteId] = useState<number | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    const fetchCarriers = useCallback(async (pageUrl = `carriers?page=${page}`) => {
        if (status !== "authenticated") return;

        if (search) {
            pageUrl = `${pageUrl}&search=${search}`;
        }

        const { data } = await getCarriers(axiosAuth, pageUrl);
        if (data) {
            setCarriers(data?.data ?? []);
            setMeta(data?.meta ?? null);
            setLinks(data?.links ?? null);
        }

    }, [status, axiosAuth, search, page]);

    useEffect(() => {
        fetchCarriers();
    }, [fetchCarriers]);

    return (
        <CarriersContext.Provider value={{
            carriers, search, page, meta, links, carrierDeleteId,
            fetchCarriers, setSearch, setPage, setCarrierDeleteId
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