import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, SriCompanyLookup } from "@/types";
import { AxiosInstance } from "axios";

export const findCompanyByRuc = async (
    axiosAuth: AxiosInstance,
    ruc: string
): Promise<ApiResponse<SriCompanyLookup>> =>
    handleApiRequest<SriCompanyLookup>(() => axiosAuth.get(`admin/companies/sri/${ruc}`));
