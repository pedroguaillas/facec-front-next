import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, ProductUnit } from "@/types";
import { AxiosInstance } from "axios";

// details: campos de nivel "unidad"; code solo si la plantilla no arma el código
export interface ProductUnitForm {
    details: Record<string, string>;
    code: string | null;
}

export const getUnits = async (
    axiosAuth: AxiosInstance,
    productId: number | string,
): Promise<ApiResponse<ProductUnit[]>> =>
    handleApiRequest<ProductUnit[]>(() => axiosAuth.get(`products/${productId}/units`));

export const storeUnit = async (
    axiosAuth: AxiosInstance,
    productId: number | string,
    form: ProductUnitForm,
): Promise<ApiResponse<ProductUnit>> =>
    handleApiRequest<ProductUnit>(() => axiosAuth.post(`products/${productId}/units`, form));

export const updateUnit = async (
    axiosAuth: AxiosInstance,
    productId: number | string,
    id: number,
    form: ProductUnitForm,
): Promise<ApiResponse<ProductUnit>> =>
    handleApiRequest<ProductUnit>(() => axiosAuth.put(`products/${productId}/units/${id}`, form));
