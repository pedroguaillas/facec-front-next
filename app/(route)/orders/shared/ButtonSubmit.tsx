"use client";

import { AditionalInformation, ProductOutput } from '@/types/order';
import { useFormInvoice } from '../context/FormInvoiceContext';
import { invoiceSchema } from '@/schemas/invoice.schema';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { useRouter, useParams } from 'next/navigation';
import { FaRegSave, FaSave, FaSpinner } from 'react-icons/fa';
import { useState } from 'react';
import { Repayment } from '@/types';
import { invoiceStoreServices, invoiceUpdateServices } from '../services/invoiceServices';

export const ButtonSubmit = () => {

    const { invoice, selectPoint, productOutputs, aditionalInformation, repayments, setFormErrors, setErrorProductOutputs, setErrorRepayments, setErrorAditionalInformation } = useFormInvoice();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const params = useParams();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, send: boolean) => {
        e.preventDefault();

        // 1. Creación del formulario
        const form = {
            ...invoice,
            products: productOutputs,
            send: send,
            aditionals: aditionalInformation.map(aditional => ({
                id: aditional.id,
                name: aditional.name.trim(),
                description: aditional.description.trim(),
            })),
            point_id: selectPoint?.id,
            repayments
        };

        if (Number(form.voucher_type) === 4 && form.reason) {
            form.reason = form.reason.trim();
        }

        // 2. Validar el formulario
        const parsed = invoiceSchema.safeParse(form);

        if (!parsed.success) {
            console.log('Validación ', parsed.error)
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
                    const productId = form.products[index]?.id;
                    if (productId) {
                        if (!productErrors[productId]) productErrors[productId] = {};
                        productErrors[productId][field] = err.message;
                    }
                }
            });

            setErrorProductOutputs(productErrors); // ← Necesitas este estado para manejar errores por producto

            // 🔹 Errores dentro del array `repaymentErrors`
            const repaymentErrors: Record<string, Partial<Record<keyof Repayment, string>>> = {};

            parsed.error.errors.forEach((err) => {
                if (err.path[0] === 'repayments' && typeof err.path[1] === 'number') {
                    const index = err.path[1]; // posición del item
                    const field = err.path[2] as keyof Repayment; // campo del producto
                    const repaymentId = form.repayments[index]?.id;
                    if (repaymentId) {
                        if (!repaymentErrors[repaymentId]) repaymentErrors[repaymentId] = {};
                        repaymentErrors[repaymentId][field] = err.message;
                    }
                }
            });

            setErrorRepayments(repaymentErrors);

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

        // 3. Enviar el formulario
        setIsPending(true);

        const {data, error} = await (params.id ? invoiceUpdateServices(axiosAuth, params.id.toString(), form) : invoiceStoreServices(axiosAuth, form));
        if(data) {
            router.push(`/orders`);
        }else if(error) {
            console.error('Error al enviar el formulario:', error);
            setIsPending(false);
            // Aquí podrías mostrar un mensaje de error al usuario si lo deseas
        }
    };

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
