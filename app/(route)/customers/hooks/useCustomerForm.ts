import { findCustomerByIdentification } from "@/services/customerServices";
import { initialCustomer } from "@/constants/initialValues";
import { CONSUMIDOR_FINAL_IDENTICATION } from "@/constants";
import { getCustomer } from "../services/customersServices";
import { ChangeEvent, useEffect, useState } from "react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { redirect, useParams } from "next/navigation";
import { Customer } from "@/types";

export const useCustomerForm = () => {

    const [customer, setCustomer] = useState<Customer>(initialCustomer);
    type CustomerErrors = Partial<Record<keyof Customer, string>>;
    const [errors, setErrors] = useState<CustomerErrors>({});
    const [skiFetch, setSkiFetch] = useState(false);
    const axiosAuth = useAxiosAuth();
    const params = useParams();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    useEffect(() => {
        const fetchGetCustomer = async () => {
            if (typeof params?.id === 'string') {

                const { data } = await getCustomer(axiosAuth, params.id);
                if (data) {
                    if (data.identication === CONSUMIDOR_FINAL_IDENTICATION) {
                        redirect(`/error?message=${encodeURIComponent('No se puede editar el cliente Consumidor Final.')}`);
                    }
                    setSkiFetch(true);
                    setCustomer(data);
                }
            }
        }

        fetchGetCustomer();
    }, [params?.id, axiosAuth]);

    useEffect(() => {
        const handleCustom = async () => {
            const { data } = await findCustomerByIdentification(axiosAuth, customer.identication);
            if (data) {
                if (data.branch_id !== 0) {
                    setErrors({ identication: 'El cliente ya esta registrado' })
                    return;
                }
                const { name, address, email, phone } = data
                setCustomer(prev => ({
                    ...prev,
                    name, address, email, phone
                }));
            }
        }

        const identication = customer.identication.trim();

        if (!skiFetch && ((customer.type_identification === 'cédula' && identication.length === 10) || (customer.type_identification === 'ruc' && identication.length === 13))) {
            handleCustom();
        }

    }, [customer.type_identification, customer.identication, skiFetch, axiosAuth])

    return { customer, errors, setErrors, handleChange };
};
