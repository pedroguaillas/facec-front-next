import { ProductOutput } from '@/types/order';
import { SelectProduct } from '@/components';
import { FaTrash } from 'react-icons/fa';
import { ProductProps } from '@/types';

interface Props {
	index: number;
	productOutput: ProductOutput;
	error?: Partial<Record<keyof ProductOutput, string>>;
	updateItem: (index: number, value: number | string) => void;
	selectProduct: (index: number, product: ProductProps) => void;
	removeItem: (index: number) => void;
}

export const ItemProduct = ({
	index,
	productOutput,
	error,
	updateItem,
	selectProduct,
	removeItem,
}: Props) => {
	return (
		<tr className='[&>td]:border [&>td]:border-gray-300 [&>td]:dark:border-gray-600 [&>td]:p-1'>
			<td>
				<input
					onChange={e => updateItem(index, e.target.value)}
					value={productOutput.quantity ?? ''}
					type='number'
					className={`w-full border px-1 rounded text-gray-600 dark:text-gray-300
                        ${
													error?.quantity
														? 'border-red-500'
														: 'border-gray-300 focus:border-blue-500'
												}`}
				/>
			</td>
			<td>
				<SelectProduct index={index} selectProduct={selectProduct} error={error?.product_id} />
			</td>

			<td className='w-1'>
				<button
					onClick={() => removeItem(index)}
					className='flex justify-center items-center text-red-500 cursor-pointer rounded p-1 hover:text-red-600'
				>
					<FaTrash />
				</button>
			</td>
		</tr>
	);
};
