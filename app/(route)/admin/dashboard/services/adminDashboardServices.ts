import { AxiosInstance } from "axios";
import { handleApiRequest } from "@/helpers/apiHandler";
import { AdminDashboard, ApiResponse } from "@/types";

export const getAdminDashboard = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<AdminDashboard>> =>
    handleApiRequest<AdminDashboard>(() => axiosAuth.get('admin/dashboard'));
