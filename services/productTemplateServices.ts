import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, ProductTemplate, ProductTemplatePayload } from "@/types";
import { AxiosInstance } from "axios";

export const getProductTemplates = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<ProductTemplate[]>> =>
    handleApiRequest<ProductTemplate[]>(() => axiosAuth.get("settings/product-templates"));

export const storeProductTemplate = async (
    axiosAuth: AxiosInstance,
    data: ProductTemplatePayload,
): Promise<ApiResponse<ProductTemplate>> =>
    handleApiRequest<ProductTemplate>(() => axiosAuth.post("settings/product-templates", data));

export const updateProductTemplate = async (
    axiosAuth: AxiosInstance,
    id: number,
    data: ProductTemplatePayload,
): Promise<ApiResponse<ProductTemplate>> =>
    handleApiRequest<ProductTemplate>(() => axiosAuth.put(`settings/product-templates/${id}`, data));

// 422 { message } si la plantilla ya tiene productos: en ese caso se desactiva
export const deleteProductTemplate = async (
    axiosAuth: AxiosInstance,
    id: number,
): Promise<ApiResponse<{ succes: boolean; message: string }>> =>
    handleApiRequest<{ succes: boolean; message: string }>(() => axiosAuth.delete(`settings/product-templates/${id}`));
