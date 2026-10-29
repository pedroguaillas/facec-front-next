import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { productOutputSchema } from '@/schemas/referral-guide.schema';
import { initialProductItem } from '@/constants/initialValues';
import { ProductProps, ProductUnit } from '@/types';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useProductTemplates } from '@/lib/hooks/useProductTemplates';
import { requiresUnit } from '@/helpers/productTemplateHelper';
import { isUnitLine } from "@/helpers/productTemplateHelper";

export const useListProducts = () => {
	const { productOutputs, setProductOutputs, setErrorProductOutputs } = useFormReferralGuide();
	const templates = useProductTemplates();
	// Modelo con campos por unidad: se elige la unidad para que el chasis salga en el XML/PDF
	const [unitPicker, setUnitPicker] = useState<{ index: number; product: ProductProps } | null>(null);

	const addItem = () => {
		setProductOutputs(prevState => [...prevState, { ...initialProductItem, id: nanoid() }]);
	};

	const updateItem = (index: number, value: number | string) => {
		if (value && Number(value) < 0) return;
		// Una unidad (ej. una moto) va con cantidad 1
		if (isUnitLine(productOutputs[index])) return;

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

	const selectProduct = (index: number, product: ProductProps, askUnit = true) => {
		if (askUnit && !product.parent_product_id && product.product_template_id
			&& requiresUnit(templates.find(t => t.id === product.product_template_id))) {
			setUnitPicker({ index, product });
			return;
		}
		const isUnit = !!product.parent_product_id;
		setProductOutputs(prevState => {
			const newState = [...prevState];
			newState[index] = {
				...newState[index],
				product_id: product.id,
				name: product.atts.name,
				product_code: product.atts.code,
				parent_product_id: product.parent_product_id ?? null,
				characteristics: product.characteristics ?? [],
				...(isUnit && { quantity: 1 }),
			};
			// Limpia el error "Seleccione un producto" de esa línea
			const id = newState[index].id;
			setErrorProductOutputs(prev => ({ ...prev, [id]: { ...prev[id], product_id: '' } }));
			return newState;
		});
	};

	const selectUnit = (unit: ProductUnit) => {
		if (!unitPicker) return;
		const { index, product } = unitPicker;
		setUnitPicker(null);
		selectProduct(index, {
			...product,
			id: unit.id,
			atts: { ...product.atts, code: unit.code, name: unit.name || product.atts.name },
			parent_product_id: unit.parent_product_id,
			characteristics: unit.characteristics,
		});
	};

	// La guía no exige la unidad: con el modelo salen solo sus características (Marca, Año)
	const skipUnit = () => {
		if (!unitPicker) return;
		const { index, product } = unitPicker;
		setUnitPicker(null);
		selectProduct(index, product, false);
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
		unitPicker,
		selectUnit,
		skipUnit,
		closeUnitPicker: () => setUnitPicker(null),
	};
};
