import { ProductOutput } from '@/types/order';
import { IconButton, SelectProduct } from '@/components';
import { ProductProps } from '@/types';
import { limitDecimals } from '@/helpers/numberHelper';
import { DragHandle, useSortableItem } from '../../orders/shared/SortableItems';
import { cellInput, cellInputError, cellInputNormal, tableRow } from '../../orders/shared/FormSection';
import { characteristicsText } from '@/helpers/productTemplateHelper';
import { isUnitLine } from "@/helpers/productTemplateHelper";

interface Props {
	index: number;
	productOutput: ProductOutput;
	error?: Partial<Record<keyof ProductOutput, string>>;
	updateItem: (index: number, value: number | string) => void;
	selectProduct: (index: number, product: ProductProps) => void;
	removeItem: (index: number) => void;
	sortable?: boolean;
}

export const ItemProduct = ({ index, productOutput, error, updateItem, selectProduct, removeItem, sortable = false }: Props) => {
	const { setNodeRef, style, isDragging, handleProps } = useSortableItem(productOutput.id);
	const isUnit = isUnitLine(productOutput);
	const unitText = isUnit ? characteristicsText(productOutput.characteristics) : '';
	const unitCode = productOutput.product_code ?? productOutput.code;

	return (
		<tr ref={setNodeRef} style={style} className={`${tableRow} ${isDragging ? 'bg-surface shadow-md' : ''}`}>
			<td className='py-0.5! align-middle'>
				{sortable && <DragHandle {...handleProps} label={`Mover línea ${index + 1}`} />}
			</td>
			<td>
				<SelectProduct index={index} label={productOutput.name} selectProduct={selectProduct} error={error?.product_id} onlyProducts />
				{unitText && <p className='mt-1 text-xs text-ink-3'>{unitCode ? `${unitCode} · ` : ''}{unitText}</p>}
			</td>
			<td>
				<input
					aria-label={`Cantidad línea ${index + 1}`}
					onChange={e => updateItem(index, limitDecimals(e.target.value, 6))}
					value={productOutput.quantity ?? ''}
					type='text'
					inputMode='decimal'
					min='0'
					readOnly={isUnit}
					title={isUnit ? 'Cada unidad va en su propia línea' : undefined}
					className={`${cellInput} text-right ${error?.quantity ? cellInputError : cellInputNormal} ${isUnit ? 'opacity-60' : ''}`}
				/>
				{error?.quantity && <p className='mt-1 text-xs text-red-500'>{error.quantity}</p>}
			</td>
			<td className='w-1 py-0.5!'>
				<IconButton action='delete' type='button' onClick={() => removeItem(index)} title='Eliminar línea' />
			</td>
		</tr>
	);
};
