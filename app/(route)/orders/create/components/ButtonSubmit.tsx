"use client";

import { useCreateInvoice } from '../../context/InvoiceCreateContext';
import { invoiceSchema } from '@/schemas/invoice.schema';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useRouter } from 'next/navigation';
import { FaSave } from 'react-icons/fa';

export const ButtonSubmit = () => {

    const { invoice, selectPoint, productOutputs, aditionalInformation, setFormErrors } = useCreateInvoice();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // 1. Aquí puedes manejar el envío del formulario
        const form = {
            ...invoice,
            products:
                productOutputs.length > 0
                    ? productOutputs.filter((product: ProductOutput) => product.product_id !== 0)
                    : [],
            send: false,
            aditionals: aditionalInformation,
            point_id: selectPoint?.id,
        };

        // 1. llamar a schema de validación
        const parsed = invoiceSchema.safeParse(form);

        if (!parsed.success) {
            console.log('Validación error', parsed.error.errors);
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });
            setFormErrors(formatted);
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
