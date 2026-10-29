import { initialProductItem } from "@/constants/initialValues";
import { useFormShop } from "../context/FormShopContext";
import { fields, ProductOutput, ProductPresentation, ProductProps } from "@/types";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { presentationBySearch } from "@/helpers/presentationHelper";
import { useInventory } from "@/lib/hooks/useInventory";
import { useShopVoucherType } from "./useShopVoucherType";
import { useProductTemplates } from "@/lib/hooks/useProductTemplates";
import { templateFieldsOf } from "@/helpers/productTemplateHelper";
import { xmlLineOutputs } from "./useXmlLines";

// Línea de una unidad (nueva o ya existente): una por línea, cantidad fija 1
export const isUnitLine = (item: ProductOutput) => !!item.unit_template_id || !!item.parent_product_id;

export const useListProducts = () => {
    const { enabled: inventory } = useInventory();

    const { productOutputs, xmlImported, setShop, setProductOutputs, setErrorShop, setXmlImported } = useFormShop();
    // Factura / nota de venta con inventario: las líneas son el ingreso al kardex (costo sin IVA)
    const { isInventoryEntry, isNotaVenta } = useShopVoucherType();
    const templates = useProductTemplates();

    const addItem = () => {
        setProductOutputs((prevState) => [...prevState, { ...initialProductItem, id: nanoid() }]);
    }

    const updateItem = (index: number, field: fields, value: string | number) => {
        if (value && Number(value) < 0) return;
        setProductOutputs((prevState) => {
            if (field === 'quantity' && isUnitLine(prevState[index])) return prevState;
            // Cantidad y costo de una línea del XML van tal como vienen
            if (prevState[index].xml) return prevState;
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
        // Línea del XML: se vincula el producto y se conservan cantidad y costo del XML
        // (un modelo con campos por unidad se separa en una línea por unidad)
        const xml = productOutputs[index]?.xml;
        if (xml) {
            const presentation = !inventory ? null : chosen !== undefined ? chosen : presentationBySearch(product, search);
            const lines = xmlLineOutputs({ ...xml, match: 'manual', remember: true }, product, templates, presentation);
            setProductOutputs(prev => [...prev.slice(0, index), ...lines, ...prev.slice(index + 1)]);
            setErrorShop(prev => ({ ...prev, [`products.${index}.product_id`]: '' }));
            return;
        }
        // Fila elegida en el modal (null = unidad base); si no hubo fila, la presentación cuyo código se buscó.
        // Las presentaciones son parte del inventario: sin él la línea va siempre en unidad base
        // Modelo con campos por unidad (ej. moto): la línea da de alta una unidad nueva, sin presentación
        const template = !product.parent_product_id && product.product_template_id
            ? templates.find(t => t.id === product.product_template_id)
            : undefined;
        const unitTemplateId = templateFieldsOf(template, 'unidad').length > 0 ? template!.id : null;
        const presentation = !inventory || unitTemplateId ? null : chosen !== undefined ? chosen : presentationBySearch(product, search);
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
                presentations: unitTemplateId ? [] : product.presentations ?? [],
                unit_template_id: unitTemplateId,
                unit: unitTemplateId ? {} : undefined,
                unit_code: unitTemplateId ? '' : undefined,
                parent_product_id: product.parent_product_id ?? null,
                characteristics: product.characteristics ?? [],
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
        // Cargada del XML: las bases son las del comprobante
        if (xmlImported) return;

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
    }, [setShop, isInventoryEntry, isNotaVenta, xmlImported]);

    // Valor de un campo de la unidad nueva (chasis, motor) o su código manual
    const updateUnit = (index: number, key: string | null, value: string) => {
        setProductOutputs(prev => prev.map((item, i) => i !== index ? item
            : key === null ? { ...item, unit_code: value } : { ...item, unit: { ...item.unit, [key]: value } }));
        const errorKey = key === null ? `products.${index}.unit_code` : `products.${index}.unit.${key}`;
        setErrorShop(prev => ({ ...prev, [errorKey]: '', [`products.${index}.unit`]: '' }));
    };

    // Otra unidad del mismo modelo y costo, debajo de la línea
    const addUnitLine = (index: number) => {
        setProductOutputs(prev => {
            const newState = [...prev];
            newState.splice(index + 1, 0, { ...prev[index], id: nanoid(), unit: {}, unit_code: '' });
            calculateTotals(newState);
            return newState;
        });
    };

    const deleteItem = (index: number) => {
        setProductOutputs((prevState) => {
            if (prevState[index]?.xml) return prevState;
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

    // "Recordar para este proveedor" en una línea del XML vinculada a mano
    const toggleRemember = (index: number) => {
        setProductOutputs(prev => prev.map((item, i) => i === index && item.xml ? { ...item, xml: { ...item.xml, remember: !item.xml.remember } } : item));
    };

    // Deja de tratar la compra como XML: cabecera, bases y líneas vuelven a ser editables
    const unlockXml = () => setXmlImported(false);

    return { addItem, updateItem, selectProduct, deleteItem, moveItem, updateUnit, addUnitLine, toggleRemember, unlockXml }
}
