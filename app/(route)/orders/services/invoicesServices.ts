import { AxiosInstance } from "axios";

export const getInvoices = async (
    axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
    pageUrl: string,
    search?: string,
) => {
    try {
        const fullUrl = new URL(pageUrl, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.post(fullUrl, { search });
        return response.data;
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        return [];
    }
};

export const storeLotServices = async (
    axiosAuth: AxiosInstance,
    formData: FormData
) => {
    try {
        const res = await axiosAuth.post('orders/lot', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log(res);
    } catch (err) {
        console.error(err);
    }
}