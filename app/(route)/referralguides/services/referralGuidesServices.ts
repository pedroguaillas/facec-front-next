import { AxiosInstance } from "axios";

export const getReferralGuides = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl?: string | null,
    page?: number
) => {
    // const axiosInstance = axiosAuth(); // 📌 Asegúrate de llamar a la función si `api` es un método
    const url = pageUrl || `referralguides?page=${page}`;
    try {
        const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.get(fullUrl);
        return response.data;
    } catch (error) {
        console.error("Error al obtener guias de remisión:", error);
        return [];
    }
};