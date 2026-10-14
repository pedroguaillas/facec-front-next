import { initialProductItem } from "@/constants/initialValues";
import { useFormShop } from "../context/FormShopContext";
import { fields, ProductOutput, ProductProps } from "@/types";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export const useListProducts = () => {

    const { setShop, setProductOutputs } = useFormShop();

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
                name: product.atts.name,
                quantity: 1,
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
            // IVA 15%: va en iva15 (iva es la tarifa 12%)
            iva: 0,
            iva15: totalIva,
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

    // Reordenar líneas (arrastrar): no cambia totales
    const moveItem = (activeId: string, overId: string) => {
        setProductOutputs(prev => {
            const from = prev.findIndex(item => item.id === activeId);
            const to = prev.findIndex(item => item.id === overId);
            return from < 0 || to < 0 ? prev : arrayMove(prev, from, to);
        });
    };

    return { addItem, updateItem, selectProduct, deleteItem, moveItem }
}
