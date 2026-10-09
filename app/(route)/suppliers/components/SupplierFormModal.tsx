"use client";

import { useToast } from "@/context/ToastContext";
import { useSuppliers } from "../context/SupplierContext";
import { SupplierForm } from "../shared/SupplierForm";

export const SupplierFormModal = () => {

    const { supplierFormId, setSupplierFormId, fetchSuppliers } = useSuppliers();
    const { toast } = useToast();

    if (supplierFormId === null) return null;

    const id = supplierFormId === 'new' ? undefined : supplierFormId + '';

    const handleSaved = () => {
        toast(id ? 'Proveedor actualizado' : 'Proveedor registrado');
        setSupplierFormId(null);
        fetchSuppliers();
    };

    return (
        <SupplierForm
            key={supplierFormId}
            id={id}
            onClose={() => setSupplierFormId(null)}
            onSaved={handleSaved}
        />
    )
}
