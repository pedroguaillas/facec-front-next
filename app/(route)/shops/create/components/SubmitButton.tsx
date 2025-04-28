import React, { useState } from 'react'
import { FaSave, FaSpinner } from 'react-icons/fa';
import { useCreateShop } from '../context/ShopCreateContext';
import { shopSchema } from '@/schemas/shop-schema';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useRouter } from 'next/navigation';

export const SubmitButton = () => {
    const [isPending, setIsPending] = useState(false);
    const { shop, setErrorShop, taxes } = useCreateShop();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        // 1. Creación del formulario
        const form = {
            ...shop,
            products: [],
            taxes,
            app_retention: true,
            send: false,
            // point_id: selectPoint?.id,
        };

        // 2. Validar el formulario
        const parsed = shopSchema.safeParse(form);

        if (!parsed.success) {
            console.log('Validación ', parsed.error)
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });

            setErrorShop(formatted);

            // 🔹 Errores dentro del array `aditionals`
            // const taxes: Record<string, Partial<Record<keyof Tax, string>>> = {};

            // parsed.error.errors.forEach((err) => {
            //     if (err.path[0] === 'taxes' && typeof err.path[1] === 'number') {
            //         const index = err.path[1]; // posición del item
            //         const field = err.path[2] as keyof Tax; // campo del producto
            //         const aditionalId = form.taxes[index]?.id;
            //         if (aditionalId) {
            //             if (!aditionalErrors[aditionalId]) aditionalErrors[aditionalId] = {};
            //             aditionalErrors[aditionalId][field] = err.message;
            //         }
            //     }
            // });

            // setE(aditionalErrors); // ← Necesitas este estado para manejar errores por producto

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
