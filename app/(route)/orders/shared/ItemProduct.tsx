import { fields, ProductOutput } from "@/types/order";
import { SelectProduct } from "@/components";
import { FaTrash } from "react-icons/fa";
import { ProductProps } from "@/types";
import { useFormInvoice } from "../context/FormInvoiceContext";
import { hasIceApplied } from "@/helpers/invoiceTotalsHelper";
import { limitDecimals } from "@/helpers/numberHelper";

interface Props {
    index: number;
    productOutput: ProductOutput;
    error?: Partial<Record<keyof ProductOutput, string>>;
    updateItem: (index: number, field: fields, value: number | string) => void;
    selectProduct: (index: number, product: ProductProps) => void;
    removeItem: (index: number) => void;
}

const inputBase = "w-full min-w-10 border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const inputError = "border-red-400";
const inputNormal = "border-[var(--border-strong)]";

export const ItemProduct = ({ index, productOutput, error, updateItem, selectProduct, removeItem }: Props) => {

    const { isActiveIce } = useFormInvoice();

    const baseCalculation = () => {
        let { quantity, price, discount } = productOutput;
        quantity = quantity === '' ? 0 : Number(quantity);
        price = price === '' ? 0 : Number(price);
        discount = discount === '' ? 0 : Number(discount);
        return (quantity * price) - discount;
    }

    const ivaCalculation = () => {
        const { percentage } = productOutput;
        if (productOutput.iva === 4 || productOutput.iva === 5) {
            return baseCalculation() * percentage / 100;
        }
        return 0;
    }

    return (
        <tr className="[&>td]:border [&>td]:border-[var(--border)] [&>td]:p-1.5">
            <td>
                <SelectProduct index={index} label={productOutput.name ?? ''} error={error?.product_id} selectProduct={selectProduct} />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', limitDecimals(e.target.value, 6))}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    step="0.000001"
                    className={`${inputBase} ${error?.quantity ? inputError : inputNormal}`}
                />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'price', limitDecimals(e.target.value, 6))}
                    value={productOutput.price ?? ''}
                    type="number"
                    step="0.000001"
                    className={`${inputBase} ${error?.price ? inputError : inputNormal}`}
                />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'discount', limitDecimals(e.target.value, 2))}
                    value={productOutput.discount ?? ''}
                    type="number"
                    step="0.01"
                    className={`${inputBase} ${error?.discount ? inputError : inputNormal}`}
                />
            </td>
            <td className="text-right">{baseCalculation().toFixed(2)}</td>
            <td className="text-right">{ivaCalculation().toFixed(2)}</td>
            <td className="text-right">
                <input
                    onChange={(e) => updateItem(index, 'total_iva', limitDecimals(e.target.value, 2))}
                    value={productOutput.total_iva ?? ''}
                    type="number"
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
                            className={`${inputBase} ${error?.ice ? inputError : inputNormal}`}
                        />
                    ) : null}
                </td>
                : null}
            <td className="w-1">
                <button onClick={() => removeItem(index)} className="flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600">
                    <FaTrash />
                </button>
            </td>
        </tr>
    )
}
