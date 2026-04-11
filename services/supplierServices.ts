import { handleApiRequest } from "@/helpers/apiHandler";
import { Supplier, SupplierProps } from "@/types";
import { AxiosInstance } from "axios";

export const resolveSupplier = async (axiosAuth: AxiosInstance, identication: string) =>
    handleApiRequest<Supplier>(() => axiosAuth.get(`providers/resolve/${identication}`));

export const storeSupplier = async (axiosAuth: AxiosInstance, provider: object) =>
    handleApiRequest<Supplier>(() => axiosAuth.post("providers", provider));

export const updateSupplier = async (id: string, axiosAuth: AxiosInstance, provider: object) =>
    handleApiRequest<SupplierProps>(() => axiosAuth.put(`providers/${id}`, provider));
