"use client";

import { useProductCreateContext } from '../context/ProductFormContext';
import { productSchema } from '@/schemas/product.schema';
import { useRouter, useParams } from 'next/navigation';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { PrimaryButton } from '@/components';
import { useState } from 'react';
import { productStoreService, productUpdateService } from '../services/productServices';

export const ButtonSubmit = () => {

    const { product, setErrorProduct } = useProductCreateContext();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const params = useParams();

    const handleSubmit = async () => {
        // 1. Crear el formulario
        const form = { ...product };

        // 2. Validar el formulario
        const parsed = productSchema.safeParse(form);
        if (!parsed.success) {
            console.log('Validación', parsed.error.errors);
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });
            setErrorProduct(formatted);
            return;
        }

        // 3. Enviar el formulario
        setIsPending(true);

        let response = undefined;

        if (params?.id) {
            response = await productUpdateService(Number(params.id), axiosAuth, form);
        } else {
            response = await productStoreService(axiosAuth, form);
        }

        const { message, data, errors } = response;

        if (data) {
            router.push('/products');
        } else if (errors) {
            setErrorProduct(errors);
        } else {
            console.log(message);
        }
        setIsPending(false);
    }

    return (
        <div className='flex justify-end'>
            <div className='w-28'>
                <PrimaryButton label='Guardar' type='button' action='store' isLoading={isPending} onClick={handleSubmit} />
            </div>
        </div>
    )
}
