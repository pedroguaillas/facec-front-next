"use client";

import { useProductCreateContext } from '../../context/ProductCreateContext';
import { productSchema } from '@/schemas/product.schema';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaSave } from 'react-icons/fa';

export const ButtonSubmit = () => {

    const { product, setErrorProduct } = useProductCreateContext();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();

    const handleSubmit = () => {
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
            axiosAuth
                .post('product', form)
                .then(() => {
                    router.push('/products');
                });
        } catch (error) {
            console.log('Error al guardar el formulario' + error);
        }
    }

    return (
        <>
            <div className='flex justify-end'>
                <button
                    onClick={handleSubmit}
                    type='submit'
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2'
                >
                    <FaSave />
                    Guardar
                </button>
            </div>
        </>
    )
}
