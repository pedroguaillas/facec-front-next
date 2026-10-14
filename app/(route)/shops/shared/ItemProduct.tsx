import { IconButton, SelectProduct } from "@/components";
import { fields, ProductOutput, ProductProps } from "@/types";
import { limitDecimals } from "@/helpers/numberHelper";
import { DragHandle, useSortableItem } from "../../orders/shared/SortableItems";
import { cellInput, cellInputNormal, tableRow } from "../../orders/shared/FormSection";

interface ItemProductProps {
    index: number;
    productOutput: ProductOutput;
    updateItem: (index: number, field: fields, value: string | number) => void;
    selectProduct: (index: number, product: ProductProps) => void;
    deleteItem: (index: number) => void;
    sortable?: boolean;
}

const inputBase = `${cellInput} ${cellInputNormal} text-right`;

export const ItemProduct = ({ index, productOutput, updateItem, selectProduct, deleteItem, sortable = false }: ItemProductProps) => {
    const { setNodeRef, style, isDragging, handleProps } = useSortableItem(productOutput.id);

    return (
        <tr ref={setNodeRef} style={style} className={`${tableRow} ${isDragging ? 'bg-surface shadow-md' : ''}`}>
            <td className="py-0.5! align-middle">
                {sortable && <DragHandle {...handleProps} label={`Mover línea ${index + 1}`} />}
            </td>
            <td>
                <SelectProduct index={index} label={productOutput.name} selectProduct={selectProduct} />
            </td>
            <td>
                <input
                    aria-label={`Cantidad línea ${index + 1}`}
                    onChange={(e) => updateItem(index, 'quantity', limitDecimals(e.target.value, 6))}
                    value={productOutput.quantity ?? ''}
                    type="number"
                    inputMode="decimal"
                    className={inputBase}
                />
            </td>
            <td>
                <input
                    aria-label={`Precio línea ${index + 1}`}
                    onChange={(e) => updateItem(index, 'price', limitDecimals(e.target.value, 6))}
                    value={productOutput.price ?? ''}
                    type="number"
                    inputMode="decimal"
                    className={inputBase}
                />
            </td>
            <td className="text-right tabular-nums text-ink-1 pt-3.5!">{Number(productOutput.total_iva ?? 0).toFixed(2)}</td>
            <td className="w-1 py-0.5!">
                <IconButton action="delete" type="button" onClick={() => deleteItem(index)} title="Eliminar línea" />
            </td>
        </tr>
    );
};
