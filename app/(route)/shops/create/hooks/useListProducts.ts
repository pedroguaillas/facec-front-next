import { initialProductItem } from "@/constants/initialValues";
import { useCreateShop } from "../context/ShopCreateContext";
import { fields, ProductOutput, ProductProps } from "@/types";
import { nanoid } from "nanoid";
import { useCallback } from "react";

export const useListProducts = () => {

    const { setShop, setProductOutputs } = useCreateShop();

    const addItem = () => {
        setProductOutputs((prevState) => [...prevState, { ...initialProductItem, id: nanoid() }]);
    }

    const updateItem = (index: number, field: fields, value: string | number) => {
        if (value && Number(value) < 0) return;
        setProductOutputs((prevState) => {
            const newState = [...prevState];
            newState[index] = {
                ...newState[index],
                [field]: value
            };
            const { price, quantity } = newState[index];
            newState[index].total_iva = (Number(price) * Number(quantity)).toFixed(2);
            calculateTotals(newState);
            return newState;
        });
    }

    const selectProduct = (index: number, product: ProductProps) => {
        setProductOutputs((prevState) => {
            const newState = [...prevState];
            newState[index] = {
                ...newState[index],
                product_id: product.id,
                price: product.atts.price1,
                total_iva: product.atts.price1.toFixed(2),
                iva: product.iva.code,
                percentage: product.iva.percentage
            };
            calculateTotals(newState);
            return newState;
        });
    }

    const calculateTotals = useCallback((products: ProductOutput[]) => {
        let base0 = 0;
        let base15 = 0;

        products.forEach(({ iva, total_iva }) => {
            if (iva === 0) {
                base0 += Number(total_iva);
            }
            if (iva === 4) {
                base15 += Number(total_iva);
            }
        });

        const subTotal = base0 + base15;
        const totalIva = Number((base15 * 0.15).toFixed(2));
        const total = Number((subTotal + totalIva).toFixed(2));

        setShop(prevState => ({
            ...prevState,
            base0,
            base15,
            sub_total: subTotal,
            iva: totalIva,
            total: total
        }));
    }, [setShop]);

    const deleteItem = (index: number) => {
        setProductOutputs((prevState) => {
            const newState = prevState.filter((_, i) => i !== index);
            calculateTotals(newState);
            return newState;
        });
    }

    return { addItem, updateItem, selectProduct, deleteItem }
}
