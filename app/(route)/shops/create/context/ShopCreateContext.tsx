"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { EmisionPoint, ShopCreateProps, SupplierProps, Tax, TaxInput } from "@/types";
import { getCreateShop } from "../services/getCreateShop";
import { initialTax } from "@/constants/initialValues";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getDate } from "@/helpers/dateHelper";
import { useSession } from "next-auth/react";

interface ShopContextType {
    shop: ShopCreateProps;
    selectProvider: SupplierProps | null;
    errorShop: Partial<Record<keyof ShopCreateProps, string>>;
    points: EmisionPoint[];
    taxInputs: TaxInput[];
    taxes: Tax[];
    errorTaxes: Record<string, Partial<Record<keyof Tax, string>>>;
    setShop: Dispatch<SetStateAction<ShopCreateProps>>;
    setSelectProvider: Dispatch<SetStateAction<SupplierProps | null>>;
    setErrorShop: Dispatch<SetStateAction<Partial<Record<keyof ShopCreateProps, string>>>>;
    setTaxes: Dispatch<SetStateAction<Tax[]>>;
    setErrorTaxes: Dispatch<SetStateAction<Record<string, Partial<Record<keyof Tax, string>>>>>;
}

const ShopCreateContext = createContext<ShopContextType | undefined>(undefined);

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

const createNewTaxItem = (): Tax => ({
    ...initialTax,
});

export const ShopCreateProvider = ({ children }: Props) => {
    const [shop, setShop] = useState<ShopCreateProps>(initialShop);
    const [selectProvider, setSelectProvider] = useState<SupplierProps | null>(null);
    const [points, setPoints] = useState<EmisionPoint[]>([]);
    const [errorShop, setErrorShop] = useState<Partial<Record<keyof ShopCreateProps, string>>>({});
    const [taxInputs, setTaxInputs] = useState<TaxInput[]>([]);
    const [errorTaxes, setErrorTaxes] = useState<Record<string, Partial<Record<keyof Tax, string>>>>({});
    const [taxes, setTaxes] = useState<Tax[]>([createNewTaxItem()]);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();

    const fetchCreateShop = async () => {
        if (status !== "authenticated") return;

        try {
            const data = await getCreateShop(axiosAuth);
            setPoints(data.points);
            setTaxInputs(data.taxes);
        } catch (error) {
            console.log("Error al cargar: ", error);
        }
    }

    useEffect(() => {
        fetchCreateShop();
    }, [status]);

    return (
        <ShopCreateContext.Provider value={{
            shop, errorShop, selectProvider, points, taxInputs, taxes, errorTaxes,
            setShop, setErrorShop, setSelectProvider, setTaxes, setErrorTaxes,
        }}>
            {children}
        </ShopCreateContext.Provider>
    );
};

export const useCreateShop = () => {
    const context = useContext(ShopCreateContext);
    if (!context) {
        throw new Error("Shop must be used within an ShopCreateProvider");
    }
    return context;
}