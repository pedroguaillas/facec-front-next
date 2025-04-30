import { initialCustomer } from "@/constants/initialValues";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getCustomer } from "@/services/getCustomer";
import { ChangeEvent, useEffect, useState } from "react";

export const useModalForm = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [customer, setCustomer] = useState<Customer>(initialCustomer);
    const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
    const axiosAuth = useAxiosAuth();

    const optionType = [
        { label: 'Cédula', value: 'cédula' },
        { label: 'RUC', value: 'ruc' },
    ]

    const toogle = () => {
        setIsOpen(!isOpen)
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    }

    const getCustom = async () => {
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

    const save = () => {

    }

    useEffect(() => {
        const identication = customer.identication.trim()
        if ((customer.type_identification === 'cédula' && identication.length === 10) || (customer.type_identification === 'ruc' && identication.length === 13)) {
            console.log(identication);
            getCustom()
        }
    }, [customer.identication])

    return { isOpen, customer, errors, optionType, toogle, handleChange, save }
}
