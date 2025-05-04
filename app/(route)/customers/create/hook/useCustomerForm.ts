import { initialCustomer } from "@/constants/initialValues";
import { ChangeEvent, useEffect, useState } from "react";
import { getCustomer } from "../../../../../services/getCustomer";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Customer } from "@/types";

export const useCustomerForm = () => {

    const [customer, setCustomer] = useState<Customer>(initialCustomer);
    type CustomerErrors = Partial<Record<keyof Customer, string>>;
    const [errors, setErrors] = useState<CustomerErrors>({});
    const axiosAuth = useAxiosAuth();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCustom = async () => {
        const res = await getCustomer(axiosAuth, customer.identication);
        if (res !== null) {
            if (res.branch_id !== 0) {
                setErrors({ identication: 'El cliente ya esta registrado' })
                return;
            }
            const { name, address, email, phone } = res
            setCustomer(prev => ({
                ...prev,
                name, address, email, phone
            }));
        }
    }

    useEffect(() => {
        const identication = customer.identication.trim();
        if ((customer.type_identification === 'cédula' && identication.length === 10) || (customer.type_identification === 'ruc' && identication.length === 13)) {
            handleCustom();
        }
    }, [customer.identication])

    return { customer, errors, setErrors, handleChange };
};
