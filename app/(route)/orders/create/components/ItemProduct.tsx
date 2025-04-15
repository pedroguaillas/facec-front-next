import { SelectProduct } from "@/components";
import { FaTrash } from "react-icons/fa";
import { useCreateInvoice } from "../../context/InvoiceCreateContext";

interface Props {
    index: number;
    productOutput: ProductOutput;
    updateItem: (index: number, field: fields, value: number | string) => void;
    selectProduct: (index: number, product: ProductPaginate) => void;
    removeItem: (index: number) => void;
}

export const ItemProduct = ({ index, productOutput, updateItem, selectProduct, removeItem }: Props) => {

    const { isTaxBreakdown, isActiveIce } = useCreateInvoice();

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
        <tr className="[&>td]:border [&>td]:border-gray-300 [&>td]:dark:border-gray-600 [&>td]:p-1">
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    className="w-full"
                />
            </td>
            <td>
                <SelectProduct index={index} selectProduct={selectProduct} />
            </td>
            <td className={isTaxBreakdown ? 'text-right' : ''}>
                {/* TODO agregar la cantidad de decimales correspondientes */}
                {
                    isTaxBreakdown ? (
                        (+productOutput.price).toFixed(2)
                    ) :
                        (
                            <input
                                onChange={(e) => updateItem(index, 'price', e.target.value)}
                                value={productOutput.price ?? ''}
                                type="number"
                                className="w-full"
                            />
                        )
                }
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'discount', e.target.value)}
                    value={productOutput.discount ?? ''}
                    type="number"
                    className="w-full"
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
                            className="w-full"
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
                            className="w-full"
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
