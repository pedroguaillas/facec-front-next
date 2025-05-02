import { AxiosInstance } from "axios";

export const getProducts = async (
  axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
  pageUrl?: string | null,
  search?: string,
  page?: number
) => {
  // const axiosInstance = axiosAuth(); // 📌 Asegúrate de llamar a la función si `api` es un método
  const url = pageUrl || `productlist?page=${page}`;
  try {
    const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL).href;
    const response = await axiosAuth.post(fullUrl, { search });
    return response.data;
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return [];
  }
};

export const getCreateProduct = async (
  axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
) => {
  try {
    const response = await axiosAuth.get('product/create');
    return response.data;
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return {};
  }
};

export const getProduct = async (
  id: string,
  axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
) => {
  try {
    const response = await axiosAuth.get('product/' + id);
    return response.data;
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return {};
  }
};