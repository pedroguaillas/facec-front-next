"use client";

import { useCarrierFormContext } from "../context/CarrierFormContext"
import { carrierSchema } from "@/schemas/carrier.schema";
import { Alert, PrimaryButton } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useParams, useRouter } from "next/navigation";
import { storeCarrier, updateCarrier } from "../services/carriersServices";
import { useFormSubmit } from "@/lib/hooks/useFormSubmit";

export const ButtonSubmit = () => {
    const { carrier, setErrors } = useCarrierFormContext();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const params = useParams();

    const { handleSubmit, isPending, message } = useFormSubmit({
        schema: carrierSchema,
        data: carrier,
        setErrors,
        onSubmit: (form) => params?.id
            ? updateCarrier(axiosAuth, params.id + '', form)
            : storeCarrier(axiosAuth, form),
        onSuccess: () => router.push('/carriers'),
    });

    return (
        <div className='flex flex-col gap-2'>
            {message && <Alert message={message} />}
            <div className='flex justify-end'>
                <div className='w-28'>
                    <PrimaryButton label='Guardar' type='button' action='store' isLoading={isPending} onClick={handleSubmit} />
                </div>
            </div>
        </div>
    )
}
