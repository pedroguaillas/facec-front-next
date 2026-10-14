import { AxiosInstance } from "axios";
import { handleApiRequest } from "@/helpers/apiHandler";
import { GeneralPaginate, RecurringEmitResponse, RecurringInvoice, RecurringInvoiceRun } from "@/types";

export const getRecurringInvoices = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
) => handleApiRequest<GeneralPaginate<RecurringInvoice>>(() => axiosAuth.get(pageUrl));

export const getRecurringInvoice = async (
    axiosAuth: AxiosInstance,
    id: string,
) => handleApiRequest<RecurringInvoice>(() => axiosAuth.get(`recurring-invoices/${id}`));

export const storeRecurringInvoice = async (
    axiosAuth: AxiosInstance,
    form: object,
) => handleApiRequest<RecurringInvoice>(() => axiosAuth.post('recurring-invoices', form));

export const updateRecurringInvoice = async (
    axiosAuth: AxiosInstance,
    id: string,
    form: object,
) => handleApiRequest<RecurringInvoice>(() => axiosAuth.put(`recurring-invoices/${id}`, form));

export const deleteRecurringInvoice = async (
    axiosAuth: AxiosInstance,
    id: number,
) => handleApiRequest<{ succes: boolean }>(() => axiosAuth.delete(`recurring-invoices/${id}`));

export const pauseRecurringInvoice = async (
    axiosAuth: AxiosInstance,
    id: number,
) => handleApiRequest<RecurringInvoice>(() => axiosAuth.post(`recurring-invoices/${id}/pause`));

export const resumeRecurringInvoice = async (
    axiosAuth: AxiosInstance,
    id: number,
) => handleApiRequest<RecurringInvoice>(() => axiosAuth.post(`recurring-invoices/${id}/resume`));

export const emitRecurringInvoice = async (
    axiosAuth: AxiosInstance,
    id: number,
) => handleApiRequest<RecurringEmitResponse>(() => axiosAuth.post(`recurring-invoices/${id}/emit`));

// Últimas `limit` emisiones (lista simple, sin paginar)
export const getRecurringInvoiceHistory = async (
    axiosAuth: AxiosInstance,
    id: number,
    limit: number,
) => handleApiRequest<RecurringInvoiceRun[]>(() => axiosAuth.get(`recurring-invoices/${id}/history?paginate=${limit}`));
