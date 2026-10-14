'use client';

import { useFormReferralGuide } from '../context/FormReferralGuideContext';
import { referralGuideSchema } from '@/schemas/referral-guide.schema';
import { useParams, useRouter } from 'next/navigation';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa6';
import { useToast } from '@/context/ToastContext';
import { ProductOutput } from '@/types';
import { useState } from 'react';
import { referralGuideStoreServices, referralGuideUpdateServices } from '../services/referralGuidesServices';

export const ButtonSubmit = () => {
	const { referralGuide, productOutputs, selectPoint, setErrors, setErrorProductOutputs } = useFormReferralGuide();
	const axiosAuth = useAxiosAuth();
	const router = useRouter();
	const params = useParams();
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

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
			toast(Object.values(formatted)[0] ?? 'Revisa los campos marcados', 'error');
			return;
		}

		// 3. Enviar formulario
		setIsSaving(true);
		const { data, error, errors } = await (
			params?.id
				? referralGuideUpdateServices(axiosAuth, params.id.toString(), parsed.data)
				: referralGuideStoreServices(axiosAuth, form)
		);

		if (data) {
			toast(params?.id ? 'Guía actualizada y enviada a procesar' : 'Guía guardada y enviada a procesar');
			router.push(`/referralguides`);
			return;
		}
		setIsSaving(false);
		if (errors) {
			setErrors(errors);
			toast(Object.values(errors)[0] ?? 'Revisa los datos del formulario', 'error');
		} else {
			toast(error ?? 'No se pudo guardar la guía', 'error');
		}
	};

	return (
		<div className='flex justify-end pt-5'>
			<button
				type='button'
				onClick={handleSubmit}
				disabled={isSaving}
				className='inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white transition-colors cursor-pointer hover:bg-primaryhover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed'
			>
				{isSaving ? <FaSpinner className='animate-spin' aria-hidden='true' /> : <FaPaperPlane aria-hidden='true' />}
				{isSaving ? 'Procesando…' : 'Guardar y procesar'}
			</button>
		</div>
	);
};
