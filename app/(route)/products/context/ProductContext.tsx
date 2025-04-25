"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProducts } from "../services/ordersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Links, Meta } from "@/types";
import { ReactNode } from "react";

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

    const fetchProducts = async (pageUrl = `productlist?page=${page}`) => {
        if (status !== "authenticated") return;

        try {
            const data = await getProducts(axiosAuth, pageUrl, search, page);
            setProducts(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        } catch (error) {
            console.error("Error al obtener facturas:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [status, search, page]);

    return (
        <ProductsContext.Provider value={{
            products, search, page, meta, links,
            setSearch, setPage, fetchProducts
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