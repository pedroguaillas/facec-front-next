import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, GeneralPaginate, ProductProps } from "@/types";
import { AxiosInstance } from "axios";

export const getProducts = async (
    axiosAuth: AxiosInstance,
    pageUrl: string,
): Promise<ApiResponse<GeneralPaginate<ProductProps>>> =>
    handleApiRequest<GeneralPaginate<ProductProps>>(() => axiosAuth.get(pageUrl));
