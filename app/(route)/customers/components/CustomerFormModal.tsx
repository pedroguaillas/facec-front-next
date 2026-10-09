"use client";

import { useToast } from "@/context/ToastContext";
import { useCustomers } from "../context/CustomersContext";
import { CustomerForm } from "../shared/CustomerForm";

export const CustomerFormModal = () => {

    const { customerFormId, setCustomerFormId, fetchCustomers } = useCustomers();
    const { toast } = useToast();

    if (customerFormId === null) return null;

    const id = customerFormId === 'new' ? undefined : customerFormId + '';

    const handleSaved = () => {
        toast(id ? 'Cliente actualizado' : 'Cliente registrado');
        setCustomerFormId(null);
        fetchCustomers();
    };

    return (
        <CustomerForm
            key={customerFormId}
            id={id}
            onClose={() => setCustomerFormId(null)}
            onSaved={handleSaved}
        />
    )
}
