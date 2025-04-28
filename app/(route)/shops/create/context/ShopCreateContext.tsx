"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { EmisionPoint, ShopCreateProps, Tax, TaxInput } from "@/types";
import { useSession } from "next-auth/react";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { getCreateShop } from "../services/getCreateShop";
import { getDate } from "@/helpers/dateHelper";
import { initialTax } from "@/constants/initialValues";

interface ShopContextType {
    shop: ShopCreateProps;
    points: EmisionPoint[];
    taxInputs: TaxInput[];
    taxes: Tax[];
    setShop: Dispatch<SetStateAction<ShopCreateProps>>;
    setTaxes: Dispatch<SetStateAction<Tax[]>>;
    errorShop: Record<keyof ShopCreateProps, string>;
    setErrorShop: Dispatch<Record<keyof ShopCreateProps, string>>;
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
    const [points, setPoints] = useState<EmisionPoint[]>([]);
    const [errorShop, setErrorShop] = useState<Record<keyof ShopCreateProps, string>>({} as Record<keyof ShopCreateProps, string>);
    const [taxInputs, setTaxInputs] = useState<TaxInput[]>([]);
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
            shop, points, taxInputs, errorShop, taxes,
            setShop, setErrorShop, setTaxes,
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