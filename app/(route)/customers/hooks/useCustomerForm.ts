import { findCustomerByIdentification, storeCustomer, updateCustomer } from "@/services/customerServices";
import { initialCustomer } from "@/constants/initialValues";
import { customerSchema } from "@/schemas/customer.schema";
import { getCustomer } from "../services/customersServices";
import { usePartyForm } from "@/lib/hooks/usePartyForm";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Customer } from "@/types";

export const useCustomerForm = (id: string | undefined, onSaved: () => void) => {
    const axiosAuth = useAxiosAuth();

    return usePartyForm<Customer>({
        id,
        initial: initialCustomer,
        schema: customerSchema,
        fetch: (customerId) => getCustomer(axiosAuth, customerId),
        save: (form, customerId) => customerId
            ? updateCustomer(customerId, axiosAuth, form)
            : storeCustomer(axiosAuth, form),
        resolve: (identication) => findCustomerByIdentification(axiosAuth, identication),
        fillFields: ['name', 'address', 'phone', 'email'],
        duplicateMessage: 'El cliente ya está registrado',
        onSaved,
    });
};
