'use client';

import { PrimaryButton } from '@/components';
import { ItemProduct } from './ItemProduct';
import { useReferralGuide } from '../context/ReferralGuideCreateContext';
import { useListProducts } from '../hooks/useListProducts';

export const ListProducts = () => {
	const { productOutputs, errorProductOutputs, errors } = useReferralGuide();
	const { addItem, updateItem, selectProduct, removeItem } = useListProducts();

	return (
		<>
			<div className='flex gap-16 my-4'>
				<span className='font-bold'>Productos</span>
			</div>

			<div className='w-full overflow-x-auto'>
				<table className='w-full'>
					<thead>
						<tr className='[&>th]:border [&>th]:border-gray-300 [&>th]:py-2 [&>th]:dark:border-gray-500'>
							<th className='w-20 sm:w-24'>Cantidad</th>
							<th>Nombre</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{productOutputs.map((op, index) => (
							<ItemProduct
								key={op.id}
								index={index}
								productOutput={op}
								error={errorProductOutputs[op.id]} // 🔴 pasamos errores por ID
								updateItem={updateItem}
								selectProduct={selectProduct}
								removeItem={removeItem}
							/>
						))}
					</tbody>
				</table>

				{errors && <p className='text-sm text-red-500'>{errors.products}</p>}
			</div>

			<div className='flex justify-end mt-2'>
				<div className='w-28'>
					<PrimaryButton onClick={addItem} label='Añadir' action='add' type='button' />
				</div>
			</div>
		</>
	);
};
