import axios from "@/lib/axios";
import { handleApiRequest } from "@/helpers/apiHandler";
import { ApiResponse } from "@/types";
import { RegisterPayload } from "@/schemas/register.schema";

interface RegisterResponse { succes: boolean; message: string; email: string }
interface MessageResponse { message: string }

// Registro público (prueba gratis): no devuelve token, hay que confirmar el correo
export const registerCompany = async (data: RegisterPayload): Promise<ApiResponse<RegisterResponse>> =>
    handleApiRequest<RegisterResponse>(() => axios.post("register", data));

// Reenvía el correo de confirmación (respuesta genérica, no revela si el usuario existe)
export const resendVerificationEmail = async (user: string): Promise<ApiResponse<MessageResponse>> =>
    handleApiRequest<MessageResponse>(() => axios.post("email/resend", { user }));

interface SriLookupResponse { ruc: string; company: string }

// Razón social del SRI para mostrar antes de registrar (público, solo devuelve el nombre)
export const lookupRegisterRuc = async (ruc: string): Promise<ApiResponse<SriLookupResponse>> =>
    handleApiRequest<SriLookupResponse>(() => axios.get(`register/sri/${ruc}`));
