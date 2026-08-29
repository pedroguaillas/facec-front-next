import { handleApiRequest } from "@/helpers/apiHandler";
import {
    GeneralPaginate,
    Product,
    ProductCreateResponse,
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

export const importProducts = async (axiosAuth: AxiosInstance, file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosAuth.post("products/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Error al importar productos:", error);
        return {};
    }
};

export const exportProducts = async (axiosAuth: AxiosInstance) => {
    try {
        const response = await axiosAuth.get("products/export", { responseType: "blob" });
        const contentType = response.headers["content-type"] ?? "text/csv";
        const disposition: string = response.headers["content-disposition"] ?? "";
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        const filename = filenameMatch ? filenameMatch[1] : "productos.csv";

        const blob = new Blob([response.data], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al exportar productos:", error);
    }
};
