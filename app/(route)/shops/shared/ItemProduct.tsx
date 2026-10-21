import { IconButton, PresentationLabel, SelectProduct } from "@/components";
import { fields, ProductOutput, ProductPresentation, ProductProps } from "@/types";
import { limitDecimals } from "@/helpers/numberHelper";
import { useInventory } from "@/lib/hooks/useInventory";
import { DragHandle, useSortableItem } from "../../orders/shared/SortableItems";
import { cellInput, cellInputNormal, tableRow } from "../../orders/shared/FormSection";

interface ItemProductProps {
    index: number;
    productOutput: ProductOutput;
    updateItem: (index: number, field: fields, value: string | number) => void;
    selectProduct: (index: number, product: ProductProps, search?: string, presentation?: ProductPresentation | null) => void;
    deleteItem: (index: number) => void;
    sortable?: boolean;
    // Solo productos (los servicios no llevan inventario)
    onlyProducts?: boolean;
}

const inputBase = `${cellInput} ${cellInputNormal} text-right`;

export const ItemProduct = ({ index, productOutput, updateItem, selectProduct, deleteItem, sortable = false, onlyProducts = false }: ItemProductProps) => {
    const { setNodeRef, style, isDragging, handleProps } = useSortableItem(productOutput.id);
    // Presentaciones solo con inventario activo
    const { enabled: inventory } = useInventory();

    return (
        <tr ref={setNodeRef} style={style} className={`${tableRow} ${isDragging ? 'bg-surface shadow-md' : ''}`}>
            <td className="py-0.5! align-middle">
                {sortable && <DragHandle {...handleProps} label={`Mover línea ${index + 1}`} />}
            </td>
            <td>
                <SelectProduct index={index} label={productOutput.name} selectProduct={selectProduct} onlyProducts={onlyProducts} withPresentations={inventory} />
                {inventory && productOutput.product_id > 0 && (
                    <PresentationLabel
                        productId={productOutput.product_id}
                        presentations={productOutput.presentations}
                        value={productOutput.presentation_id}
                        conversionFactor={productOutput.conversion_factor}
                    />
                )}
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
