"use client";

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { getCarrier } from "../services/carriersServices";
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
    const axiosAuth = useAxiosAuth();

    useEffect(() => {
        const fetchCarrier = async () => {
            if (!id) return;

            const res = await getCarrier(id, axiosAuth);
            if (res !== null) {
                setCarrier({ ...res, id: res.id + '' });
            }
        }
        if (id) {
            fetchCarrier()
        }
    }, [id, axiosAuth]);

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