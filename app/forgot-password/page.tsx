"use client";

import { PrimaryButton, TextInput } from "@/components";
import { parseZodErrors } from "@/helpers/zodHelper";
import Link from "next/link";
import { useState } from "react";
import { forgotPasswordSchema } from "@/schemas/password.schema";
import { forgotPassword } from "@/services/passwordServices";

export default function ForgotPasswordPage() {
    const [user, setUser] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPending, setIsPending] = useState(false);
    const [networkError, setNetworkError] = useState<string>();
    const [result, setResult] = useState<{ message: string; email?: string }>();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setNetworkError(undefined);

        const parsed = forgotPasswordSchema.safeParse({ user });
        if (!parsed.success) {
            setErrors(parseZodErrors(parsed.error));
            return;
        }

        setIsPending(true);
        const res = await forgotPassword(parsed.data);
        setIsPending(false);

        if (res.errors) {
            setErrors(res.errors);
            return;
        }

        if (res.error) {
            setNetworkError(res.error);
            return;
        }

        setResult({ message: res.data?.message ?? "", email: res.data?.email });
    };

    if (result) {
        return (
            <>
                <div className="bg-gradient-to-r from-sky-300 to-sky-900 bg-clip-text text-transparent font-semibold text-4xl text-center">
                    facec
                </div>
                <p className="text-slate-600 dark:text-slate-400 my-4 text-sm text-center">
                    {result.message}
                </p>
                {result.email && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm text-center">
                        Revisa tu correo <span className="font-medium">{result.email}</span>
                    </p>
                )}
                <Link href="/login" className="block mt-4 text-center text-sm text-primary hover:underline">
                    Volver a iniciar sesión
                </Link>
            </>
        );
    }

    return (
        <>
            <div className="bg-gradient-to-r from-sky-300 to-sky-900 bg-clip-text text-transparent font-semibold text-4xl text-center">
                facec
            </div>
            <p className="text-slate-700 my-4">Olvidé mi contraseña</p>
            <form onSubmit={onSubmit} className="[&>div>label]:text-slate-500 [&>div>label]:dark:text-slate-600 [&>div>input]:text-slate-500 [&>div>input]:dark:text-slate-600">
                <TextInput
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    label="Usuario"
                    name="user"
                    error={errors.user}
                />
                {networkError && <p className="text-red-500 text-sm">{networkError}</p>}
                <div className="mt-6">
                    <PrimaryButton
                        label="Enviar instrucciones"
                        type="submit"
                        isLoading={isPending}
                        action="login"
                    />
                </div>
            </form>
            <Link href="/login" className="block mt-4 text-center text-sm text-primary hover:underline">
                Volver a iniciar sesión
            </Link>
        </>
    );
}
