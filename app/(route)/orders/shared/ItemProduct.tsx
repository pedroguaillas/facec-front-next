"use client";

import { ReactNode } from "react";
import { fields, ProductOutput } from "@/types/order";
import { SelectProduct } from "@/components";
import { ProductProps } from "@/types";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { DragHandle, useSortableItem } from "./SortableItems";
import { hasIceApplied } from "@/helpers/invoiceTotalsHelper";
import { limitDecimals } from "@/helpers/numberHelper";
import { IconButton } from "@/components";
import { cellInput, cellInputError, cellInputNormal, tableRow } from "./FormSection";

interface Props {
    index: number;
    productOutput: ProductOutput;
    error?: Partial<Record<keyof ProductOutput, string>>;
    updateItem: (index: number, field: fields, value: number | string) => void;
    selectProduct: (index: number, product: ProductProps) => void;
    removeItem: (index: number) => void;
    sortable?: boolean;
    extra?: ReactNode;
}

const inputBase = `${cellInput} text-right`;
const inputError = cellInputError;
const inputNormal = cellInputNormal;

export const ItemProduct = ({ index, productOutput, error, updateItem, selectProduct, removeItem, sortable = false, extra }: Props) => {

    const { isActiveIce } = useFormInvoice();
    const { setNodeRef, style, isDragging, handleProps } = useSortableItem(productOutput.id);

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
                <SelectProduct index={index} label={productOutput.name ?? ''} error={error?.product_id} selectProduct={selectProduct} />
                {extra}
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', limitDecimals(e.target.value, 6))}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    inputMode="decimal"
                    step="0.000001"
                    className={`${inputBase} ${error?.quantity ? inputError : inputNormal}`}
                />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'price', limitDecimals(e.target.value, 6))}
                    value={productOutput.price ?? ''}
                    type="number"
                    inputMode="decimal"
                    step="0.000001"
                    className={`${inputBase} ${error?.price ? inputError : inputNormal}`}
                />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'discount', limitDecimals(e.target.value, 2))}
                    value={productOutput.discount ?? ''}
                    type="number"
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
                    type="number"
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
                            type="number"
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
