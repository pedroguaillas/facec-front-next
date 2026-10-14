import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { productOutputSchema } from '@/schemas/referral-guide.schema';
import { initialProductItem } from '@/constants/initialValues';
import { ProductProps } from '@/types';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';

export const useListProducts = () => {
	const { setProductOutputs, setErrorProductOutputs } = useFormReferralGuide();

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
				name: product.atts.name,
			};
			// Limpia el error "Seleccione un producto" de esa línea
			const id = newState[index].id;
			setErrorProductOutputs(prev => ({ ...prev, [id]: { ...prev[id], product_id: '' } }));
			return newState;
		});
	};

	const removeItem = (index: number) => {
		setProductOutputs(prevState => prevState.filter((_, i) => i !== index));
	};

	// Reordenar líneas (arrastrar): solo cambia el orden en el comprobante
	const moveItem = (activeId: string, overId: string) => {
		setProductOutputs(prev => {
			const from = prev.findIndex(item => item.id === activeId);
			const to = prev.findIndex(item => item.id === overId);
			return from < 0 || to < 0 ? prev : arrayMove(prev, from, to);
		});
	};

	return {
		addItem,
		updateItem,
		selectProduct,
		removeItem,
		moveItem,
	};
};
