import { initialProductItem, VoucherType } from "@/constants";
import { useFormShop } from "../context/FormShopContext";
import { SupplierProps } from "@/types";
import { useEffect } from "react";
import { nanoid } from "nanoid";

export const useGeneralInformation = () => {

    const { shop, errorShop, setShop, setErrorShop, setProductOutputs } = useFormShop();

    const invoiceTypes = [
        { value: 1, label: 'Factura' },
        { value: 2, label: 'Nota Venta' },
        { value: 3, label: 'Liquidación en Compra' },
        { value: 5, label: 'Nota Débito' }
    ];

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
        if (Number(shop.voucher_type) === VoucherType.LIQUIDATION) {
            setProductOutputs((prevState) => {
                if (prevState.length === 0) {
                    return [{ ...initialProductItem, id: nanoid() }];
                }
                return prevState;
            });
        }
    }, [shop.voucher_type, setProductOutputs]);

    return { invoiceTypes, handleChange, handleSelectProvider }
}