import { handleApiRequest } from "@/helpers/apiHandler";
import { AccountLedgerEntry, AdvanceEntry, AdvancesSummary, ApiResponse, GeneralPaginate } from "@/types";
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

export const registerCustomerOpeningBalance = async (
    axiosAuth: AxiosInstance,
    customerId: number,
    data: object
): Promise<ApiResponse<AccountLedgerEntry>> =>
    handleApiRequest<AccountLedgerEntry>(() => axiosAuth.post(`customers/${customerId}/account-receivable/opening-balance`, data));

export const registerProviderOpeningBalance = async (
    axiosAuth: AxiosInstance,
    providerId: number,
    data: object
): Promise<ApiResponse<AccountLedgerEntry>> =>
    handleApiRequest<AccountLedgerEntry>(() => axiosAuth.post(`providers/${providerId}/account-payable/opening-balance`, data));

export const registerCustomerAdvance = async (
    axiosAuth: AxiosInstance,
    customerId: number,
    data: object
): Promise<ApiResponse<AdvanceEntry>> =>
    handleApiRequest<AdvanceEntry>(() => axiosAuth.post(`customers/${customerId}/advances`, data));

export const registerProviderAdvance = async (
    axiosAuth: AxiosInstance,
    providerId: number,
    data: object
): Promise<ApiResponse<AdvanceEntry>> =>
    handleApiRequest<AdvanceEntry>(() => axiosAuth.post(`providers/${providerId}/advances`, data));

export const getCustomerAdvances = async (
    axiosAuth: AxiosInstance,
    customerId: number,
): Promise<ApiResponse<AdvancesSummary>> =>
    handleApiRequest<AdvancesSummary>(() => axiosAuth.get(`customers/${customerId}/advances`));

export const getProviderAdvances = async (
    axiosAuth: AxiosInstance,
    providerId: number,
): Promise<ApiResponse<AdvancesSummary>> =>
    handleApiRequest<AdvancesSummary>(() => axiosAuth.get(`providers/${providerId}/advances`));
