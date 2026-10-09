"use client";

import { useToast } from "@/context/ToastContext";
import { useCarriers } from "../context/CarriersContext";
import { CarrierForm } from "../shared";

export const CarrierFormModal = () => {

    const { carrierFormId, setCarrierFormId, fetchCarriers } = useCarriers();
    const { toast } = useToast();

    if (carrierFormId === null) return null;

    const id = carrierFormId === 'new' ? undefined : carrierFormId + '';

    const handleSaved = () => {
        toast(id ? 'Transportista actualizado' : 'Transportista registrado');
        setCarrierFormId(null);
        fetchCarriers();
    };

    return (
        <CarrierForm
            key={carrierFormId}
            id={id}
            onClose={() => setCarrierFormId(null)}
            onSaved={handleSaved}
        />
    )
}
