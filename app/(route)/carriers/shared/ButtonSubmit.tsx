"use client";

import { useCarrierFormContext } from "../context/CarrierFormContext"
import { carrierSchema } from "@/schemas/carrier.schema";
import { PrimaryButton } from "@/components";
import { useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useParams, useRouter } from "next/navigation";
import { storeCarrier, updateCarrier } from "../services/carriersServices";
import { parseZodErrors } from "@/helpers/zodHelper";

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
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        // 3. Enviar formulario
        try {
            setIsPending(true);
            const res = params?.id
                ? await updateCarrier(axiosAuth, params.id + '', form)
                : await storeCarrier(axiosAuth, form);

            if (res.errors) {
                setErrors(res.errors);
                setIsPending(false);
                return;
            }
            router.push('/carriers');
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
