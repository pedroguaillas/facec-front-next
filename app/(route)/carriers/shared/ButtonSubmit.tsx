"use client";

import { useCarrierFormContext } from "../context/CarrierFormContext"
import { carrierSchema } from "@/schemas/carrier.schema";
import { PrimaryButton } from "@/components";
import { useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useParams, useRouter } from "next/navigation";

export const ButtonSubmit = () => {
    const { carrier, setErrors } = useCarrierFormContext();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const params = useParams();

    const handleSubmit = async () => {
        // 1. Crear el formulario
        const form = {
            ...carrier,
        }

        // 2. Validar el formulario
        const parsed = carrierSchema.safeParse(form);
        if (!parsed.success) {
            console.log('Validación: ', parsed.error.errors);
            const formated: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formated[err.path[0] as string] = err.message;
            });
            setErrors(formated);
            return;
        }

        // 3. Enviar formulario
        try {
            setIsPending(true);
            if (params?.id) {
                const res = await axiosAuth.put(`carriers/${params.id}`, form);
                if (res?.data?.message === 'KEY_DUPLICATE') {
                    setErrors({ 'identication': 'Ya existe un transportista con la identificación ' + form.identication });
                    setIsPending(false);
                    return;
                }
                router.push('/carriers');
            } else {
                const res = await axiosAuth.post('carriers', form);
                if (res?.data?.message === 'KEY_DUPLICATE') {
                    setErrors({ 'identication': 'Ya existe un transportista con la identificación ' + form.identication });
                    setIsPending(false);
                    return;
                }
                router.push('/carriers');
            }
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
