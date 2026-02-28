import { Customer } from "@/types";
import { AxiosInstance } from "axios";

export const getCustomers = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl?: string | null,
    search?: string,
    page?: number,
) => {
    // const axiosInstance = axiosAuth(); // 📌 Asegúrate de llamar a la función si `api` es un método
    const url = pageUrl || `customers?page=${page}`;
    try {
        const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.get(fullUrl, { params: { search } });
        return response.data;
    } catch (error) {
        console.error("Error al obtener clientes: ", error);
        return [];
    }
};

export const getCustomer = async (
    id: string,
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
): Promise<Customer | null> => {
    // const axiosInstance = axiosAuth(); // 📌 Asegúrate de llamar a la función si `api` es un método
    try {
        const response = await axiosAuth.get(`customers/${id}`);
        return response.data.customer as Customer;
    } catch (error) {
        console.error("Error al obtener clientes: ", error);
        return null;
    }
};
