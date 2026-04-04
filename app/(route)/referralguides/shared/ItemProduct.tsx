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

const inputBase = "w-full border rounded-md px-2 py-1.5 text-sm bg-[var(--background)] dark:text-gray-300 focus:outline-none focus:border-primary transition-colors";
const inputError = "border-red-400";
const inputNormal = "border-[var(--border-strong)]";

export const ItemProduct = ({
	index,
	productOutput,
	error,
	updateItem,
	selectProduct,
	removeItem,
}: Props) => {
	return (
		<tr className='[&>td]:border [&>td]:border-[var(--border)] [&>td]:p-1.5'>
			<td>
				<input
					onChange={e => updateItem(index, e.target.value)}
					value={productOutput.quantity ?? ''}
					type='number'
					className={`${inputBase} ${error?.quantity ? inputError : inputNormal}`}
				/>
			</td>
			<td>
				<SelectProduct index={index} label={productOutput.name} selectProduct={selectProduct} error={error?.product_id} />
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
