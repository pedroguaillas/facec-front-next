import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse } from "@/types";
import { AxiosInstance } from "axios";

// Código de un producto en las facturas del proveedor (ej. "M138THR200M2") → producto propio
export interface ProviderProductCode {
    id: number;
    code: string;
    product_id: number;
    product_name: string | null;
    product_code: string | null;
}

export const getProviderProductCodes = async (
    axiosAuth: AxiosInstance,
    providerId: number,
): Promise<ApiResponse<ProviderProductCode[]>> =>
    handleApiRequest<ProviderProductCode[]>(() => axiosAuth.get(`providers/${providerId}/product-codes`));

export const storeProviderProductCode = async (
    axiosAuth: AxiosInstance,
    providerId: number,
    form: { product_id: number; code: string },
): Promise<ApiResponse<ProviderProductCode>> =>
    handleApiRequest<ProviderProductCode>(() => axiosAuth.post(`providers/${providerId}/product-codes`, form));
