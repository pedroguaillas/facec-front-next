import { initialCustomer } from "@/constants/initialValues";
import { ChangeEvent, useState } from "react";

export const useCustomerForm = () => {

    const [customer, setCustomer] = useState<Customer>(initialCustomer);
    type CustomerErrors = Partial<Record<keyof Customer, string>>;
    const [errors, setErrors] = useState<CustomerErrors>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    return { customer, errors, setErrors, handleChange };
};
