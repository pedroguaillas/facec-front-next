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

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const inputError = "border-red-400";
const inputNormal = "border-[var(--border-strong)]";

export const ItemRepayment = ({ index, repayment, error, updateItemRepayment, deleteItemRepayment }: Props) => {
  const { addItemRepaymentTax, updateItemRepaymentTax, deleteItemRepaymentTax } = useItemRepaymentTaxes();

  return (
    <tr className="[&>td]:p-1.5 [&>td]:border [&>td]:border-[var(--border)] [&>td]:py-2">
      <td>
        <input
          onChange={(e) => updateItemRepayment(index, 'identification', e.target.value)}
          value={repayment.identification}
          className={`${inputBase} ${error?.identification ? inputError : inputNormal}`}
          maxLength={13}
        />
      </td>
      <td>
        <input
          onChange={(e) => updateItemRepayment(index, 'sequential', e.target.value)}
          value={repayment.sequential}
          className={`${inputBase} ${error?.sequential ? inputError : inputNormal}`}
          maxLength={17}
          placeholder="001-002-000000009"
        />
      </td>
      <td>
        <input
          type="date"
          onChange={(e) => updateItemRepayment(index, 'date', e.target.value)}
          value={repayment.date}
          className={`${inputBase} ${error?.date ? inputError : inputNormal}`}
          max={getDate()}
        />
      </td>
      <td>
        <input
          onChange={(e) => updateItemRepayment(index, 'authorization', e.target.value)}
          value={repayment.authorization}
          className={`${inputBase} ${error?.authorization ? inputError : inputNormal}`}
          maxLength={49}
        />
        {error?.authorization && <p className="text-xs text-red-500 mt-1">{error.authorization}</p>}
      </td>
      <td className="text-right">
        <div className="py-1 px-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold dark:text-gray-300">
              Detalle de Impuestos
            </h4>
            <button
              onClick={() => addItemRepaymentTax(index)}
              className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primaryhover transition-colors cursor-pointer"
            >
              + Agregar
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
    </tr>
  )
}
