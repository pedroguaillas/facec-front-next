export interface LaravelValidationErrors {
    [key: string]: string;
}

export interface LaravelErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

// Respuesta genérica de API
export interface ApiResponse<T> {
    error?: string
    data?: T
    errors?: LaravelValidationErrors
}