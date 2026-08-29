import axios from "@/lib/axios";
import { handleApiRequest } from "@/helpers/apiHandler";
import {
    ApiResponse,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    PasswordMessageResponse,
    ResetPasswordPayload,
} from "@/types";
import { AxiosInstance } from "axios";

export const forgotPassword = async (
    data: ForgotPasswordPayload,
): Promise<ApiResponse<PasswordMessageResponse>> =>
    handleApiRequest<PasswordMessageResponse>(() => axios.post("password/forgot", data));

export const resetPassword = async (
    data: ResetPasswordPayload,
): Promise<ApiResponse<PasswordMessageResponse>> =>
    handleApiRequest<PasswordMessageResponse>(() => axios.post("password/reset", data));

export const changePassword = async (
    axiosAuth: AxiosInstance,
    data: ChangePasswordPayload,
): Promise<ApiResponse<PasswordMessageResponse>> =>
    handleApiRequest<PasswordMessageResponse>(() => axiosAuth.post("password/change", data));
