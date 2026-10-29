"use client";

import { DraftPresentationErrors, useProductCreateContext } from "../context/ProductFormContext";
import { productSchema } from "@/schemas/product.schema";
import { useRouter, useParams } from "next/navigation";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { PrimaryButton } from "@/components";
import { useState } from "react";
import { storeProduct, updateProduct } from "../services/productServices";
import { parseZodErrors } from "@/helpers/zodHelper";
import { useInventory } from "@/lib/hooks/useInventory";
import { pickTemplateDetails, templateFieldsOf, validateTemplateDetails } from "@/helpers/productTemplateHelper";

export const ButtonSubmit = () => {
    const { product, setErrorProduct, draftPresentations, setDraftErrors, productTemplates } = useProductCreateContext();
    const axiosAuth = useAxiosAuth();
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const params = useParams();
    const { enabled: inventory } = useInventory();

    const handleSubmit = async () => {
        // 1. Crear el formulario
        const form: Partial<typeof product> = { ...product };
        // Con inventario el backend ignora el stock al editar (se mueve con ajustes): no se envía
        if (inventory && params?.id) delete form.stock;

        // Plantilla: se envían siempre product_template_id y details (solo campos de nivel modelo).
        // Una unidad hereda las del modelo: el backend las ignora y no se envían
        let detailErrors: Record<string, string> = {};
        delete form.details;
        delete form.parent_product_id;
        if (product.parent_product_id) {
            delete form.product_template_id;
        } else {
            const template = productTemplates.find(t => t.id === product.product_template_id);
            const modelFields = templateFieldsOf(template, 'modelo');
            form.product_template_id = product.product_template_id ?? null;
            form.details = pickTemplateDetails(modelFields, product.details);
            detailErrors = Object.fromEntries(Object.entries(validateTemplateDetails(modelFields, form.details)).map(([key, msg]) => [`details.${key}`, msg]));
            // Un modelo con campos por unidad no admite stock: lo dan sus unidades
            if (templateFieldsOf(template, 'unidad').length > 0 && form.stock !== undefined) form.stock = 0;
        }

        // 2. Validar el formulario
        const parsed = productSchema.safeParse(form);
        if (!parsed.success || Object.keys(detailErrors).length > 0) {
            setErrorProduct({ ...(parsed.success ? {} : parseZodErrors(parsed.error)), ...detailErrors });
            return;
        }

        // Al crear, las presentaciones van en el mismo POST (una transacción). Solo productos:
        // con un servicio el backend rechaza la clave aunque venga vacía, así que no se envía
        const presentations = !params?.id && inventory && product.type_product === 1 && draftPresentations.length > 0
            ? draftPresentations.map(({ name, conversion_factor, price, code, active }) => ({ name, conversion_factor, price, code, active }))
            : undefined;

        // 3. Enviar el formulario
        setIsPending(true);
        setDraftErrors({ rows: {} });

        const { error, data, errors } = params?.id
            ? await updateProduct(Number(params.id), axiosAuth, form)
            : await storeProduct(axiosAuth, presentations ? { ...form, presentations } : form);

        if (data) {
            router.push("/products");
        } else if (errors) {
            // presentations.N.campo → fila N de los borradores; el resto son campos del producto
            const productErrors: Record<string, string> = {};
            const presentationErrors: DraftPresentationErrors = { rows: {} };
            Object.entries(errors).forEach(([field, message]) => {
                const match = field.match(/^presentations\.(\d+)\.(\w+)$/);
                const draft = match ? draftPresentations[Number(match[1])] : undefined;
                if (draft && match) {
                    presentationErrors.rows[draft.key] = { ...presentationErrors.rows[draft.key], [match[2]]: message };
                } else if (field.startsWith('presentations')) {
                    presentationErrors.general = message;
                } else {
                    productErrors[field] = message;
                }
            });
            setErrorProduct(productErrors);
            setDraftErrors(presentationErrors);
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
