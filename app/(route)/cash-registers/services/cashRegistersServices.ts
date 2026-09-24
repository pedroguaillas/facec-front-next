import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, CashRegister, CashRegisterProps, CashRegisterSession, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getCashRegisters = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<CashRegisterProps>>> =>
    handleApiRequest<GeneralPaginate<CashRegisterProps>>(() => axiosAuth.get(pageUrl));

export const getCashRegister = async (
    axiosAuth: AxiosInstance,
    id: string,
): Promise<ApiResponse<CashRegister>> =>
    handleApiRequest<CashRegister>(() => axiosAuth.get(`cash-registers/${id}`));

export const getCashRegisterSessions = async (
    axiosAuth: AxiosInstance,
    cashRegisterId: number,
    pageUrl?: string,
): Promise<ApiResponse<GeneralPaginate<CashRegisterSession>>> =>
    handleApiRequest<GeneralPaginate<CashRegisterSession>>(() => axiosAuth.get(pageUrl ?? `cash-registers/${cashRegisterId}/sessions`));

export const getCashRegisterSession = async (
    axiosAuth: AxiosInstance,
    sessionId: string,
): Promise<ApiResponse<CashRegisterSession>> =>
    handleApiRequest<CashRegisterSession>(() => axiosAuth.get(`cash-register-sessions/${sessionId}`));
