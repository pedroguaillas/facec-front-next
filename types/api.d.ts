export interface LaravelValidationErrors {
    [key: string]: string;
}

export interface LaravelErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    // Código de error de negocio (ej. 'subscription_expired', 'plan_required')
    error?: string;
    required_plan?: string | null;
}

// Respuesta genérica de API
export interface ApiResponse<T> {
    error?: string
    // Código de error de negocio que envía el backend (ej. 'plan_required')
    code?: string
    data?: T
    errors?: LaravelValidationErrors
}