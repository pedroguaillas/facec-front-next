import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, OverdueSummary } from "@/types";
import { AxiosInstance } from "axios";

export const getCustomersOverdue = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<OverdueSummary>> =>
    handleApiRequest<OverdueSummary>(() => axiosAuth.get("customers/overdue"));

export const getProvidersOverdue = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<OverdueSummary>> =>
    handleApiRequest<OverdueSummary>(() => axiosAuth.get("providers/overdue"));
