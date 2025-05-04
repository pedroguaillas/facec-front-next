"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getProducts } from "../services/ordersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Links, Meta, ProductProps } from "@/types";

interface ProductsContextType {
    products: ProductProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchProducts: (pageUrl?: string) => Promise<void>; // Exposed for manual fetches
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const ProductsProvider = ({ children }: Props) => {
    const [products, setProducts] = useState<ProductProps[]>([]);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    const fetchProducts = useCallback(async (pageUrl = `productlist?page=${page}`) => {
        if (status !== "authenticated") return;
        console.log('useCallback, fetchProducts')

        try {
            const data = await getProducts(axiosAuth, pageUrl, search, page);
            setProducts(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        } catch (error) {
            console.error("Error al obtener productos:", error);
        }
    }, [status, axiosAuth, search, page]); // Dependencias correctas

    useEffect(() => {
        console.log('useEffect, start')
        fetchProducts();
    }, [fetchProducts]);

    return (
        <ProductsContext.Provider value={{
            products, search, page, meta, links,
            fetchProducts, setSearch, setPage
        }}>
            {children}
        </ProductsContext.Provider>
    );
}

export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error("useOrders must be used within an OrdersProvider");
    }
    return context;
}