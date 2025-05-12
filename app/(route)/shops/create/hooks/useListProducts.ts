import { initialProductItem } from "@/constants/initialValues";
import { useCreateShop } from "../context/ShopCreateContext";
import { fields, ProductProps } from "@/types";
import { nanoid } from "nanoid";

export const useListProducts = () => {

    const { setProductOutputs } = useCreateShop();

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
            return newState;
        });
    }

    const deleteItem = (index: number) => {
        setProductOutputs((prevState) => prevState.filter((_, i) => i !== index));
    }

    return { addItem, updateItem, selectProduct, deleteItem }
}
