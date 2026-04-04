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

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors border-[var(--border-strong)]";

export const ItemProduct = ({ index, productOutput, updateItem, selectProduct, deleteItem }: ItemProductProps) => {
    return (
        <tr className="[&>td]:border [&>td]:border-[var(--border)] [&>td]:p-1.5">
            <td>
                <input
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    className={inputBase}
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
                    className={inputBase}
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
