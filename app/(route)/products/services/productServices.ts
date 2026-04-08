import { handleApiRequest } from "@/helpers/apiHandler";
import {
    GeneralPaginate,
    Product,
    ProductCreateResponse,
    ProductCsv,
    ProductEditResponse,
    ProductProps,
} from "@/types";
import { AxiosInstance } from "axios";

export const getProducts = async (axiosAuth: AxiosInstance, pageUrl: string) =>
    handleApiRequest<GeneralPaginate<ProductProps>>(() => axiosAuth.get(pageUrl));

export const getCreateProduct = async (axiosAuth: AxiosInstance) =>
    handleApiRequest<ProductCreateResponse>(() => axiosAuth.get("products/create"));

export const storeProduct = async (axiosAuth: AxiosInstance, form: object) =>
    handleApiRequest<Product>(() => axiosAuth.post("products", form));

export const getEditProduct = async (id: string, axiosAuth: AxiosInstance) =>
    handleApiRequest<ProductEditResponse>(() => axiosAuth.get("products/" + id));

export const updateProduct = async (id: number, axiosAuth: AxiosInstance, form: object) =>
    handleApiRequest<Product>(() => axiosAuth.put(`products/${id}`, form));

export const deleteProduct = async (id: number, axiosAuth: AxiosInstance) =>
    handleApiRequest(() => axiosAuth.delete(`products/${id}`));

export const importProducts = async (axiosAuth: AxiosInstance, products: ProductCsv[]) => {
    try {
        const response = await axiosAuth.post("products/import", { products });
        return response.data;
    } catch (error) {
        console.error("Error al importar productos:", error);
        return {};
    }
};
