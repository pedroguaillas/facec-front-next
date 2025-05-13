import { nanoid } from 'nanoid';
import { ProductProps } from '@/types';
import { useReferralGuide } from '../context/ReferralGuideCreateContext';
import { initialProductItem } from '@/constants/initialValues';
import { productOutputSchema } from '@/schemas/referral-guide.schema';

export const useListProducts = () => {
	const { setProductOutputs, setErrorProductOutputs } = useReferralGuide();

	const addItem = () => {
		setProductOutputs(prevState => [...prevState, { ...initialProductItem, id: nanoid() }]);
	};

	const updateItem = (index: number, value: number | string) => {
		if (value && Number(value) < 0) return;

		setProductOutputs(prevState => {
			const newState = [...prevState];
			newState[index] = {
				...newState[index],
				quantity: value,
			};

			// Validar ese campo
			const validation = productOutputSchema.safeParse(newState[index]);

			if (!validation.success) {
				const fieldError = validation.error.flatten().fieldErrors;
				setErrorProductOutputs(prev => ({
					...prev,
					[newState[index].id]: {
						...prev[newState[index].id],
						quantity: fieldError.quantity?.[0] || '',
					},
				}));
			} else {
				// Si está correcto, limpiar error de ese campo
				setErrorProductOutputs(prev => ({
					...prev,
					[newState[index].id]: {
						...prev[newState[index].id],
						quantity: '',
					},
				}));
			}

			return newState;
		});
	};

	const selectProduct = (index: number, product: ProductProps) => {
		setProductOutputs(prevState => {
			const newState = [...prevState];
			newState[index] = {
				...newState[index],
				product_id: product.id,
			};
			return newState;
		});
	};

	const removeItem = (index: number) => {
		setProductOutputs(prevState => prevState.filter((_, i) => i !== index));
	};

	return {
		addItem,
		updateItem,
		selectProduct,
		removeItem,
	};
};
