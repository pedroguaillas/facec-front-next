import { SelectProduct } from "@/components";
import { fields, ProductOutput, ProductProps } from "@/types";
import { FaTrash } from "react-icons/fa";

interface ItemProductProps {
    index: number;
    productOutput: ProductOutput;
    updateItem: (index: number, field: fields, value: string | number) => void;
    selectProduct: (index: number, product: ProductProps) => void;
    deleteItem: (index: number) => void;
}

export const ItemProduct = ({ index, productOutput, updateItem, selectProduct, deleteItem }: ItemProductProps) => {
    return (
        <tr className="[&>td]:border [&>td]:border-gray-300 [&>td]:dark:border-gray-600 [&>td]:p-1">
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    className="w-full border px-1 rounded text-gray-600 dark:text-gray-300"
                />
            </td>
            <td>
                <SelectProduct index={index} label={productOutput.name} selectProduct={selectProduct} />
            </td>
            <td>
                <input
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    value={productOutput.price ?? ''}
                    type="number"
                    className="w-full border px-1 rounded text-gray-600 dark:text-gray-300"
                />
            </td>
            <td className="text-right">
                {productOutput.total_iva ?? '0.00'}
            </td>
            <td>
                <button className="text-red-500" onClick={() => deleteItem(index)}>
                    <FaTrash />
                </button>
            </td>
        </tr>
    );
};

