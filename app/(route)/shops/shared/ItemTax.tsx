import { Tax } from "@/types"
import { useTaxes } from "../hooks/useTaxes";
import { FaTrash } from "react-icons/fa";
import { SelectRetention } from "./SelectRetention";

interface Props {
    index: number;
    tax: Tax;
    error?: Partial<Record<keyof Tax, string>>;
}

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const selectBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const inputError = "border-red-400";
const inputNormal = "border-[var(--border-strong)]";

export const ItemTax = ({ index, tax, error }: Props) => {

    const { updateItem, deleteItem } = useTaxes();

    return (
        <tr className="[&>td]:border [&>td]:border-[var(--border)] [&>td]:p-1.5">
            <td>
                <select
                    value={tax.code}
                    onChange={(e) => updateItem(index, 'code', e.target.value)}
                    className={`${selectBase} ${error?.code ? inputError : inputNormal}`}
                >
                    <option value="">Seleccione</option>
                    <option value={2}>IVA</option>
                    <option value={1}>Imp. Renta</option>
                </select>
            </td>
            <td className="p-1.5">
                <SelectRetention index={index} tax={tax} error={error?.tax_code} />
            </td>
            <td className="p-1.5 text-right">
                {tax.editable_porcentage ? (
                    <input
                        type="number"
                        value={tax.porcentage ?? ''}
                        className={`${inputBase} ${error?.porcentage ? inputError : inputNormal}`}
                        onChange={(e) => updateItem(index, 'porcentage', e.target.value)}
                    />
                ) : (`${tax.porcentage}%`)}
            </td>
            <td className="p-1.5">
                <input
                    type="number"
                    value={tax.base}
                    className={`${inputBase} ${error?.base ? inputError : inputNormal}`}
                    onChange={(e) => updateItem(index, 'base', e.target.value)}
                />
            </td>
            <td className="p-1.5 text-right">{tax.value.toFixed(2)}</td>
            <td className="w-1">
                <button
                    onClick={() => deleteItem(index)}
                    className="flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600">
                    <FaTrash />
                </button>
            </td>
        </tr>
    )
}
