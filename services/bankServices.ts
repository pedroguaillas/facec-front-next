import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Bank } from "@/types";
import { AxiosInstance } from "axios";

export const storeBank = async (
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<Bank>> =>
    handleApiRequest<Bank>(() => axiosAuth.post("banks", data));

export const updateBank = async (
    id: string,
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<Bank>> =>
    handleApiRequest<Bank>(() => axiosAuth.put(`banks/${id}`, data));
