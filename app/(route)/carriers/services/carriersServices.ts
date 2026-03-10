import { handleApiRequest } from "@/helpers/apiHandler";
import { Carrier, CarrierProps, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getCarriers = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl: string,
    search?: string,
    page?: number
) => handleApiRequest<GeneralPaginate<CarrierProps>>(() => axiosAuth.get(pageUrl, { params: { search, page } }));

export const storeCarrier = async (axiosAuth: AxiosInstance, form: object) =>
    handleApiRequest<Carrier>(() => axiosAuth.post('carriers', form));

export const getCarrier = async (axiosAuth: AxiosInstance, id: string) =>
    handleApiRequest<Carrier>(() => axiosAuth.get(`carriers/${id}`));

export const updateCarrier = async (axiosAuth: AxiosInstance, id: string, form: object) =>
    handleApiRequest<Carrier>(() => axiosAuth.put(`carriers/${id}`, form));
