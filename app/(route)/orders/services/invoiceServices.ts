import { handleApiRequest } from "@/helpers/apiHandler";
import { AditionalInformation, CustomerProps, EmisionPoint, OrderCreateProps, OrderProps, PayMethod, ProductOutput } from "@/types";
import { AxiosInstance } from "axios";

type ResInvoice = { points: EmisionPoint[], methodOfPayments: PayMethod[] }
interface ResCreateInvoice extends ResInvoice { pay_method: number, tourism: boolean, repayment: boolean };
interface ResUpdateInvoice extends ResInvoice { customers: CustomerProps[], order: OrderCreateProps, order_aditionals: AditionalInformation[], order_items: ProductOutput[] };

export const getCreateInvoice = async (
    axiosAuth: AxiosInstance
) => handleApiRequest<ResCreateInvoice>(() => axiosAuth.get('orders/create'));

export const getInvoice = async (
    axiosAuth: AxiosInstance,
    id: string
) => handleApiRequest<ResUpdateInvoice>(() => axiosAuth.get(`orders/${id}`));

export const invoiceStoreServices = async (
    axiosAuth: AxiosInstance,
    form: object
) => handleApiRequest<OrderProps>(() => axiosAuth.post('orders', form));

export const invoiceUpdateServices = async (
    axiosAuth: AxiosInstance,
    id: string,
    form: object
) => handleApiRequest<OrderProps>(() => axiosAuth.put(`orders/${id}`, form));
