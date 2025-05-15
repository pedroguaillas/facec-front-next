import { AxiosInstance } from "axios";

export const getReferralGuides = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl: string,
) => {
    try {
        const fullUrl = new URL(pageUrl, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.get(fullUrl);
        return response.data;
    } catch (error) {
        console.error("Error al obtener guias de remisión:", error);
        return [];
    }
};