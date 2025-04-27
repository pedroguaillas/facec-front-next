import { AxiosInstance } from "axios";

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