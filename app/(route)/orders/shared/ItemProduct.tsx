import { fields, ProductOutput } from "@/types/order";
import { SelectProduct } from "@/components";
import { FaTrash } from "react-icons/fa";
import { ProductProps } from "@/types";
import { useFormInvoice } from "../context/FormInvoiceContext";

interface Props {
    index: number;
    productOutput: ProductOutput;
    error?: Partial<Record<keyof ProductOutput, string>>;
    updateItem: (index: number, field: fields, value: number | string) => void;
    selectProduct: (index: number, product: ProductProps) => void;
    removeItem: (index: number) => void;
}

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const inputError = "border-red-400";
const inputNormal = "border-[var(--border-strong)]";

export const ItemProduct = ({ index, productOutput, error, updateItem, selectProduct, removeItem }: Props) => {

    const { isTaxBreakdown, isActiveIce } = useFormInvoice();

    const ivaCalculation = () => {
        let { quantity, price, discount } = productOutput;
        const { percentage } = productOutput;
        quantity = quantity === '' ? 0 : Number(quantity);
        price = price === '' ? 0 : Number(price);
        discount = discount === '' ? 0 : Number(discount);
        if (productOutput.iva === 4 || productOutput.iva === 5) {
            return (quantity * price - discount) * percentage / 100;
        }
        return 0;
    }

    return (
        <tr className="[&>td]:border [&>td]:border-[var(--border)] [&>td]:p-1.5">
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    className={`${inputBase} ${error?.quantity ? inputError : inputNormal}`}
                />
            </td>
            <td>
                <SelectProduct index={index} label={productOutput.name ?? ''} error={error?.product_id} selectProduct={selectProduct} />
            </td>
            <td className={isTaxBreakdown ? 'text-right' : ''}>
                {
                    isTaxBreakdown ? (
                        (+productOutput.price).toFixed(2)
                    ) :
                        (
                            <input
                                onChange={(e) => updateItem(index, 'price', e.target.value)}
                                value={productOutput.price ?? ''}
                                type="number"
                                className={`${inputBase} ${error?.price ? inputError : inputNormal}`}
                            />
                        )
                }
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'discount', e.target.value)}
                    value={productOutput.discount ?? ''}
                    type="number"
                    className={`${inputBase} ${error?.discount ? inputError : inputNormal}`}
                />
            </td>
            {isTaxBreakdown ? <td className="text-right">{ivaCalculation().toFixed(2)}</td> : ''}
            <td className="text-right">
                {
                    isTaxBreakdown ? (
                        <input
                            onChange={(e) => updateItem(index, 'total_iva', e.target.value)}
                            value={productOutput.total_iva ?? ''}
                            type="number"
                            className={`${inputBase} ${error?.total_iva ? inputError : inputNormal}`}
                        />
                    ) :
                        (productOutput.total_iva ?? '0.00')
                }
            </td>
            {isActiveIce ?
                <td>
                    {productOutput.ice !== undefined ? (
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
