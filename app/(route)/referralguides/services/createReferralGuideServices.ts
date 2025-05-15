import { AxiosInstance } from "axios";

export const getCreateReferralGuide = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
) => {
    try {
        const response = await axiosAuth.get('referralguides/create');
        return response.data;
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        return null;
    }
};