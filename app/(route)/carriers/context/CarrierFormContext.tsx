"use client";

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { getCarrier, resolveCarrier } from "../services/carriersServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Carrier } from "@/types";
import { nanoid } from "nanoid";

interface CarrierFormContextType {
    carrier: Carrier;
    errors: Partial<Record<keyof Carrier, string>>;
    setCarrier: Dispatch<SetStateAction<Carrier>>;
    setErrors: Dispatch<SetStateAction<Partial<Record<keyof Carrier, string>>>>;
}

const CarrierFormContext = createContext<CarrierFormContextType | undefined>(undefined);

interface Props {
    id?: string;
    children: React.ReactNode;
}

const initialCarrier: Carrier = {
    id: nanoid(),
    type_identification: 'cédula',
    identication: '',
    name: '',
    license_plate: '',
}

export const CarrierFormProvider = ({ id, children }: Props) => {

    const [carrier, setCarrier] = useState<Carrier>(initialCarrier);
    const [errors, setErrors] = useState<Partial<Record<keyof Carrier, string>>>({});
    const [skiFetch, setSkiFetch] = useState(false);
    const axiosAuth = useAxiosAuth();

    useEffect(() => {
        const fetchCarrier = async () => {
            if (!id) return;

            const { data } = await getCarrier(axiosAuth, id);
            if (data) {
                setSkiFetch(true);
                setCarrier(data);
            }
        }
        if (id) {
            fetchCarrier()
        }
    }, [id, axiosAuth]);

    useEffect(() => {
        const handleResolve = async () => {
            const { data } = await resolveCarrier(axiosAuth, carrier.identication);
            if (data) {
                if (data.branch_id && data.branch_id !== 0) {
                    setErrors({ identication: 'El transportista ya esta registrado' });
                    return;
                }
                const { name, address, phone, email } = data;
                setCarrier(prev => ({
                    ...prev,
                    name, address, phone, email
                }));
            }
        }

        const identication = carrier.identication.trim();

        if (!skiFetch && ((carrier.type_identification === 'cédula' && identication.length === 10) || (carrier.type_identification === 'ruc' && identication.length === 13))) {
            handleResolve();
        }

    }, [carrier.type_identification, carrier.identication, skiFetch, axiosAuth]);

    return (
        <CarrierFormContext.Provider value={{
            carrier, errors,
            setCarrier, setErrors
        }}>
            {children}
        </CarrierFormContext.Provider>
    )
}

export const useCarrierFormContext = () => {
    const context = useContext(CarrierFormContext);
    if (context === undefined) {
        throw new Error("useCarrierFormContext must be used within a CarrierFormProvider")
    }
    return context;
}