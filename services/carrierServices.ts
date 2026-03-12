import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, CarrierProps, GeneralPaginate } from "@/types";
import { AxiosInstance } from "axios";

export const getCarriers = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<CarrierProps>>> =>
    handleApiRequest<GeneralPaginate<CarrierProps>>(() => axiosAuth.get(pageUrl));