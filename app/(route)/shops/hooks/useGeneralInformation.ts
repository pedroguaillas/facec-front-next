import { initialProductItem } from "@/constants";
import { useFormShop } from "../context/FormShopContext";
import { useShopVoucherType } from "./useShopVoucherType";
import { SupplierProps } from "@/types";
import { useEffect } from "react";
import { nanoid } from "nanoid";

export const useGeneralInformation = () => {

    const { errorShop, voucherTypes, setShop, setErrorShop, setProductOutputs } = useFormShop();
    const { isLiquidacion, isFactura } = useShopVoucherType();

    const invoiceTypes = voucherTypes.map((vt) => ({ value: vt.id, label: vt.name }));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setShop((prevState) => ({ ...prevState, [name]: value }))

        if (name in errorShop) {
            setErrorShop((prevState) => ({ ...prevState, [name]: '' }))
        }
    }

    const handleSelectProvider = (provider: SupplierProps) => {
        setShop((prevState) => ({ ...prevState, provider_id: provider.id }))

        if ('provider_id' in errorShop) {
            setErrorShop((prevState) => ({ ...prevState, provider_id: '' }))
        }
    }

    useEffect(() => {
        if (isLiquidacion) {
            setProductOutputs((prevState) => {
                if (prevState.length === 0) {
                    return [{ ...initialProductItem, id: nanoid() }];
                }
                return prevState;
            });
        }
    }, [isLiquidacion, setProductOutputs]);

    return { invoiceTypes, isLiquidacion, isFactura, handleChange, handleSelectProvider }
}