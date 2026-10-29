'use client';

import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { useListProducts } from '../hooks/useListProducts';
import { ItemProduct } from './ItemProduct';
import { SortableItems } from '../../orders/shared/SortableItems';
import { AddRowButton, FormSection, tableHead } from '../../orders/shared/FormSection';
import { UnitPickerModal } from '../../orders/shared/UnitPickerModal';

export const ListProducts = () => {
	const { productOutputs, errorProductOutputs, errors } = useFormReferralGuide();
	const { addItem, updateItem, selectProduct, removeItem, moveItem, unitPicker, selectUnit, skipUnit, closeUnitPicker } = useListProducts();
	const ids = productOutputs.map(op => op.id);
	// Con una sola línea no hay nada que ordenar
	const sortable = productOutputs.length > 1;

	return (
		<FormSection
			title='Mercadería'
			aside={productOutputs.length > 0 ? <span className='text-xs text-ink-3 tabular-nums'>{productOutputs.length} {productOutputs.length === 1 ? 'línea' : 'líneas'}</span> : undefined}
		>
			<SortableItems ids={ids} onMove={moveItem}>
				<table className='w-full table-fixed text-sm'>
					<thead>
						<tr className={tableHead}>
							<th className='w-9'><span className='sr-only'>Orden</span></th>
							<th className='text-left'>Producto</th>
							<th className='w-24 sm:w-32 text-right'>Cantidad</th>
							<th className='w-11'><span className='sr-only'>Acciones</span></th>
						</tr>
					</thead>
					<tbody>
						{productOutputs.map((op, index) => (
							<ItemProduct
								key={op.id}
								index={index}
								productOutput={op}
								error={errorProductOutputs[op.id]}
								updateItem={updateItem}
								selectProduct={selectProduct}
								removeItem={removeItem}
								sortable={sortable}
							/>
						))}
					</tbody>
				</table>
			</SortableItems>

			{errors.products && <p className='mt-2 text-xs text-red-500'>{errors.products}</p>}

			<AddRowButton label='Agregar producto' onClick={addItem} />

			{unitPicker && (
				<UnitPickerModal
					product={unitPicker.product}
					excludeIds={productOutputs.filter((op, i) => i !== unitPicker.index && op.parent_product_id).map(op => op.product_id)}
					onSelect={selectUnit}
					onSkip={skipUnit}
					onClose={closeUnitPicker}
				/>
			)}
		</FormSection>
	);
};
