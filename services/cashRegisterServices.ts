import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, CashRegister, CashRegisterProps, CashRegisterSession, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getAllCashRegisters = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<GeneralPaginate<CashRegisterProps>>> =>
    handleApiRequest<GeneralPaginate<CashRegisterProps>>(() => axiosAuth.get("cash-registers?paginate=100"));

export const storeCashRegister = async (
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<CashRegister>> =>
    handleApiRequest<CashRegister>(() => axiosAuth.post("cash-registers", data));

export const updateCashRegister = async (
    id: string,
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<CashRegister>> =>
    handleApiRequest<CashRegister>(() => axiosAuth.put(`cash-registers/${id}`, data));

export const openCashRegister = async (
    id: number,
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<CashRegisterSession>> =>
    handleApiRequest<CashRegisterSession>(() => axiosAuth.post(`cash-registers/${id}/open`, data));

export const closeCashRegister = async (
    id: number,
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<CashRegisterSession>> =>
    handleApiRequest<CashRegisterSession>(() => axiosAuth.post(`cash-registers/${id}/close`, data));
