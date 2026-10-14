"use client";

import { Tax } from "@/types"
import { IconButton } from "@/components";
import { useTaxes } from "../hooks/useTaxes";
import { useShopVoucherType } from "../hooks/useShopVoucherType";
import { SelectRetention } from "./SelectRetention";
import { cellInput, cellInputError, cellInputNormal, tableRow } from "../../orders/shared/FormSection";

interface Props {
    index: number;
    tax: Tax;
    error?: Partial<Record<keyof Tax, string>>;
}

export const ItemTax = ({ index, tax, error }: Props) => {

    const { updateItem, deleteItem } = useTaxes();
    const { isNotaVenta } = useShopVoucherType();

    return (
        <tr className={tableRow}>
            <td>
                <select
                    aria-label={`Impuesto línea ${index + 1}`}
                    value={tax.code}
                    onChange={(e) => updateItem(index, 'code', e.target.value)}
                    disabled={isNotaVenta}
                    className={`${cellInput} ${error?.code ? cellInputError : cellInputNormal} disabled:opacity-60`}
                >
                    <option value="">Seleccione</option>
                    <option value={1}>Renta</option>
                    <option value={2}>IVA</option>
                </select>
            </td>
            <td>
                <SelectRetention index={index} tax={tax} error={error?.tax_code} disabled={isNotaVenta} />
            </td>
            <td className="text-right tabular-nums">
                {tax.editable_porcentage ? (
                    <input
                        aria-label={`Porcentaje línea ${index + 1}`}
                        type="number"
                        inputMode="decimal"
                        value={tax.porcentage ?? ''}
                        className={`${cellInput} text-right ${error?.porcentage ? cellInputError : cellInputNormal}`}
                        onChange={(e) => updateItem(index, 'porcentage', e.target.value)}
                    />
                ) : <span className="inline-block pt-1.5 text-ink-2">{tax.porcentage}%</span>}
            </td>
            <td>
                <input
                    aria-label={`Base línea ${index + 1}`}
                    type="number"
                    inputMode="decimal"
                    value={tax.base}
                    className={`${cellInput} text-right ${error?.base ? cellInputError : cellInputNormal}`}
                    onChange={(e) => updateItem(index, 'base', e.target.value)}
                />
            </td>
            <td className="text-right tabular-nums text-ink-1 pt-3.5!">{tax.value.toFixed(2)}</td>
            <td className="w-1 py-0.5!">
                <IconButton action="delete" type="button" onClick={() => deleteItem(index)} title="Eliminar retención" />
            </td>
        </tr>
    )
}
