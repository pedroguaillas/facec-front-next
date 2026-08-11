"use client";

import { useProductCreateContext } from "../context/ProductFormContext";
import { productSchema } from "@/schemas/product.schema";
import { useRouter, useParams } from "next/navigation";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { PrimaryButton } from "@/components";
import { useState } from "react";
import { storeProduct, updateProduct } from "../services/productServices";
import { parseZodErrors } from "@/helpers/zodHelper";

export const ButtonSubmit = () => {
    const { product, setErrorProduct } = useProductCreateContext();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const params = useParams();

    const handleSubmit = async () => {
        // 1. Crear el formulario
        const form = { ...product };

        // 2. Validar el formulario
        const parsed = productSchema.safeParse(form);
        if (!parsed.success) {
            setErrorProduct(parseZodErrors(parsed.error));
            return;
        }

        // 3. Enviar el formulario
        setIsPending(true);

        const { error, data, errors } = params?.id
            ? await updateProduct(Number(params.id), axiosAuth, form)
            : await storeProduct(axiosAuth, form);

        if (data) {
            router.push("/products");
        } else if (errors) {
            console.log(errors);
            setErrorProduct(errors);
        } else {
            console.log(error);
        }
        setIsPending(false);
    };

    return (
        <div className="flex justify-end">
            <div className="w-28">
                <PrimaryButton
                    label="Guardar"
                    type="button"
                    action="store"
                    isLoading={isPending}
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};
