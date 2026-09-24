import { handleApiRequest } from "@/helpers/apiHandler";
import { AccountLedgerEntry, ApiResponse, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getCustomerAccountReceivable = async (
    axiosAuth: AxiosInstance,
    customerId: number,
    pageUrl?: string,
): Promise<ApiResponse<GeneralPaginate<AccountLedgerEntry>>> =>
    handleApiRequest<GeneralPaginate<AccountLedgerEntry>>(() => axiosAuth.get(pageUrl ?? `customers/${customerId}/account-receivable`));

export const getProviderAccountPayable = async (
    axiosAuth: AxiosInstance,
    providerId: number,
    pageUrl?: string,
): Promise<ApiResponse<GeneralPaginate<AccountLedgerEntry>>> =>
    handleApiRequest<GeneralPaginate<AccountLedgerEntry>>(() => axiosAuth.get(pageUrl ?? `providers/${providerId}/account-payable`));
