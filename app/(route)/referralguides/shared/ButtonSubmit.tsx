'use client';

import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { referralGuideSchema } from '@/schemas/referral-guide.schema';
import { PrimaryButton } from '@/components';
import { ProductOutput } from '@/types';

export const ButtonSubmit = () => {
	const { referralGuide, productOutputs, setErrors, setErrorProductOutputs } = useFormReferralGuide();

	const handleSubmit = () => {
		// 1. Creación del formulario
		const form = {
			...referralGuide,
			products: productOutputs,
			send: true,
		};

		// 2. Validar formulario
		const parsed = referralGuideSchema.safeParse(form);

		if (!parsed.success) {
			console.log('Validacion ', parsed.error);
			const formatted: Record<string, string> = {};
			parsed.error.errors.forEach(err => {
				formatted[err.path[0] as string] = err.message;
			});
			setErrors(formatted);

			// 🔹 Errores dentro del array `products`
			const errorProducts: Record<string, Partial<Record<keyof ProductOutput, string>>> = {};

			parsed.error.errors.forEach(err => {
				if (err.path[0] === 'products' && typeof err.path[1] === 'number') {
					const index = err.path[1]; // posición del item
					const field = err.path[2] as keyof ProductOutput;
					const productId = form.products[index]?.id;
					if (productId) {
						if (!errorProducts[productId]) errorProducts[productId] = {};
						errorProducts[productId][field] = err.message;
					}
				}
			});

			setErrorProductOutputs(errorProducts);
			return;
		}

		// 3. Enviar formulario
		const dataToSend = parsed.data;
		console.log({ dataToSend });
	};
	return (
		<div className='flex justify-end mt-4'>
			<div>
				<PrimaryButton
					type='submit'
					label='Guardar y procesar'
					action='store'
					onClick={handleSubmit}
				/>
			</div>
		</div>
	);
};
