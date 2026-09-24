import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, Denomination, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getDenominations = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<GeneralPaginate<Denomination>>> =>
    handleApiRequest<GeneralPaginate<Denomination>>(() => axiosAuth.get("denominations?per_page=100"));
