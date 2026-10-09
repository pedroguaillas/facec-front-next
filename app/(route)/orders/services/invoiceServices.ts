import { handleApiRequest } from "@/helpers/apiHandler";
import { AccountLedgerEntry, AditionalInformation, Customer, EmisionPoint, Holiday, OrderCreateProps, PayMethod, ProductOutput, VoucherType } from "@/types";
import { AxiosInstance } from "axios";

// holidays: feriados desde hace 1 mes en adelante (vacío si la empresa no tiene base8)
type ResInvoice = { points: EmisionPoint[], methodOfPayments: PayMethod[], voucherTypes: VoucherType[], holidays?: Holiday[] }
interface ResCreateInvoice extends ResInvoice { pay_method: number, repayment: boolean };
interface ResUpdateInvoice extends ResInvoice { customers: Customer[], order: OrderCreateProps, order_aditionals: AditionalInformation[], order_items: ProductOutput[] };

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
) => handleApiRequest<OrderCreateProps>(() => axiosAuth.post('orders', form));

export const invoiceUpdateServices = async (
    axiosAuth: AxiosInstance,
    id: string,
    form: object
) => handleApiRequest<OrderCreateProps>(() => axiosAuth.put(`orders/${id}`, form));

export const registerOrderPayment = async (
    axiosAuth: AxiosInstance,
    id: number,
    data: object
) => handleApiRequest<AccountLedgerEntry>(() => axiosAuth.post(`orders/${id}/payments`, data));
