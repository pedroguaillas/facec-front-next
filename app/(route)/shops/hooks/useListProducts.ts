import { initialProductItem } from "@/constants/initialValues";
import { useFormShop } from "../context/FormShopContext";
import { fields, ProductOutput, ProductPresentation, ProductProps } from "@/types";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { presentationBySearch } from "@/helpers/presentationHelper";
import { useInventory } from "@/lib/hooks/useInventory";
import { useShopVoucherType } from "./useShopVoucherType";

export const useListProducts = () => {
    const { enabled: inventory } = useInventory();

    const { setShop, setProductOutputs } = useFormShop();
    // Factura / nota de venta con inventario: las bases se copian del comprobante, las líneas no las tocan
    const { isInventoryEntry } = useShopVoucherType();

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

    const selectProduct = (index: number, product: ProductProps, search?: string, chosen?: ProductPresentation | null) => {
        // Fila elegida en el modal (null = unidad base); si no hubo fila, la presentación cuyo código se buscó.
        // Las presentaciones son parte del inventario: sin él la línea va siempre en unidad base
        const presentation = !inventory ? null : chosen !== undefined ? chosen : presentationBySearch(product, search);
        const salePrice = presentation ? Number(presentation.price) : product.atts.price1;
        setProductOutputs((prevState) => {
            const newState = [...prevState];
            newState[index] = {
                ...newState[index],
                product_id: product.id,
                name: product.atts.name,
                quantity: 1,
                // En la factura del proveedor el precio es el costo de compra: no se precarga el precio de venta
                price: isInventoryEntry ? '' : salePrice,
                total_iva: isInventoryEntry ? '0.00' : salePrice.toFixed(2),
                iva: product.iva.code,
                percentage: product.iva.percentage,
                presentation_id: presentation?.id ?? null,
                conversion_factor: presentation?.conversion_factor ?? null,
                unit_price: product.atts.price1,
                presentations: product.presentations ?? [],
            };
            calculateTotals(newState);
            return newState;
        });
    }

    const calculateTotals = useCallback((products: ProductOutput[]) => {
        if (isInventoryEntry) return;
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
    }, [setShop, isInventoryEntry]);

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
