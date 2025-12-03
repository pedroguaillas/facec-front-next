import { fieldRepaymetStrings, Repayment } from "@/types";
import { FaTrash } from "react-icons/fa";
import { useItemRepaymentTaxes } from "../hooks/useItemRepaymentTaxes";
import { ItemRepaymentTaxes } from "./ItemRepaymentTaxes";
import { getDate } from "@/helpers/dateHelper";

interface Props {
  index: number;
  repayment: Repayment;
  error?: Partial<Record<keyof Repayment, string>>;
  updateItemRepayment: (index: number, attr: fieldRepaymetStrings, value: string) => void;
  deleteItemRepayment: (index: number) => void;
}

export const ItemRepayment = ({ index, repayment, error, updateItemRepayment, deleteItemRepayment }: Props) => {
  const { addItemRepaymentTax, updateItemRepaymentTax, deleteItemRepaymentTax } = useItemRepaymentTaxes();

  return (
    <tr className="[&>td]:p-1 [&>td]:border [&>td]:border-gray-300 [&>td]:py-2 [&>td]:dark:border-gray-500">
      <td>
        <input
          onChange={(e) => updateItemRepayment(index, 'identification', e.target.value)}
          value={repayment.identification}
          className={`w-full border px-1 rounded text-gray-600 dark:text-gray-300
                        ${error?.identification ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          maxLength={13}
        />
      </td>
      <td>
        <input
          onChange={(e) => updateItemRepayment(index, 'sequential', e.target.value)}
          value={repayment.sequential}
          className={`w-full border px-1 rounded text-gray-600 dark:text-gray-300
            ${error?.sequential ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          maxLength={17}
          placeholder="001-002-000000009"
        />
      </td>
      <td>
        <input
          type="date"
          onChange={(e) => updateItemRepayment(index, 'date', e.target.value)}
          value={repayment.date}
          className={`w-full border px-1 rounded text-gray-600 dark:text-gray-300
            ${error?.date ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          max={getDate()}
        />
      </td>
      <td>
        <input
          onChange={(e) => updateItemRepayment(index, 'authorization', e.target.value)}
          value={repayment.authorization}
          className={`w-full border px-1 rounded text-gray-600 dark:text-gray-300
            ${error?.authorization ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          maxLength={49}
        />
        {error?.authorization && <p className="text-red-500">{error.authorization}</p>}
      </td>
      <td className="text-right">
        <div className="py-1 px-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Detalle de Impuestos
            </h4>
            <button
              onClick={() => addItemRepaymentTax(index)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              +
              Agregar
            </button>
          </div>
          <ItemRepaymentTaxes
            indexRepayment={index}
            repaymentTaxes={repayment.repaymentTaxes}
            updateRepaymentTax={updateItemRepaymentTax}
            deleteRepaymentTax={deleteItemRepaymentTax}
          />
        </div>
      </td>
      <td className="w-1">
        <button
          onClick={() => deleteItemRepayment(index)}
          className="flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600">
          <FaTrash />
        </button>
      </td>
    </tr >
  )
}
