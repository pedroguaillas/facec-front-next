import { Tax } from "@/types"
import { useTaxes } from "../hooks/useTaxes";
import { FaTrash } from "react-icons/fa";
import { SelectRetention } from "./SelectRetention";

interface Props {
    index: number;
    tax: Tax;
}

export const ItemTax = ({ index, tax }: Props) => {

    const { updateItem } = useTaxes();

    return (
        <tr className="[&>td]:border [&>td]:border-gray-300 [&>td]:p-1 [&>td]:dark:border-gray-500">
            <td>
                <select className="w-full border border-slate-300 rounded p-1" value={tax.code} onChange={(e) => updateItem(index, 'code', e.target.value)}>
                    <option value="">Seleccione</option>
                    <option value={2}>IVA</option>
                    <option value={1}>Imp. Renta</option>
                </select>
            </td>
            <td className="p-1">
                <SelectRetention />
            </td>
            <td className="p-1 text-right">
                {tax.editable_porcentage ? (
                    <input type="number" className="w-fit border border-slate-300 rounded p-1" value={tax.porcentage} onChange={(e) => updateItem(index, 'porcentage', e.target.value)} />
                ) : (`${tax.porcentage}%`)}
            </td>
            <td className="p-1">
                <input type="number" className="w-fit border border-slate-300 rounded p-1" value={tax.base} onChange={(e) => updateItem(index, 'base', e.target.value)} />
            </td>
            <td className="p-1 text-right">{tax.value.toFixed(2)}</td>
            <td className="w-1">
                <button className="flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600">
                    <FaTrash />
                </button>
            </td>
        </tr>
    )
}
