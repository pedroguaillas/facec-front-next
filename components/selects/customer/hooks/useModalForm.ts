import { findCustomerByIdentification, storeCustomer } from "@/services/customerServices";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { initialCustomer } from "@/constants/initialValues";
import { customerSchema } from "@/schemas/customer.schema";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Customer, CustomerProps } from "@/types";

export const useModalForm = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
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

    const getCustom = useCallback(async () => {
        const res = await findCustomerByIdentification(axiosAuth, customer.identication);
        if (res !== null) {
            if (res.branch_id !== 0) {
                setErrors({ identication: 'El cliente ya esta registrado' })
                return;
            }
            const { name, address, email, phone } = res
            const updatedCustomer = {
                ...({ name }),
                ...(address ? { address } : {}),
                ...(email ? { email } : {}),
                ...(phone ? { phone } : {}),
            };
            setCustomer(prev => ({
                ...prev,
                ...updatedCustomer,
            }));
        }
    }, [customer.identication, axiosAuth]);

    const saveCustomer = async (handleSelect: (custom: CustomerProps) => void) => {
        const parsed = customerSchema.safeParse(customer);

        if (!parsed.success) {
            const formatted: Record<string, string> = {};
            parsed.error.errors.forEach(err => {
                formatted[err.path[0] as string] = err.message;
            });
            setErrors(formatted);
            return;
        }

        setIsSaving(!isSaving);
        const res = await storeCustomer(axiosAuth, customer);

        if (res !== null) {
            handleSelect({ id: Number(res.id), atts: { identication: res.identication, name: res.name } });
            toogle();
        }
    }

    useEffect(() => {
        const identication = customer.identication.trim()
        if ((customer.type_identification === 'cédula' && identication.length === 10) || (customer.type_identification === 'ruc' && identication.length === 13)) {
            // VALIDADO: que no entre en bucle
            // console.log(identication);
            getCustom()
        }
    }, [customer.identication, customer.type_identification, getCustom])

    return { isOpen, customer, errors, optionType, isSaving, toogle, handleChange, saveCustomer }
}
