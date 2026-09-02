"use client";

import { TextInput } from "@/components";
import { TRANSPORT_AUX_COD_PREFIX } from "@/constants";
import { useFormInvoice } from "../context/FormInvoiceContext";

export const Plate = () => {

    const { invoice, formErrors, productOutputs, setInvoice, setFormErrors } = useFormInvoice();

    const hasTransportItem = productOutputs.some(item => item.aux_cod?.startsWith(TRANSPORT_AUX_COD_PREFIX));

    // En edición, si ya viene placa guardada la mostramos aunque los items
    // editados no traigan aux_cod (p. ej. respuesta de edición no lo incluye).
    if (!hasTransportItem && !invoice.plate) return null;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setInvoice(prevState => ({ ...prevState, plate: value }));
        setFormErrors(prev => ({ ...prev, plate: '' }));
    }

    return (
        <div className="w-full overflow-x-auto sm:max-w-sm md:max-w-md lg:max-w-lg my-2">
            <TextInput
                label="Placa"
                name="plate"
                value={invoice.plate ?? ''}
                error={formErrors.plate}
                onChange={handleChange}
                maxLength={10}
                required
            />
        </div>
    )
}
