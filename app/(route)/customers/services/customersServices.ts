import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Customer, CustomerProps, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getCustomers = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<CustomerProps>>> =>
    handleApiRequest<GeneralPaginate<CustomerProps>>(() => axiosAuth.get(pageUrl));

export const getCustomer = async (
    axiosAuth: AxiosInstance,
    id: string,
): Promise<ApiResponse<Customer>> =>
    handleApiRequest<Customer>(() => axiosAuth.get(`customers/${id}`));

