import { handleApiRequest } from "@/helpers/apiHandler";
import { Company } from "@/types";
import { AxiosInstance } from "axios";

export const getCompany = async (
    axiosAuth: AxiosInstance,
) => handleApiRequest<Company>(() => axiosAuth.get('companies'));

// PHP no parsea multipart en PUT (el body llegaría vacío): se envía POST con _method=PUT
// (method spoofing de Laravel) para poder subir logo / firma
export const updateCompany = async (
    axiosAuth: AxiosInstance,
    form: FormData,
) => {
    form.set('_method', 'PUT');
    return handleApiRequest<Company>(() => axiosAuth.post(`companies`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }));
};

interface DownloadSignResponse { cert: string }

export const downloadSignService = async (
    axiosAuth: AxiosInstance,
) => handleApiRequest<DownloadSignResponse>(() => axiosAuth.get('companies/download-cert'));
