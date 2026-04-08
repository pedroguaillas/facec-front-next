"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getProducts } from "../services/productServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Links, Meta, ProductProps } from "@/types";

interface ProductsContextType {
    products: ProductProps[];
    search: string;
    page: number;
    meta: Meta | null;
    links: Links | null;
    productDeleteId: number | null;
    setSearch: (value: string) => void;
    setPage: (value: number) => void;
    fetchProducts: (pageUrl?: string) => Promise<void>; // Exposed for manual fetches
    setProductDeleteId: (value: number | null) => void;
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
    const [productDeleteId, setProductDeleteId] = useState<number | null>(null);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    const fetchProducts = useCallback(
        async (pageUrl = `products?page=${page}`) => {
            if (status !== "authenticated") return;

            if (search) {
                pageUrl = `${pageUrl}&search=${search}`;
            }

            const { data } = await getProducts(axiosAuth, pageUrl);
            if (data) {
                setProducts(data.data);
                setMeta(data.meta);
                setLinks(data.links);
            }
        },
        [status, axiosAuth, search, page],
    ); // Dependencias correctas

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <ProductsContext.Provider
            value={{
                // Resources
                products,
                search,
                page,
                meta,
                links,
                productDeleteId,
                // actions
                fetchProducts,
                setSearch,
                setPage,
                setProductDeleteId,
            }}
        >
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error("useOrders must be used within an OrdersProvider");
    }
    return context;
};
