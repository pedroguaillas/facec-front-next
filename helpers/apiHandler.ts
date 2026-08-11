import { CodeErrors } from "@/constants/codeErrors";
import { ApiResponse, LaravelErrorResponse, LaravelValidationErrors } from "@/types";
import { AxiosError } from "axios";

export async function handleApiRequest<T>(
    callback: () => Promise<{ data: T }>
): Promise<ApiResponse<T>> {
    try {
        const response = await callback();
        return { data: response.data };
    } catch (err) {
        const error = err as AxiosError<LaravelErrorResponse>;

        // TODO: este error debe ir en Interceptor de axios
        if (error.response === undefined) {
            return { error: CodeErrors.NETWORK_ERROR_MESSAGE };
        }

        // TODO: estos errores especificos pueden estar aqui
        //   401 → sesión expirada (¿redirigir al login?)
        //   403 → sin permisos
        //   404 → recurso no encontrado
        //   500 → error del servidor

        // El unico error que capturamos es cuando no pasa la validación en el Backend
        if (error.response && error.response.status === 422) {
            const originalErrors = error.response.data?.errors ?? {};
            const flattenedErrors: LaravelValidationErrors = Object.fromEntries(
                Object.entries(originalErrors).map(([field, messages]) => [
                    field,
                    (messages as string[])[0], // ✅ conversión explícita
                ])
            );
            return { errors: flattenedErrors };
        }

        return { error: 'Se produjo un error inesperado' };
    }
}