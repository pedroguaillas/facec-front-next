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

        if (error.response === undefined) {
            return new Error(CodeErrors.NETWORK_ERROR);
        }

        // El unico error que capturamos es cuando no pasa la validación en el Backend
        if (error.response && error.response.status === 422) {
            const originalErrors = error.response.data ?? {};
            const flattenedErrors: LaravelValidationErrors = Object.fromEntries(
                Object.entries(originalErrors).map(([field, messages]) => [
                    field,
                    (messages as string[])[0], // ✅ conversión explícita
                ])
            );
            return { errors: flattenedErrors };
        }

        return new Error('Se produjo un error inesperado');
    }
}