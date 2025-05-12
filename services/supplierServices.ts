import { Supplier, SupplierProps } from "@/types";
import { AxiosInstance } from "axios";

export const findSupplierByIdentification = async (
    axiosAuth: AxiosInstance,
    identication: string
): Promise<Supplier | null> => {
    const url = identication.length === 10 ? 'searchByCedula' : 'searchByRuc';
    try {
        const res = await axiosAuth.get(`providers/${url}/${identication}`);
        return res.data.provider as Supplier;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const storeSupplier = async (
    axiosAuth: AxiosInstance,
    provider: unknown
) => {
    try {
        const res = await axiosAuth.post('providers', provider);
        const { id, identication, name } = res.data.provider;
        return { id, atts: { identication, name } } as SupplierProps;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const updateSupplier = async (
    id: string,
    axiosAuth: AxiosInstance,
    provider: unknown
) => {
    try {
        const res = await axiosAuth.put(`providers/${id}`, provider);
        return res.data.provider as SupplierProps;
    } catch (error) {
        console.log(error);
        return null;
    }
}