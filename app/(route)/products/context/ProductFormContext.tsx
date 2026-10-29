"use client";

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { getCreateProduct, getEditProduct } from "../services/productServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { nanoid } from "nanoid";
import { Product, ProductCharacteristic, ProductTemplate, SriCategory, ProductEditResponse } from "@/types";
import { CodeErrors } from "@/constants/codeErrors";
import { redirect } from "next/navigation";
import { useInventory } from "@/lib/hooks/useInventory";
import { ProductPresentationForm } from "@/services/productPresentationServices";

// Presentación agregada al crear el producto: viaja en `presentations[]` del POST products
export interface DraftPresentation extends ProductPresentationForm {
    key: number;
}

// Errores 422 de `presentations.N.campo` (por key del borrador) y de `presentations` en general
export interface DraftPresentationErrors {
    rows: Record<number, Record<string, string>>;
    general?: string;
}

interface ProductCreateContextType {
    product: Product;
    errorProduct: Partial<Record<keyof Product, string>>;
    ivaTaxes: [];
    iceCataloges: [];
    sriCategories: SriCategory[];
    transport: boolean;
    base8: boolean;
    // Editando un producto existente (con inventario el stock ya no se cambia desde aquí)
    isEdit: boolean;
    setProduct: Dispatch<SetStateAction<Product>>;
    setErrorProduct: Dispatch<SetStateAction<Partial<Record<keyof Product, string>>>>;
    // Solo al crear: presentaciones aún sin producto (al editar se guardan directo en el backend)
    draftPresentations: DraftPresentation[];
    setDraftPresentations: Dispatch<SetStateAction<DraftPresentation[]>>;
    draftErrors: DraftPresentationErrors;
    setDraftErrors: Dispatch<SetStateAction<DraftPresentationErrors>>;
    // Plantillas de características (ej. Moto) que puede usar el producto
    productTemplates: ProductTemplate[];
    // Plantilla guardada en el backend: las unidades solo se manejan con ella (no con una recién elegida)
    savedTemplateId: number | null;
    // Características efectivas del producto guardado (en una unidad se muestran de solo lectura)
    characteristics: ProductCharacteristic[];
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
    price1: "",
    stock: 1,
};

export const ProductFormProvider = ({ id, children }: Props) => {
    const [product, setProduct] = useState<Product>(initialProduct);
    const [errorProduct, setErrorProduct] = useState<Partial<Record<keyof Product, string>>>({});
    const [ivaTaxes, setIvaTaxes] = useState<[]>([]);
    const [iceCataloges, setIceCataloges] = useState<[]>([]);
    const [sriCategories, setSriCategories] = useState<SriCategory[]>([]);
    const [transport, setTransport] = useState(false);
    const [base8, setBase8] = useState(false);
    const [draftPresentations, setDraftPresentations] = useState<DraftPresentation[]>([]);
    const [draftErrors, setDraftErrors] = useState<DraftPresentationErrors>({ rows: {} });
    const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([]);
    const [savedTemplateId, setSavedTemplateId] = useState<number | null>(null);
    const [characteristics, setCharacteristics] = useState<ProductCharacteristic[]>([]);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth(); // ✅ Llamar el hook aquí, dentro del componente
    const { enabled: inventory } = useInventory();

    // Con inventario el stock al crear es el saldo inicial del kardex: no se precarga 1
    useEffect(() => {
        if (inventory && id === undefined) {
            setProduct(prev => (prev.stock === initialProduct.stock ? { ...prev, stock: '' } : prev));
        }
    }, [inventory, id]);

    useEffect(() => {
        const fetchFormProduct = async () => {
            if (status !== "authenticated") return;

            const { data, error } =
                id !== undefined ? await getEditProduct(id, axiosAuth) : await getCreateProduct(axiosAuth);

            if (data) {
                setIvaTaxes(data.ivaTaxes);
                setIceCataloges(data.iceCataloges);
                setSriCategories(data.sriCategories);
                setTransport(data.transport);
                setBase8(!!data.base8);
                setProductTemplates(data.productTemplates ?? []);
                if ("product" in data) {
                    const editData = data as ProductEditResponse;
                    const templateId = editData.product.product_template_id ?? null;
                    // requiere convertir el ID en string
                    setProduct({ ...editData.product, id: `${editData.product.id}`, product_template_id: templateId, details: editData.details ?? {} });
                    setSavedTemplateId(templateId);
                    setCharacteristics(editData.characteristics ?? []);
                }
            } else if (error === CodeErrors.NETWORK_ERROR) {
                redirect(`/error?message=${encodeURIComponent(CodeErrors.NETWORK_ERROR_MESSAGE)}`);
            }
        };

        fetchFormProduct();
    }, [status, axiosAuth, id]);

    return (
        <ProductCreateContext.Provider
            value={{
                product,
                errorProduct,
                ivaTaxes,
                iceCataloges,
                sriCategories,
                transport,
                base8,
                isEdit: id !== undefined,
                setProduct,
                setErrorProduct,
                draftPresentations,
                setDraftPresentations,
                draftErrors,
                setDraftErrors,
                productTemplates,
                savedTemplateId,
                characteristics,
            }}
        >
            {children}
        </ProductCreateContext.Provider>
    );
};

export const useProductCreateContext = () => {
    const context = useContext(ProductCreateContext);
    if (context === undefined) {
        throw new Error("useProductCreateContext must be used within a ProductFormProvider");
    }
    return context;
};
