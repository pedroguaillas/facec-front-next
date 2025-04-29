import { Tax } from "@/types"
import { useTaxes } from "../hooks/useTaxes";
import { FaTrash } from "react-icons/fa";
import { SelectRetention } from "./SelectRetention";

interface Props {
    index: number;
    tax: Tax;
    error?: Partial<Record<keyof Tax, string>>;
}

export const ItemTax = ({ index, tax, error }: Props) => {

    const { updateItem, deleteItem } = useTaxes();

    return (
        <tr className="[&>td]:border [&>td]:border-gray-300 [&>td]:p-1 [&>td]:dark:border-gray-500">
            <td>
                <select
                    value={tax.code}
                    onChange={(e) => updateItem(index, 'code', e.target.value)}
                    className={`w-full border rounded p-1 
                    ${error?.code ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`} >
                    <option value="">Seleccione</option>
                    <option value={2}>IVA</option>
                    <option value={1}>Imp. Renta</option>
                </select>
            </td>
            <td className="p-1">
                <SelectRetention index={index} tax={tax} error={error?.tax_code} />
            </td>
            <td className="p-1 text-right">
                {tax.editable_porcentage ? (
                    <input
                        type="number"
                        value={tax.porcentage ?? ''}
                        className={`
                            w-full border rounded p-1
                            ${error?.porcentage ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}
                            `}
                        onChange={(e) => updateItem(index, 'porcentage', e.target.value)}
                    />
                ) : (`${tax.porcentage}%`)}
            </td>
            <td className="p-1">
                <input
                    type="number"
                    value={tax.base}
                    className={`
                        w-full border rounded p-1
                        ${error?.base ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}
                        `}
                    onChange={(e) => updateItem(index, 'base', e.target.value)}
                />
            </td>
            <td className="p-1 text-right">{tax.value.toFixed(2)}</td>
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
