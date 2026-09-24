import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Bank, BankProps, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getBanks = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<BankProps>>> =>
    handleApiRequest<GeneralPaginate<BankProps>>(() => axiosAuth.get(pageUrl));

export const getBank = async (
    axiosAuth: AxiosInstance,
    id: string,
): Promise<ApiResponse<Bank>> =>
    handleApiRequest<Bank>(() => axiosAuth.get(`banks/${id}`));

export const deleteBank = async (id: number, axiosAuth: AxiosInstance) =>
    handleApiRequest(() => axiosAuth.delete(`banks/${id}`));
