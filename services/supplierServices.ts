import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Supplier, SupplierProps } from "@/types";
import { AxiosInstance } from "axios";

export const resolveSupplier = async (
    axiosAuth: AxiosInstance,
    identication: string
): Promise<ApiResponse<Supplier>> =>
    handleApiRequest<Supplier>(() => axiosAuth.get(`providers/resolve/${identication}`));

export const storeSupplier = async (
    axiosAuth: AxiosInstance,
    provider: object
): Promise<ApiResponse<Supplier>> =>
    handleApiRequest<Supplier>(() => axiosAuth.post('providers', provider));

export const updateSupplier = async (
    id: string,
    axiosAuth: AxiosInstance,
    provider: object
): Promise<ApiResponse<SupplierProps>> =>
    handleApiRequest<SupplierProps>(() => axiosAuth.put(`providers/${id}`, provider));
