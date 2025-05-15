import { AxiosInstance } from "axios";

export const getCreateInvoice = async (axiosAuth: AxiosInstance) => {
    try {
        const response = await axiosAuth.get('orders/create');
        return response.data;
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        return {};
    }
};

export const getInvoice = async (axiosAuth: AxiosInstance, id: string) => {
    try {
        const response = await axiosAuth.get(`orders/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener factura: ", error);
        return null;
    }
};

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

export const invoiceUpdateServices = async (axiosAuth: AxiosInstance, id: string, form: object) => {
    let res = '';
    try {
        await axiosAuth
            .put(`orders/${id}`, form)
            .then(() => {
                res = ('Guardo el formulario');
                // navigator('/ventas/facturas')
            });
    } catch (error) {
        res = ('Error al guardar el formulario' + error);
    }
    return res;
}