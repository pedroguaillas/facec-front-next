import { ApiResponse, ShopCreateProps } from "@/types";
import axios, { AxiosInstance } from "axios";

export const getShops = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl: string,
    search?: string,
) => {
    try {
        const fullUrl = new URL(pageUrl, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.post(fullUrl, { search });
        return response.data;
    } catch (error) {
        console.error("Error al obtener compras:", error);
        return [];
    }
};

export const store = async (
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<ShopCreateProps>> => {
    try {
        const response = await axiosAuth.post<ApiResponse<ShopCreateProps>>(
            "shops",
            data
        );

        return response.data;
    } catch (error: unknown) {
        // ✅ Type guard para Axios
        if (axios.isAxiosError<ApiResponse<ShopCreateProps>>(error)) {
            if (error.response) {
                return error.response.data;
            }
        }

        // ✅ Respuesta por defecto si no es AxiosError
        return {
            success: false,
            message: "Error inesperado de conexión con el servidor.",
            errors: {},
        };
    }
};

export const getCreateShop = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
) => {
    try {
        const response = await axiosAuth.get('shops/create');
        return response.data;
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        return {};
    }
};

export const getShop = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    id: string,
) => {
    try {
        const response = await axiosAuth.get(`shops/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la tienda:", error);
        return {};
    }
};