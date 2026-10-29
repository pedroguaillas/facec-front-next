import { useFormInvoice } from "../context/FormInvoiceContext";
import { productOutputSchema } from "@/schemas/product-output.schema";
import { initialProductItem } from "@/constants/initialValues";
import { fields, ProductOutput, ProductPresentation, ProductProps, ProductUnit } from "@/types";
import { calculateInvoiceTotals, calculateLineTotal } from "@/helpers/invoiceTotalsHelper";
import { nanoid } from "nanoid";
import { arrayMove } from "@dnd-kit/sortable";
import { presentationBySearch } from "@/helpers/presentationHelper";
import { useInventory } from "@/lib/hooks/useInventory";
import { useProductTemplates } from "@/lib/hooks/useProductTemplates";
import { isUnitLine, requiresUnit } from "@/helpers/productTemplateHelper";
import { ORDER_VOUCHER_TYPE_SLUG } from "@/constants";
import { useState } from "react";


export const useProductOutput = () => {
    const { enabled: inventory } = useInventory();

    const { productOutputs, invoice, voucherTypes, applyHolidayIva, setInvoice, setProductOutputs, setErrorProductOutputs, setIsActiveIce } = useFormInvoice();
    const templates = useProductTemplates();
    // Modelo con campos por unidad elegido en una línea: se abre el buscador de sus unidades en stock
    const [unitPicker, setUnitPicker] = useState<{ index: number; product: ProductProps } | null>(null);

    // Factura y nota de venta exigen la unidad; la proforma (cotización) y la nota de crédito aceptan el modelo
    const voucherSlug = voucherTypes.find(vt => vt.id === Number(invoice.voucher_type_id))?.slug;
    const sellsUnits = voucherSlug === ORDER_VOUCHER_TYPE_SLUG.FACTURA || voucherSlug === ORDER_VOUCHER_TYPE_SLUG.NOTA_VENTA;

    const addItem = () => {
        setProductOutputs((prev) => ([...prev, { ...initialProductItem, id: nanoid(), }]));
    };

    // Modificar campos del Item Product
    const updateItem = (index: number, field: fields, value: string | number) => {
        if (value && Number(value) < 0) return
        if (field === 'quantity' && isUnitLine(productOutputs[index])) return
        const updated: ProductOutput = { ...productOutputs[index], [field]: value };

        // Validar ese campo
        const validation = productOutputSchema.safeParse(updated);

        if (!validation.success) {
            const fieldError = validation.error.flatten().fieldErrors;
            setErrorProductOutputs(prev => ({
                ...prev,
                [updated.id]: {
                    ...prev[updated.id],
                    [field]: fieldError[field]?.[0] || ""
                }
            }));
        } else {
            // Si está correcto, limpiar error de ese campo
            setErrorProductOutputs(prev => ({
                ...prev,
                [updated.id]: {
                    ...prev[updated.id],
                    [field]: ""
                }
            }));
        }

        if (field === 'total_iva') {
            const { percentage } = updated
            const quantity = updated.quantity === '' ? 0 : Number(updated.quantity);
            updated.price = parseFloat((Number(value) / quantity / (1 + (percentage / 100))).toFixed(6))
        } else if (field !== 'ice') {
            updated.total_iva = calculateLineTotal(updated);
        }

        const prods = productOutputs.map((item, i) => i === index ? updated : item);
        recalculate(prods);
    };

    // Seleccionar producto para un Item
    const selectProduct = (index: number, product: ProductProps, search?: string, chosen?: ProductPresentation | null) => {
        const isUnit = !!product.parent_product_id;
        if (!isUnit && sellsUnits && product.product_template_id
            && requiresUnit(templates.find(t => t.id === product.product_template_id))) {
            setUnitPicker({ index, product });
            return;
        }
        // Fila elegida en el modal (null = unidad base); si no hubo fila, la presentación cuyo código se buscó.
        // Las presentaciones son parte del inventario: sin él la línea va siempre en unidad base.
        // Una unidad no se vende por presentación
        const presentation = !inventory || isUnit ? null : chosen !== undefined ? chosen : presentationBySearch(product, search);
        const price = presentation ? Number(presentation.price) : product.atts.price1;
        const selected: ProductOutput = {
            ...productOutputs[index],
            product_id: product.id,
            aux_cod: product.atts.aux_cod,
            product_code: product.atts.code,
            name: product.atts.name,
            price,
            quantity: 1,
            discount: 0,
            stock: 1,
            total_iva: (price * (1 + product.iva.percentage / 100)).toFixed(2),
            iva: product.iva.code,
            percentage: product.iva.percentage,
            differentiated_iva: !!product.atts.differentiated_iva,
            available_stock: product.atts.stock,
            // Arranca en unidad base; la presentación se elige en la línea
            presentation_id: presentation?.id ?? null,
            conversion_factor: presentation?.conversion_factor ?? null,
            unit_price: product.atts.price1,
            presentations: isUnit ? [] : product.presentations ?? [],
            type_product: product.atts.type_product,
            parent_product_id: product.parent_product_id ?? null,
            characteristics: product.characteristics ?? [],
        };
        // En feriado un servicio turístico (IVA diferenciado) pasa del 15% al 8%
        const [updated] = applyHolidayIva([selected]);
        if (product.atts.ice !== null) {
            updated.ice = '';
            setIsActiveIce(true);
        }
        // Si está correcto, limpiar error de ese campo
        setErrorProductOutputs(prev => ({
            ...prev,
            [updated.id]: {
                ...prev[updated.id],
                product_id: ""
            }
        }));

        const prods = productOutputs.map((item, i) => i === index ? updated : item);
        recalculate(prods);
    }

    // Unidad elegida en el buscador del modelo: la línea va con el product_id de la unidad
    const selectUnit = (unit: ProductUnit) => {
        if (!unitPicker) return;
        const { index, product } = unitPicker;
        setUnitPicker(null);
        selectProduct(index, {
            ...product,
            id: unit.id,
            atts: { ...product.atts, code: unit.code, name: unit.name || product.atts.name, price1: Number(unit.price1), stock: unit.stock },
            presentations: [],
            parent_product_id: unit.parent_product_id,
            characteristics: unit.characteristics,
        });
    };

    // Eliminar producto
    const removeItem = (index: number) => {
        let prods = productOutputs;
        prods = prods.filter((_, indexProduct) => indexProduct !== index);
        recalculate(prods);
    };

    //Method caculate totals & modify state all.
    const recalculate = (productOutpus: ProductOutput[]) => {
        setProductOutputs(productOutpus);
        setInvoice(prevState => ({ ...prevState, ...calculateInvoiceTotals(productOutpus) }));
    };

    // Reordenar líneas (arrastrar): no cambia totales, solo el orden en el comprobante
    const moveItem = (activeId: string, overId: string) => {
        setProductOutputs(prev => {
            const from = prev.findIndex(item => item.id === activeId);
            const to = prev.findIndex(item => item.id === overId);
            return from < 0 || to < 0 ? prev : arrayMove(prev, from, to);
        });
    };

    return { productOutputs, addItem, updateItem, selectProduct, removeItem, moveItem, unitPicker, selectUnit, closeUnitPicker: () => setUnitPicker(null) }
}