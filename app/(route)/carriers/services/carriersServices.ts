import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Carrier } from "@/types";
import { AxiosInstance } from "axios";

export const storeCarrier = async (
    axiosAuth: AxiosInstance,
    form: object
): Promise<ApiResponse<Carrier>> =>
    handleApiRequest<Carrier>(() => axiosAuth.post('carriers', form));

export const getCarrier = async (
    axiosAuth: AxiosInstance,
    id: string
): Promise<ApiResponse<Carrier>> =>
    handleApiRequest<Carrier>(() => axiosAuth.get(`carriers/${id}`));

export const updateCarrier = async (
    axiosAuth: AxiosInstance,
    id: string,
    form: object
): Promise<ApiResponse<Carrier>> =>
    handleApiRequest<Carrier>(() => axiosAuth.put(`carriers/${id}`, form));

export const resolveCarrier = async (
    axiosAuth: AxiosInstance,
    identication: string
): Promise<ApiResponse<Carrier>> =>
    handleApiRequest<Carrier>(() => axiosAuth.get(`carriers/resolve/${identication}`));
