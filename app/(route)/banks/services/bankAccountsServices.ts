import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, BankAccount, BankAccountProps, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getBankAccounts = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<BankAccountProps>>> =>
    handleApiRequest<GeneralPaginate<BankAccountProps>>(() => axiosAuth.get(pageUrl));

export const getBankAccount = async (
    axiosAuth: AxiosInstance,
    id: string,
): Promise<ApiResponse<BankAccount>> =>
    handleApiRequest<BankAccount>(() => axiosAuth.get(`bank-accounts/${id}`));

export const deleteBankAccount = async (id: number, axiosAuth: AxiosInstance) =>
    handleApiRequest(() => axiosAuth.delete(`bank-accounts/${id}`));
