"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { EmisionPoint, ProductOutput, ShopCreateProps, SupplierProps, Tax, TaxInput } from "@/types";
import { getCreateShop, getShop } from "../services/shopsServices";
import { initialTax } from "@/constants/initialValues";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getDate } from "@/helpers/dateHelper";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";

interface ShopContextType {
    shop: ShopCreateProps;
    selectProvider: SupplierProps | null;
    errorShop: Partial<Record<keyof ShopCreateProps, string>>;
    points: EmisionPoint[];
    selectPoint: EmisionPoint | null;
    applieWithholding: boolean;
    taxInputs: TaxInput[];
    taxes: Tax[];
    errorTaxes: Record<string, Partial<Record<keyof Tax, string>>>;
    productOutputs: ProductOutput[];
    setShop: Dispatch<SetStateAction<ShopCreateProps>>;
    setSelectProvider: Dispatch<SetStateAction<SupplierProps | null>>;
    setSelectPoint: Dispatch<SetStateAction<EmisionPoint | null>>;
    setErrorShop: Dispatch<SetStateAction<Partial<Record<keyof ShopCreateProps, string>>>>;
    setTaxes: Dispatch<SetStateAction<Tax[]>>;
    setErrorTaxes: Dispatch<SetStateAction<Record<string, Partial<Record<keyof Tax, string>>>>>;
    setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
    setApplieWithholding: Dispatch<SetStateAction<boolean>>;
}

const FormShopContext = createContext<ShopContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

const initialShop: ShopCreateProps = {
    serie: '001-010-000000001',
    date: getDate(),
    authorization: '',
    expiration_days: 0,
    voucher_type: 1,
    no_iva: 0,
    base0: 0,
    base5: 0,
    base12: 0,
    base15: 0,
    iva: 0,
    iva5: 0,
    iva15: 0,
    sub_total: 0,
    discount: 0,
    ice: 0,
    total: 0,
    description: null,
    provider_id: 0,

    // Retencion
    serie_retencion: 'Cree un punto de emisión',
    date_retention: getDate(),
}

export const FormShopProvider = ({ children }: Props) => {
    const [shop, setShop] = useState<ShopCreateProps>(initialShop);
    const [selectProvider, setSelectProvider] = useState<SupplierProps | null>(null);
    const [points, setPoints] = useState<EmisionPoint[]>([]);
    const [selectPoint, setSelectPoint] = useState<EmisionPoint | null>(null);
    const [errorShop, setErrorShop] = useState<Partial<Record<keyof ShopCreateProps, string>>>({});
    const [applieWithholding, setApplieWithholding] = useState<boolean>(false);
    const [taxInputs, setTaxInputs] = useState<TaxInput[]>([]);
    const [errorTaxes, setErrorTaxes] = useState<Record<string, Partial<Record<keyof Tax, string>>>>({});
    const [productOutputs, setProductOutputs] = useState<ProductOutput[]>([]);
    const [taxes, setTaxes] = useState<Tax[]>([{ ...initialTax, id: nanoid() }]);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();
    const params = useParams();

    useEffect(() => {
        const fetchCreateShop = async () => {
            if (status !== "authenticated") return;

            try {
                if (typeof params?.id === 'string') {
                    const data = await getShop(axiosAuth, params?.id as string);
                    setShop(data.shop);
                    setSelectProvider(data.providers[0]);
                    setApplieWithholding(data.shopretentionitems.length > 0);
                    setTaxInputs(data.taxes);
                    setTaxes(data.shopretentionitems.map((item: Tax) => ({ ...item, id: nanoid() })));
                    setProductOutputs(data.shopitems.map((item: ProductOutput) => ({ ...item, id: item.id + '', total_iva: (Number(item.price) * Number(item.quantity)).toFixed(2) })));
                } else {
                    const data = await getCreateShop(axiosAuth);
                    setPoints(data.points);
                    setTaxInputs(data.taxes);
                }
            } catch (error) {
                console.log("Error al cargar: ", error);
            }
        }
        fetchCreateShop();
    }, [status, axiosAuth, params?.id]);

    return (
        <FormShopContext.Provider value={{
            shop, errorShop, selectProvider, points, selectPoint, applieWithholding, taxInputs, taxes, errorTaxes, productOutputs,
            setShop, setErrorShop, setSelectProvider, setSelectPoint, setApplieWithholding, setTaxes, setErrorTaxes, setProductOutputs,
        }}>
            {children}
        </FormShopContext.Provider>
    );
};

export const useFormShop = () => {
    const context = useContext(FormShopContext);
    if (!context) {
        throw new Error("Shop must be used within an ShopCreateProvider");
    }
    return context;
}