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
    // Factura / nota de venta con inventario: las líneas son el ingreso al kardex (costo sin IVA)
    const { isInventoryEntry, isNotaVenta } = useShopVoucherType();

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

    // Las líneas calculan las bases del resumen (también al ingresar inventario; ahí el costo es sin IVA).
    // Nota de venta no maneja IVA: todo va a 0%. El resto de bases (no objeto, 5%, 12%) e ICE se conservan
    const calculateTotals = useCallback((products: ProductOutput[]) => {
        let base0 = 0;
        let base15 = 0;

        products.forEach(({ iva, total_iva }) => {
            if (iva === 4 && !isNotaVenta) base15 += Number(total_iva);
            else if (iva === 0 || iva === 4) base0 += Number(total_iva);
        });

        // Ingreso de inventario sin costos aún: no se pisan las bases tipeadas o importadas del XML
        if (isInventoryEntry && base0 + base15 === 0) return;

        base0 = Number(base0.toFixed(2));
        base15 = Number(base15.toFixed(2));

        setShop(prev => {
            const iva15 = Number((base15 * 0.15).toFixed(2));
            const subTotal = Number(prev.no_iva ?? 0) + base0 + Number(prev.base5 ?? 0) + Number(prev.base12 ?? 0) + base15;
            return {
                ...prev,
                base0,
                base15,
                sub_total: subTotal,
                iva15,
                // Igual que el resumen: el total incluye lo no objeto de IVA y el ICE
                total: Number((subTotal + Number(prev.ice ?? 0) + Number(prev.iva ?? 0) + Number(prev.iva5 ?? 0) + iva15).toFixed(2)),
            };
        });
    }, [setShop, isInventoryEntry, isNotaVenta]);

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
