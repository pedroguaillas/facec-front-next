import { handleApiRequest } from "@/helpers/apiHandler";
import { Company } from "@/types";
import { AxiosInstance } from "axios";

export const getCompany = async (
    axiosAuth: AxiosInstance,
) => handleApiRequest<Company>(() => axiosAuth.get('companies'));

export const updateCompany = async (
    axiosAuth: AxiosInstance,
    form: FormData,
) => handleApiRequest<Company>(() => axiosAuth.put(`companies`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
}));

interface DownloadSignResponse { cert: string }

export const downloadSignService = async (
    axiosAuth: AxiosInstance,
) => handleApiRequest<DownloadSignResponse>(() => axiosAuth.get('companies/download-cert'));
