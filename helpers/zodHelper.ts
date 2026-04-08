import { ZodError } from "zod";

export function parseZodErrors(error: ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};
    error.errors.forEach((err) => {
        formatted[err.path[0] as string] = err.message;
    });
    console.log(formatted);
    return formatted;
}
