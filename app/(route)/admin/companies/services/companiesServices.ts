import { Company, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios"

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

export const storeCompany = async (axiosAuth: AxiosInstance, form: object) => {
    try {
        const response = await axiosAuth.post('admin/companies', form);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}
