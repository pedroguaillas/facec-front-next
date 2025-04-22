import { AxiosInstance } from "axios";

export const invoiceStoreServices = async (axiosAuth: AxiosInstance, form: object) => {
  let res = '';
  try {
    await axiosAuth
      .post('orders', form)
      .then(() => {
        res = ('Guardo el formulario');
        // navigator('/ventas/facturas')
      });
  } catch (error) {
    res = ('Error al guardar el formulario' + error);
  }
  return res;
}