"use client";

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { getCreateProduct, getEditProduct } from "../services/productServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { nanoid } from "nanoid";
import { Product, SriCategory } from "@/types";
import { CodeErrors } from "@/constants/codeErrors";
import { redirect } from 'next/navigation';

interface ProductCreateContextType {
    product: Product;
    errorProduct: Partial<Record<keyof Product, string>>;
    ivaTaxes: [];
    iceCataloges: [];
    sriCategories: SriCategory[];
    transport: boolean;
    setProduct: Dispatch<SetStateAction<Product>>;
    setErrorProduct: Dispatch<SetStateAction<Partial<Record<keyof Product, string>>>>;
}

const ProductCreateContext = createContext<ProductCreateContextType | undefined>(undefined);

interface Props {
    id?: string;
    children: React.ReactNode;
}

const initialProduct: Product = {
    id: nanoid(),
    code: "",
    type_product: 1,
    name: "",
    iva: 4,
    price1: '',
    stock: 1,
};

export const ProductFormProvider = ({ id, children }: Props) => {

    const [product, setProduct] = useState<Product>(initialProduct);
    const [errorProduct, setErrorProduct] = useState<Partial<Record<keyof Product, string>>>({});
    const [ivaTaxes, setIvaTaxes] = useState<[]>([]);
    const [iceCataloges, setIceCataloges] = useState<[]>([]);
    const [sriCategories, setSriCategories] = useState<SriCategory[]>([]);
    const [transport, setTransport] = useState(false);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    useEffect(() => {
        const fetchFormProduct = async () => {
            if (status !== "authenticated") return;

            let response;

            if (id !== undefined) {
                response = await getEditProduct(id, axiosAuth);
                if (response.data) {
                    setProduct({ ...response.data.product, id: id + '' });
                }
            } else {
                response = await getCreateProduct(axiosAuth);
            }

            const { data, message } = response;

            if (data) {
                setIvaTaxes(data.ivaTaxes);
                setIceCataloges(data.iceCataloges);
                setSriCategories(data.sriCategories);
                setTransport(data.transport);
            } else if (message === CodeErrors.NETWORK_ERROR) {
                redirect(`/error?message=${encodeURIComponent(CodeErrors.NETWORK_ERROR_MESSAGE)}`);
            }
        };

        fetchFormProduct();
    }, [status, axiosAuth, id]);

    return (
        <ProductCreateContext.Provider value={{
            product, errorProduct, ivaTaxes, iceCataloges, sriCategories, transport,
            setProduct, setErrorProduct
        }}>
            {children}
        </ProductCreateContext.Provider>
    );
}

export const useProductCreateContext = () => {
    const context = useContext(ProductCreateContext);
    if (context === undefined) {
        throw new Error("useProductCreateContext must be used within a ProductFormProvider");
    }
    return context;
}