"use client";

import { ReactNode } from "react";
import { fields, ProductOutput } from "@/types/order";
import { PresentationLabel, SelectProduct } from "@/components";
import { ProductPresentation, ProductProps } from "@/types";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { DragHandle, useSortableItem } from "./SortableItems";
import { hasIceApplied } from "@/helpers/invoiceTotalsHelper";
import { limitDecimals } from "@/helpers/numberHelper";
import { IconButton } from "@/components";
import { cellInput, cellInputError, cellInputNormal, tableRow } from "./FormSection";
import { useInventory } from "@/lib/hooks/useInventory";
import { ORDER_VOUCHER_TYPE_SLUG } from "@/constants";
import { characteristicsText } from "@/helpers/productTemplateHelper";
import { isUnitLine } from "@/helpers/productTemplateHelper";

interface Props {
    index: number;
    productOutput: ProductOutput;
    error?: Partial<Record<keyof ProductOutput, string>>;
    updateItem: (index: number, field: fields, value: number | string) => void;
    selectProduct: (index: number, product: ProductProps, search?: string, presentation?: ProductPresentation | null) => void;
    // Muestra la presentación elegida (solo ventas/compras; guías e inventario van en unidad base)
    withPresentations?: boolean;
    removeItem: (index: number) => void;
    sortable?: boolean;
    extra?: ReactNode;
}

const inputBase = `${cellInput} text-right`;
const inputError = cellInputError;
const inputNormal = cellInputNormal;

export const ItemProduct = ({ index, productOutput, error, updateItem, selectProduct, withPresentations = false, removeItem, sortable = false, extra }: Props) => {

    const { isActiveIce, invoice, voucherTypes } = useFormInvoice();
    const { enabled: inventory, allowNegativeStock } = useInventory();

    // Solo factura y nota de venta descuentan stock (proforma y notas no)
    const voucherSlug = voucherTypes.find(vt => vt.id === Number(invoice.voucher_type_id))?.slug;
    const movesStock = voucherSlug === ORDER_VOUCHER_TYPE_SLUG.FACTURA || voucherSlug === ORDER_VOUCHER_TYPE_SLUG.NOTA_VENTA;
    const stock = productOutput.available_stock;
    const exceedsStock = inventory && movesStock && productOutput.type_product === 1
        && stock !== null && stock !== undefined
        // La cantidad va en la presentación; el stock siempre en unidad base
        && Number(productOutput.quantity) * (Number(productOutput.conversion_factor) || 1) > Number(stock);
    const { setNodeRef, style, isDragging, handleProps } = useSortableItem(productOutput.id);
    const isUnit = isUnitLine(productOutput);
    const unitText = isUnit ? characteristicsText(productOutput.characteristics) : '';
    // Al elegirla: código del producto; al editar la venta: el guardado en la línea
    const unitCode = productOutput.product_code ?? productOutput.code;

    const baseCalculation = () => {
        let { quantity, price, discount } = productOutput;
        quantity = quantity === '' ? 0 : Number(quantity);
        price = price === '' ? 0 : Number(price);
        discount = discount === '' ? 0 : Number(discount);
        return (quantity * price) - discount;
    }

    const ivaCalculation = () => {
        const { percentage } = productOutput;
        if (productOutput.iva === 4 || productOutput.iva === 5 || productOutput.iva === 8) {
            return baseCalculation() * percentage / 100;
        }
        return 0;
    }

    return (
        <tr ref={setNodeRef} style={style} className={`${tableRow} ${isDragging ? 'bg-surface shadow-md' : ''}`}>
            {/* La fila es align-top (por los errores bajo los campos); el asa va centrada */}
            <td className="py-0.5! align-middle">
                {sortable && <DragHandle {...handleProps} label={`Mover línea ${index + 1}`} />}
            </td>
            <td>
                <SelectProduct index={index} label={productOutput.name ?? ''} error={error?.product_id} selectProduct={selectProduct} withPresentations={withPresentations} />
                {unitText && <p className="mt-1 text-xs text-ink-3">{unitCode ? `${unitCode} · ` : ''}{unitText}</p>}
                {withPresentations && productOutput.product_id > 0 && !isUnit && (
                    <PresentationLabel
                        productId={productOutput.product_id}
                        presentations={productOutput.presentations}
                        value={productOutput.presentation_id}
                        conversionFactor={productOutput.conversion_factor}
                    />
                )}
                {extra}
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', limitDecimals(e.target.value, 6))}
                    value={productOutput.quantity ?? ''}
                    type="text"
                    inputMode="decimal"
                    step="0.000001"
                    readOnly={isUnit}
                    title={isUnit ? 'Cada unidad va en su propia línea' : undefined}
                    className={`${inputBase} ${error?.quantity ? inputError : inputNormal} ${isUnit ? 'opacity-60' : ''}`}
                />
                {error?.quantity && isUnit && <p className="text-xs mt-1 text-right text-red-500">{error.quantity}</p>}
                {exceedsStock && (
                    <p className={`text-xs mt-1 text-right ${allowNegativeStock ? 'text-sri-wait' : 'text-red-500'}`} role="status">
                        Stock: {Number(stock).toLocaleString('es-EC', { maximumFractionDigits: 6 })}
                    </p>
                )}
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'price', limitDecimals(e.target.value, 6))}
                    value={productOutput.price ?? ''}
                    type="text"
                    inputMode="decimal"
                    step="0.000001"
                    className={`${inputBase} ${error?.price ? inputError : inputNormal}`}
                />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'discount', limitDecimals(e.target.value, 2))}
                    value={productOutput.discount ?? ''}
                    type="text"
                    inputMode="decimal"
                    step="0.01"
                    className={`${inputBase} ${error?.discount ? inputError : inputNormal}`}
                />
            </td>
            <td className="text-right tabular-nums text-ink-2 pt-3.5!">{baseCalculation().toFixed(2)}</td>
            <td className="text-right tabular-nums text-ink-2 pt-3.5!">{ivaCalculation().toFixed(2)}</td>
            <td className="text-right">
                <input
                    onChange={(e) => updateItem(index, 'total_iva', limitDecimals(e.target.value, 2))}
                    value={productOutput.total_iva ?? ''}
                    type="text"
                    inputMode="decimal"
                    step="0.01"
                    className={`${inputBase} ${error?.total_iva ? inputError : inputNormal}`}
                />
            </td>
            {isActiveIce ?
                <td>
                    {hasIceApplied(productOutput.ice) ? (
                        <input
                            onChange={(e) => updateItem(index, 'ice', e.target.value)}
                            value={productOutput.ice}
                            type="text"
                            inputMode="decimal"
                            className={`${inputBase} ${error?.ice ? inputError : inputNormal}`}
                        />
                    ) : null}
                </td>
                : null}
            <td className="w-1 py-0.5!">
                <IconButton action="delete" type="button" onClick={() => removeItem(index)} title="Eliminar línea" />
            </td>
        </tr>
    )
}
