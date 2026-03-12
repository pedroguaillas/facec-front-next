import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, GeneralPaginate, Supplier, SupplierProps } from "@/types";
import { AxiosInstance } from "axios";

export const getSuppliers = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<SupplierProps>>> =>
    handleApiRequest<GeneralPaginate<SupplierProps>>(() => axiosAuth.get(pageUrl));

export const getSupplier = async (
    id: string,
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<Supplier>> =>
    handleApiRequest<Supplier>(() => axiosAuth.get(`providers/${id}/edit`));
