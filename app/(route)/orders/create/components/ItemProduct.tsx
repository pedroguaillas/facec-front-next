import { SelectProduct } from "@/components";
import { FaTrash } from "react-icons/fa";

interface Props {
    index: number;
    productOutput: ProductOutput;
    updateItem: (index: number, field: "quantity" | "price" | "discount", value: number | string) => void;
    removeItem: (index: number) => void;
}

export const ItemProduct = ({ index, productOutput, updateItem, removeItem }: Props) => {
    return (
        <tr className="[&>td]:border [&>td]:border-gray-300 [&>td]:dark:border-gray-600">
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    className="w-full"
                />
            </td>
            <td>
                <SelectProduct label="Producto" />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    value={productOutput.price ?? ''}
                    type="number"
                    className="w-full"
                />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'discount', e.target.value)}
                    value={productOutput.discount ?? ''}
                    type="number"
                    className="w-full"
                />
            </td>
            <td>{productOutput.total_iva}</td>
            <td className="w-1">
                <button onClick={() => removeItem(index)} className="flex justify-end items-center text-red-500 cursor-pointer">
                    <FaTrash />
                </button>
            </td>
        </tr>
    )
}
