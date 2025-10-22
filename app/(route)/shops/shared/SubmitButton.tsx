"use client";

import { useFormShop } from '../context/FormShopContext';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { FaRegSave, FaSave, FaSpinner } from 'react-icons/fa';
import { shopSchema } from '@/schemas/shop-schema';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Tax } from '@/types';
import { shopStoreService, shopUpdateService } from '../services/shopsServices';

export const SubmitButton = () => {
    const [isPending, setIsPending] = useState(false);
    const { applieWithholding, shop, productOutputs, taxes, selectPoint, setErrorShop, setErrorTaxes } = useFormShop();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const params = useParams();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, send: boolean) => {
        e.preventDefault();

        // 1. Creación del formulario
        const form = {
            ...shop,
            products: productOutputs,
            taxes,
            app_retention: applieWithholding,
            send: send,
            point_id: selectPoint?.id,
        };

        if (!applieWithholding) {
            delete form.serie_retencion;
            delete form.date_retention;
            form.taxes = [];
        }

        // 2. Validar el formulario
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
        setIsPending(true);

        let response = undefined;

        if (params?.id) {
            response = await shopUpdateService(Number(params.id), axiosAuth, form);
        } else {
            response = await shopStoreService(axiosAuth, form);
        }

        const { message, data, errors } = response;

        if (data) {
            router.push('/shops');
        } else if (errors) {
            setErrorShop(errors);
        } else {
            alert(message);
        }
        setIsPending(false);
    };

    if (params?.id && shop.state_retencion === 'AUTORIZADO') {
        return null;
    }

    return (
        <div className='flex justify-end mt-4 gap-2'>
            <button
                onClick={(e) => handleSubmit(e, false)}
                disabled={isPending}
                className="btn btn-primary flex items-center gap-2 bg-primary disabled:bg-primaryhover hover:bg-primary-focus text-white p-2 rounded-md cursor-pointer">
                <FaRegSave />
                Guardar
            </button>
            <button
                onClick={(e) => handleSubmit(e, true)}
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
        </div>
    )
}