import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, ProductPresentation } from "@/types";
import { AxiosInstance } from "axios";

export interface ProductPresentationForm {
    name: string;
    conversion_factor: number | string;
    price?: number | string | null;
    code?: string | null;
    active?: boolean;
}

export const getPresentations = async (
    axiosAuth: AxiosInstance,
    productId: number | string,
): Promise<ApiResponse<{ data: ProductPresentation[] }>> =>
    handleApiRequest<{ data: ProductPresentation[] }>(() => axiosAuth.get(`products/${productId}/presentations`));

export const storePresentation = async (
    axiosAuth: AxiosInstance,
    productId: number | string,
    form: ProductPresentationForm,
): Promise<ApiResponse<ProductPresentation>> =>
    handleApiRequest<ProductPresentation>(() => axiosAuth.post(`products/${productId}/presentations`, form));

export const updatePresentation = async (
    axiosAuth: AxiosInstance,
    productId: number | string,
    id: number,
    form: ProductPresentationForm,
): Promise<ApiResponse<ProductPresentation>> =>
    handleApiRequest<ProductPresentation>(() => axiosAuth.put(`products/${productId}/presentations/${id}`, form));

export const deletePresentation = async (
    axiosAuth: AxiosInstance,
    productId: number | string,
    id: number,
) => handleApiRequest<{ succes: boolean; message: string }>(() => axiosAuth.delete(`products/${productId}/presentations/${id}`));
