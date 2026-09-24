import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, BankAccountProps, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getBankAccounts = async (
    axiosAuth: AxiosInstance,
    bankId: number,
): Promise<ApiResponse<GeneralPaginate<BankAccountProps>>> =>
    handleApiRequest<GeneralPaginate<BankAccountProps>>(() => axiosAuth.get(`bank-accounts?bank_id=${bankId}`));

export const deleteBankAccount = async (id: number, axiosAuth: AxiosInstance) =>
    handleApiRequest(() => axiosAuth.delete(`bank-accounts/${id}`));
