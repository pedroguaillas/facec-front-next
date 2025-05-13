"use client";

import React, { useState } from 'react'
import { FaSave, FaSpinner } from 'react-icons/fa';
import { useCreateShop } from '../context/ShopCreateContext';
import { shopSchema } from '@/schemas/shop-schema';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useRouter } from 'next/navigation';
import { Tax } from '@/types';

export const SubmitButton = () => {
    const [isPending, setIsPending] = useState(false);
    const { applieWithholding, shop, productOutputs, taxes, selectPoint, setErrorShop, setErrorTaxes } = useCreateShop();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        // 1. Creación del formulario
        const form = {
            ...shop,
            products: productOutputs,
            taxes,
            state_retencion: 'CREADO',
            app_retention: applieWithholding,
            send: true,
            point_id: selectPoint?.id,
        };

        if (!applieWithholding) {
            delete form.serie_retencion;
            form.taxes = [];
        }

        // 2. Validar el formulario
        console.log(form)
        const parsed = shopSchema.safeParse(form);

        if (!parsed.success) {
            console.log('Validación ', parsed.error)
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });

            setErrorShop(formatted);

            // 🔹 Errores dentro del array `taxes`
            const errorTaxes: Record<string, Partial<Record<keyof Tax, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'taxes' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof Tax; // campo del tax
                    const taxId = form.taxes[index]?.id;
                    if (taxId) {
                        if (!errorTaxes[taxId]) errorTaxes[taxId] = {};
                        errorTaxes[taxId][field] = err.message;
                    }
                }
            });

            setErrorTaxes(errorTaxes); // ← Necesitas este estado para manejar errores por producto

            return;
        }

        // 3. Enviar el formulario
        try {
            setIsPending(true);
            await axiosAuth.post('shops', form);
            router.push('/shops');
        } catch (error) {
            console.log('Error al guardar el formulario' + error);
        }
    };

    return (
        <button
            onClick={handleSubmit}
            disabled={isPending}
            className="btn btn-primary flex items-center gap-2 bg-primary disabled:bg-primaryhover hover:bg-primary-focus text-white p-2 rounded-md cursor-pointer">
            {isPending && (
                <FaSpinner className='animate-spin' />
            )}
            {!isPending && (
                <FaSave />
            )}
            Guardar y procesar
        </button>
    )
}
