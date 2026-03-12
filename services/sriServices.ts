import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Company } from "@/types";
import { AxiosInstance } from "axios";

export const findCompanyByRuc = async (
    axiosAuth: AxiosInstance,
    ruc: string
): Promise<ApiResponse<Company>> =>
    handleApiRequest<Company>(() => axiosAuth.get(`admin/companies/sri/${ruc}`));
