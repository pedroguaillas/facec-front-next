import { handleApiRequest } from "@/helpers/apiHandler";
import { Product, ProductCreateResponse, ProductCsv, ProductEditResponse } from "@/types";
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
) => handleApiRequest<ProductCreateResponse>(() => axiosAuth.get('product/create'));

export const productStoreService = async (
  axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
  form: object
) => handleApiRequest<Product>(() => axiosAuth.post('product', form));

export const getEditProduct = async (
  id: string,
  axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
) => handleApiRequest<ProductEditResponse>(() =>axiosAuth.get('product/' + id));

export const productUpdateService = async (
  id: number,
  axiosAuth: AxiosInstance, // ✅ Recibe axiosAuth como argumento
  form: object
) => handleApiRequest<Product>(() => axiosAuth.put(`product/${id}`, form));

export const importProductsServices = async (
  axiosAuth: AxiosInstance,
  products: ProductCsv[],
) => {
  try {
    const response = await axiosAuth.post('products/import', { products });
    return response.data;
  } catch (error) {
    console.error("Error al importar productos:", error);
    return {};
  }
};

export const deleteProduct = async (
  id: number,
  axiosAuth: AxiosInstance,
) => {
  try {
    const response = await axiosAuth.delete('products/' + id);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return {};
  }
};