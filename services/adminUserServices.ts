import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, CheckAvailabilityResponse } from "@/types";
import { AxiosInstance } from "axios";

export const checkUserAvailability = async (
    axiosAuth: AxiosInstance,
    params: { user?: string; email?: string }
): Promise<ApiResponse<CheckAvailabilityResponse>> =>
    handleApiRequest<CheckAvailabilityResponse>(() =>
        axiosAuth.get("admin/users/check-availability", { params })
    );
