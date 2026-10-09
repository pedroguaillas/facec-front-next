import { getCarrier, resolveCarrier, storeCarrier, updateCarrier } from "../services/carriersServices";
import { carrierSchema } from "@/schemas/carrier.schema";
import { usePartyForm } from "@/lib/hooks/usePartyForm";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Carrier } from "@/types";

const initialCarrier: Carrier = {
    id: '',
    type_identification: 'cédula',
    identication: '',
    name: '',
    license_plate: '',
}

export const useCarrierForm = (id: string | undefined, onSaved: () => void) => {
    const axiosAuth = useAxiosAuth();

    return usePartyForm<Carrier>({
        id,
        initial: initialCarrier,
        schema: carrierSchema,
        fetch: (carrierId) => getCarrier(axiosAuth, carrierId),
        save: (form, carrierId) => carrierId
            ? updateCarrier(axiosAuth, carrierId, form)
            : storeCarrier(axiosAuth, form),
        resolve: (identication) => resolveCarrier(axiosAuth, identication),
        fillFields: ['name', 'address', 'phone', 'email'],
        duplicateMessage: 'El transportista ya está registrado',
        onSaved,
    });
}
