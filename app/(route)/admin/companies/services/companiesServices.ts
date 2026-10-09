import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Company, CompanySubscriptions, GeneralPaginate, Subscription } from "@/types";
import { AxiosInstance } from "axios";

export const getCompanies = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<GeneralPaginate<Company> | null> => {
    try {
        const fullUrl = new URL(pageUrl, process.env.NEXT_PUBLIC_API_URL).href;
        const response = await axiosAuth.get<GeneralPaginate<Company>>(fullUrl);
        return response.data;
    } catch (error) {
        console.log("Error al obtener las companias: ", error);
        return null;
    }
}

export const storeCompany = async (axiosAuth: AxiosInstance, form: object) =>
    handleApiRequest<unknown>(() => axiosAuth.post('admin/companies', form));

export const getCompanySubscriptions = async (
    axiosAuth: AxiosInstance,
    companyId: string,
): Promise<ApiResponse<CompanySubscriptions>> =>
    handleApiRequest<CompanySubscriptions>(() => axiosAuth.get(`admin/companies/${companyId}/subscriptions`));

// Cierra la suscripción vigente y abre una nueva (renovar o cambiar plan)
export const storeCompanySubscription = async (
    axiosAuth: AxiosInstance,
    companyId: string,
    form: object,
): Promise<ApiResponse<Subscription>> =>
    handleApiRequest<Subscription>(() => axiosAuth.post(`admin/companies/${companyId}/subscription`, form));

export const getCompanyEdit = async (axiosAuth: AxiosInstance, id: string) =>
    handleApiRequest<Company>(() => axiosAuth.get(`admin/companies/${id}/edit`));

export const updateCompany = async (axiosAuth: AxiosInstance, form: object, id: string) =>
    handleApiRequest<Company>(() => axiosAuth.put(`admin/companies/${id}`, form))
