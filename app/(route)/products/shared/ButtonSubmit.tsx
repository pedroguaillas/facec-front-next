"use client";

import { useProductCreateContext } from '../context/ProductFormContext';
import { productSchema } from '@/schemas/product.schema';
import { useRouter, useParams } from 'next/navigation';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { PrimaryButton } from '@/components';
import { useState } from 'react';

export const ButtonSubmit = () => {

    const { product, setErrorProduct } = useProductCreateContext();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const params = useParams();

    const handleSubmit = async () => {
        // 1. Crear el formulario
        const form = {
            ...product,
        };

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
        try {
            setIsPending(true);
            if (params?.id) {
                await axiosAuth.put(`product/${params.id}`, form);
            } else {
                await axiosAuth.post('product', form);
            }
            router.push('/products');
        } catch (error) {
            setIsPending(false);
            console.log('Error al guardar el formulario' + error);
        }
    }

    return (
        <div className='flex justify-end'>
            <div className='w-28'>
                <PrimaryButton label='Guardar' type='button' action='store' isLoading={isPending} onClick={handleSubmit} />
            </div>
        </div>
    )
}
