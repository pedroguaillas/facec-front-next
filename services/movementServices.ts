import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse, GeneralPaginate, Movement, MovementCategory, MovementCategoryInfo, MovementSourceType, MovementStatus, MovementSummary } from "@/types";
import { AxiosInstance } from "axios";

interface MovementFilters {
    source_type?: MovementSourceType;
    source_id?: number;
    party_type?: MovementSourceType;
    party_id?: number;
    status?: MovementStatus;
    per_page?: number;
    paginate?: number;
    page?: number;
    date_from?: string;
    date_to?: string;
    direction?: 'in' | 'out';
    category?: MovementCategory | 'SIN_CLASIFICAR';
    transaction_type?: string;
}

interface SummaryFilters {
    date_from?: string;
    date_to?: string;
    party_type?: MovementSourceType;
    party_id?: number;
}

export const getMovements = async (
    axiosAuth: AxiosInstance,
    filters: MovementFilters,
): Promise<ApiResponse<GeneralPaginate<Movement>>> =>
    handleApiRequest<GeneralPaginate<Movement>>(() => axiosAuth.get("movements", { params: filters }));

export const getMovement = async (
    axiosAuth: AxiosInstance,
    id: number,
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.get(`movements/${id}`));

export const getMovementsSummary = async (
    axiosAuth: AxiosInstance,
    filters: SummaryFilters,
): Promise<ApiResponse<MovementSummary>> =>
    handleApiRequest<MovementSummary>(() => axiosAuth.get("movements/summary", { params: filters }));

export const getMovementCategories = async (
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<MovementCategoryInfo[]>> =>
    handleApiRequest<MovementCategoryInfo[]>(() => axiosAuth.get("movements/categories"));

// Clasificar un movimiento "Otro" (null quita la categoría)
export const updateMovementCategory = async (
    axiosAuth: AxiosInstance,
    id: number,
    category: MovementCategory | null,
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.patch(`movements/${id}/category`, { category }));

const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

export const storeDeposit = async (
    axiosAuth: AxiosInstance,
    data: FormData,
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.post("movements/deposit", data, multipartConfig));

export const storeWithdraw = async (
    axiosAuth: AxiosInstance,
    data: FormData,
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.post("movements/withdraw", data, multipartConfig));

export const storeTransfer = async (
    axiosAuth: AxiosInstance,
    data: FormData,
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.post("movements/transfer", data, multipartConfig));

export const storeOtherMovement = async (
    axiosAuth: AxiosInstance,
    data: FormData,
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.post("movements/other", data, multipartConfig));

export const completeMovement = async (
    id: number,
    axiosAuth: AxiosInstance,
): Promise<ApiResponse<Movement>> =>
    handleApiRequest<Movement>(() => axiosAuth.post(`movements/${id}/complete`));
