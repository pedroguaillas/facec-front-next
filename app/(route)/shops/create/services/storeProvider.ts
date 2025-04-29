import { Supplier, SupplierProps } from "@/types";
import { AxiosInstance } from "axios";

export const storeProvider = async (axiosAuth: AxiosInstance, provider: Supplier) => {

    try {
        const res = await axiosAuth.post('providers', provider);
        const { id, identication, name } = res.data.provider;
        return { id, atts: { identication, name } } as SupplierProps;
    } catch (error) {
        console.log(error);
        return null;
    }

}
