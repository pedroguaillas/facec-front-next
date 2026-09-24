import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, UserLookup } from "@/types";
import { AxiosInstance } from "axios";

export const getUsersLookup = async (
    axiosAuth: AxiosInstance,
    q?: string,
): Promise<ApiResponse<UserLookup[]>> =>
    handleApiRequest<UserLookup[]>(() => axiosAuth.get("users/lookup", { params: q ? { q } : {} }));
