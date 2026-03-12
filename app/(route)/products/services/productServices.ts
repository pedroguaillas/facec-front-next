import { handleApiRequest } from "@/helpers/apiHandler";
import { GeneralPaginate, Product, ProductCreateResponse, ProductCsv, ProductEditResponse, ProductProps } from "@/types";
import { AxiosInstance } from "axios";

export const getProducts = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
) => handleApiRequest<GeneralPaginate<ProductProps>>(() => axiosAuth.get(pageUrl))

export const getCreateProduct = async (
    axiosAuth: AxiosInstance,
) => handleApiRequest<ProductCreateResponse>(() => axiosAuth.get("product/create"));

export const productStoreService = async (
    axiosAuth: AxiosInstance,
    form: object,
) => handleApiRequest<Product>(() => axiosAuth.post("product", form));

export const getEditProduct = async (
    id: string,
    axiosAuth: AxiosInstance,
) => handleApiRequest<ProductEditResponse>(() => axiosAuth.get("product/" + id));

export const productUpdateService = async (
    id: number,
    axiosAuth: AxiosInstance,
    form: object,
) => handleApiRequest<Product>(() => axiosAuth.put(`product/${id}`, form));

export const importProductsServices = async (axiosAuth: AxiosInstance, products: ProductCsv[]) => {
    try {
        const response = await axiosAuth.post("products/import", { products });
        return response.data;
    } catch (error) {
        console.error("Error al importar productos:", error);
        return {};
    }
};

export const deleteProduct = async (id: number, axiosAuth: AxiosInstance) => {
    try {
        const response = await axiosAuth.delete("products/" + id);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        return {};
    }
};
