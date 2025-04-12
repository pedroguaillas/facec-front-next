import { SelectProduct } from "@/components";
import { FaTrash } from "react-icons/fa";

interface Props {
    index: number;
    productOutput: ProductOutput;
    updateItem: (index: number, field: "quantity" | "price" | "discount", value: number | string) => void;
    selectProduct: (index: number, product: ProductPaginate) => void;
    removeItem: (index: number) => void;
}

export const ItemProduct = ({ index, productOutput, updateItem, selectProduct, removeItem }: Props) => {

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
                <button onClick={() => removeItem(index)} className="flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600">
                    <FaTrash />
                </button>
            </td>
        </tr>
    )
}
