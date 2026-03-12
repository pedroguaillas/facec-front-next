import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Customer } from "@/types";
import { AxiosInstance } from "axios";

export const findCustomerByIdentification = async (
    axiosAuth: AxiosInstance,
    identication: string,
): Promise<ApiResponse<Customer>> =>
    handleApiRequest<Customer>(() => axiosAuth.get(`customers/resolve/${identication}`))

export const storeCustomer = async (
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<Customer>> =>
    handleApiRequest<Customer>(() => axiosAuth.post("customers", data));


export const updateCustomer = async (
    id: string,
    axiosAuth: AxiosInstance,
    data: object
): Promise<ApiResponse<Customer>> =>
    handleApiRequest<Customer>(() => axiosAuth.put("customers/" + id, data));
