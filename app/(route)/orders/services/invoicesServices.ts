import { AxiosInstance } from "axios";

export const getInvoices = async (
  axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
  pageUrl?: string | null,
  search?: string,
  page?: number
) => {
  // const axiosInstance = axiosAuth(); // 📌 Asegúrate de llamar a la función si `api` es un método
  const url = pageUrl || `orderlist?page=${page}`;
  try {
    const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL).href;
    const response = await axiosAuth.post(fullUrl, { search });
    return response.data;
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return [];
  }
};
