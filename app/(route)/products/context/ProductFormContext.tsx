"use client";

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { getCreateProduct, getProduct } from "../services/ordersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { nanoid } from "nanoid";

interface ProductCreateContextType {
    product: Product;
    errorProduct: Record<keyof Product, string>;
    ivaTaxes: [];
    iceCataloges: [];
    setProduct: Dispatch<SetStateAction<Product>>;
    setErrorProduct: Dispatch<SetStateAction<Record<keyof Product, string>>>;
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
    const [errorProduct, setErrorProduct] = useState<Record<keyof Product, string>>({} as Record<keyof Product, string>);
    const [ivaTaxes, setIvaTaxes] = useState<[]>([]);
    const [iceCataloges, setIceCataloges] = useState<[]>([]);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente

    useEffect(() => {
        const fetchCreateProduct = async () => {
            if (status !== "authenticated") return;

            try {
                let data;

                if (id !== undefined) {
                    data = await getProduct(id, axiosAuth);
                    setProduct({ ...data.product, id: id + '' });
                } else {
                    data = await getCreateProduct(axiosAuth);
                }
                setIvaTaxes(data.ivaTaxes.map((item: { code: string, percentage: string }) => ({
                    value: item.code,
                    label: `IVA ${item.percentage}%`,
                })));
                setIceCataloges(data.iceCataloges.map((item: { code: string, description: string }) => ({
                    value: item.code,
                    label: item.description,
                })));
            } catch (error) {
                console.error("Error al cargar datos: ", error);
            }
        };

        fetchCreateProduct();
    }, [status, axiosAuth, id]);

    return (
        <ProductCreateContext.Provider value={{
            product, errorProduct, ivaTaxes, iceCataloges,
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

