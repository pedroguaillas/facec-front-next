import { AxiosInstance } from "axios";

export const invoiceStoreServices = async (axiosAuth: AxiosInstance, form: Object) => {
  // const axiosInstance = axiosAuth(); // 📌 Asegúrate de llamar a la función si `api` es un método
  try {
    await axiosAuth
      .post('orders', form)
      .then((res) => navigator('/ventas/facturas'));
  } catch (error) {
    console.log(error);
  }
}