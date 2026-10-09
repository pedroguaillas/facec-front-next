import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, GeneralPaginate, Holiday } from "@/types";
import { AxiosInstance } from "axios";

export const getHolidays = async (
    axiosAuth: AxiosInstance,
    page: number,
): Promise<ApiResponse<GeneralPaginate<Holiday>>> =>
    handleApiRequest<GeneralPaginate<Holiday>>(() => axiosAuth.get(`admin/holidays?page=${page}`));

export const storeHoliday = async (axiosAuth: AxiosInstance, form: object): Promise<ApiResponse<Holiday>> =>
    handleApiRequest<Holiday>(() => axiosAuth.post('admin/holidays', form));

export const updateHoliday = async (axiosAuth: AxiosInstance, id: number, form: object): Promise<ApiResponse<Holiday>> =>
    handleApiRequest<Holiday>(() => axiosAuth.put(`admin/holidays/${id}`, form));

export const deleteHoliday = async (axiosAuth: AxiosInstance, id: number): Promise<ApiResponse<unknown>> =>
    handleApiRequest<unknown>(() => axiosAuth.delete(`admin/holidays/${id}`));
