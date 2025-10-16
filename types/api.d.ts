// Respuesta genérica de API
export interface ApiResponse<T> {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string>
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface ApiError<T = Partial<Record<keyof T, string>>> {
    message?: string;
    errors?: ValidationErrors<T>;
    status?: number;
}