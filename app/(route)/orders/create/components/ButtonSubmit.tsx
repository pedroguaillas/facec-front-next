"use client";

import { useCreateInvoice } from '../../context/InvoiceCreateContext';
import { invoiceSchema } from '@/schemas/invoice.schema';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useRouter } from 'next/navigation';
import { FaSave } from 'react-icons/fa';

export const ButtonSubmit = () => {

    const { invoice, selectPoint, productOutputs, aditionalInformation, setFormErrors, setErrorProductOutputs, setErrorAditionalInformation } = useCreateInvoice();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // 1. Aquí puedes manejar el envío del formulario
        const form = {
            ...invoice,
            products: productOutputs,
            send: false,
            aditionals: aditionalInformation,
            point_id: selectPoint?.id,
        };

        // 1. llamar a schema de validación
        const parsed = invoiceSchema.safeParse(form);

        if (!parsed.success) {
            console.log('Validación order', parsed.error.errors);
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });
            setFormErrors(formatted);

            // 🔹 Errores dentro del array `products`
            const productErrors: Record<string, Partial<Record<keyof ProductOutput, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'products' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof ProductOutput; // campo del producto
                    // if (!productErrors[index]) productErrors[index] = {};
                    // productErrors[index][field] = err.message;
                    const productId = form.products[index]?.id;
                    if (productId) {
                        if (!productErrors[productId]) productErrors[productId] = {};
                        productErrors[productId][field] = err.message;
                    }
                }
            });

            setErrorProductOutputs(productErrors); // ← Necesitas este estado para manejar errores por producto

            // 🔹 Errores dentro del array `aditionals`
            const aditionalErrors: Record<string, Partial<Record<keyof AditionalInformation, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'aditionals' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof AditionalInformation; // campo del producto
                    const aditionalId = form.aditionals[index]?.id;
                    if (aditionalId) {
                        if (!aditionalErrors[aditionalId]) aditionalErrors[aditionalId] = {};
                        aditionalErrors[aditionalId][field] = err.message;
                    }
                }
            });

            setErrorAditionalInformation(aditionalErrors); // ← Necesitas este estado para manejar errores por producto

            return;
        }

        try {
            axiosAuth
                .post('orders', form)
                .then(() => {
                    router.push('/orders');
                });
        } catch (error) {
            console.log('Error al guardar el formulario' + error);
        }
    };

    return (
        <div className='flex justify-end mt-4'>
            <button onClick={handleSubmit} id='btn-save' className="btn btn-primary flex items-center gap-2 bg-primary hover:bg-primary-focus text-white p-2 rounded-md cursor-pointer">
                <FaSave /> Guardar y procesar
            </button>
        </div>
    )
}
