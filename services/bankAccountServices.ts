import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, BankAccount, GeneralPaginate, BankAccountProps } from "@/types";
import { AxiosInstance } from "axios";

export const getAllBankAccounts = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<GeneralPaginate<BankAccountProps>>> =>
    handleApiRequest<GeneralPaginate<BankAccountProps>>(() => axiosAuth.get("bank-accounts?per_page=100"));

export const storeBankAccount = async (
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<BankAccount>> =>
    handleApiRequest<BankAccount>(() => axiosAuth.post("bank-accounts", data));

export const updateBankAccount = async (
    id: number,
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<BankAccount>> =>
    handleApiRequest<BankAccount>(() => axiosAuth.put(`bank-accounts/${id}`, data));
