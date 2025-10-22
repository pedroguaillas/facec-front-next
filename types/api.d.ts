export interface LaravelValidationErrors {
    [key: string]: string;
}

export interface LaravelErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

// Respuesta genérica de API
export interface ApiResponse<T> {
    message?: string
    data?: T
    errors?: LaravelValidationErrors
}