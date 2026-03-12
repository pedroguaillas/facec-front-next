import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, GeneralPaginate, OrderProps } from "@/types";
import { AxiosInstance } from "axios";

export const getInvoices = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<OrderProps>>> =>
    handleApiRequest<GeneralPaginate<OrderProps>>(() => axiosAuth.get(pageUrl));

export const storeLotServices = async (
    axiosAuth: AxiosInstance,
    formData: FormData
) => handleApiRequest<unknown>(() => axiosAuth.post("orders/lot", formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
}));
