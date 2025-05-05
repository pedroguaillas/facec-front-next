import { Carrier } from "@/types";
import { AxiosInstance } from "axios";

export const getCarriers = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl?: string | null,
    search?: string,
    page?: number
) => {
    // const axiosInstance = axiosAuth(); // 📌 Asegúrate de llamar a la función si `api` es un método
    const url = pageUrl || `carrierlist?page=${page}`;
    try {
        const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.post(fullUrl, { search });
        return response.data;
    } catch (error) {
        console.error("Error al obtener transportistas:", error);
        return [];
    }
};

export const getCarrier = async (
    id: string,
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
): Promise<Carrier | null> => {
    try {
        const response = await axiosAuth.get(`carriers/${id}/edit`);
        return response.data.carrier as Carrier;
    } catch (error) {
        console.error("Error al obtener transportista: ", error);
        return null;
    }
};