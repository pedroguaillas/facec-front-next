import { findCustomerByIdentification, storeCustomer } from "@/services/customerServices";
import { initialCustomer } from "@/constants/initialValues";
import { customerSchema } from "@/schemas/customer.schema";
import { usePartyForm } from "@/lib/hooks/usePartyForm";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Customer } from "@/types";

// Registro rápido de cliente desde la venta (sin edición)
export const useCreateCustomer = (onSaved: (saved?: Customer) => void) => {
    const axiosAuth = useAxiosAuth();

    return usePartyForm<Customer>({
        initial: initialCustomer,
        schema: customerSchema,
        fetch: async () => ({}),
        save: (form) => storeCustomer(axiosAuth, form),
        resolve: (identication) => findCustomerByIdentification(axiosAuth, identication),
        fillFields: ['name', 'address', 'phone', 'email'],
        duplicateMessage: 'El cliente ya está registrado',
        onSaved,
    });
};
