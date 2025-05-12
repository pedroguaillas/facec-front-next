import { GeneralPaginate, Supplier, SupplierProps } from "@/types";
import { AxiosInstance } from "axios";

export const getSuppliers = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl?: string | null,
    search?: string,
    page?: number
): Promise<GeneralPaginate<SupplierProps> | null> => {
    const url = pageUrl || `providerlist?page=${page}`;
    try {
        const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.post(fullUrl, { search });
        return response.data;
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
        return null;
    }
};

export const getSupplier = async (
    id: string,
    axiosAuth: AxiosInstance,
): Promise<Supplier | null> => {
    try {
        const response = await axiosAuth.get(`providers/${id}/edit`);
        return response.data.provider as Supplier;
    } catch (error) {
        console.error("Error al obtener proveedor:", error);
        return null;
    }
}