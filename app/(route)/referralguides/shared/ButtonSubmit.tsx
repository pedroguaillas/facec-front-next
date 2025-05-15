'use client';

import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { referralGuideSchema } from '@/schemas/referral-guide.schema';
import { useParams, useRouter } from 'next/navigation';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { PrimaryButton } from '@/components';
import { ProductOutput } from '@/types';
import { useState } from 'react';

export const ButtonSubmit = () => {
	const { referralGuide, productOutputs, selectPoint, setErrors, setErrorProductOutputs } = useFormReferralGuide();
	const axiosAuth = useAxiosAuth();
	const router = useRouter();
	const params = useParams();
	const [isSaving, setIsSaving] = useState(false);
	
	const handleSubmit = async () => {
		// 1. Creación del formulario
		const form = {
			...referralGuide,
			products: productOutputs,
			point_id: selectPoint?.id,
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
		try {
			setIsSaving(true);
			if (typeof params?.id === 'string') {
				const res = await axiosAuth.put(`/referralguides/${params.id}`, parsed.data)
				if (res.status === 200) {
					router.push(`/referralguides`);
				}
			} else {
				const res = await axiosAuth.post('/referralguides', form)
				if (res.status === 200) {
					router.push(`/referralguides`);
				}
			}
		} catch (error) {
			console.log('Error al guardar el formulario', error);
			setIsSaving(false);
		}
	};
	return (
		<div className='flex justify-end mt-4'>
			<div>
				<PrimaryButton
					type='submit'
					label='Guardar y procesar'
					action='store'
					onClick={handleSubmit}
					isLoading={isSaving}
				/>
			</div>
		</div>
	);
};
