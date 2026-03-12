"use client";

import { useState } from "react";
import { ZodSchema } from "zod";
import { parseZodErrors } from "@/helpers/zodHelper";
import { ApiResponse } from "@/types";

interface UseFormSubmitOptions<T extends object> {
    schema: ZodSchema<T>;
    data: T;
    setErrors: (errors: Record<string, string>) => void;
    onSubmit: (form: T) => Promise<ApiResponse<unknown>>;
    onSuccess: () => void;
}

export const useFormSubmit = <T extends object>({
    schema,
    data,
    setErrors,
    onSubmit,
    onSuccess,
}: UseFormSubmitOptions<T>) => {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<string | undefined>();

    const handleSubmit = async () => {
        setMessage(undefined);

        const parsed = schema.safeParse(data);
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsPending(true);
        const res = await onSubmit(parsed.data);
        setIsPending(false);

        if (res.errors) {
            setErrors(res.errors);
            return;
        }

        if (res.error) {
            setMessage(res.error);
            return;
        }

        onSuccess();
    };

    return { handleSubmit, isPending, message };
};
