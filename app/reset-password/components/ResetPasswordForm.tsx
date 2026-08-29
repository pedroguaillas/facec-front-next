"use client";

import { PrimaryButton, TextInput } from "@/components";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPasswordSchema } from "@/schemas/password.schema";
import { resetPassword } from "@/services/passwordServices";
import { useFormSubmit } from "@/lib/hooks/useFormSubmit";
import { ResetPasswordPayload } from "@/types";

export const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const user = searchParams.get("user") ?? "";
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const { handleSubmit, isPending } = useFormSubmit<ResetPasswordPayload>({
        schema: resetPasswordSchema,
        data: { user, token, password, password_confirmation: passwordConfirmation },
        setErrors,
        onSubmit: (form) => resetPassword(form),
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => router.push("/login"), 2500);
        },
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    if (!user || !token || errors.token) {
        return (
            <>
                <div className="bg-gradient-to-r from-sky-300 to-sky-900 bg-clip-text text-transparent font-semibold text-4xl text-center">
                    facec
                </div>
                <p className="text-red-500 my-4 text-sm text-center">
                    El enlace es inválido o ha expirado.
                </p>
                <Link href="/forgot-password" className="block text-center text-sm text-primary hover:underline">
                    Solicitar nuevo enlace
                </Link>
            </>
        );
    }

    if (success) {
        return (
            <>
                <div className="bg-gradient-to-r from-sky-300 to-sky-900 bg-clip-text text-transparent font-semibold text-4xl text-center">
                    facec
                </div>
                <p className="text-slate-600 dark:text-slate-400 my-4 text-sm text-center">
                    Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.
                </p>
                <Link href="/login" className="block text-center text-sm text-primary hover:underline">
                    Ir a iniciar sesión
                </Link>
            </>
        );
    }

    return (
        <>
            <div className="bg-gradient-to-r from-sky-300 to-sky-900 bg-clip-text text-transparent font-semibold text-4xl text-center">
                facec
            </div>
            <p className="text-slate-700 my-4">Restablecer contraseña</p>
            <form onSubmit={onSubmit} className="[&>div>label]:text-slate-500 [&>div>label]:dark:text-slate-600 [&>div>input]:text-slate-500 [&>div>input]:dark:text-slate-600">
                <TextInput
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Nueva contraseña"
                    name="password"
                    error={errors.password}
                />
                <TextInput
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    label="Confirmar contraseña"
                    name="password_confirmation"
                    error={errors.password_confirmation}
                />
                <div className="mt-6">
                    <PrimaryButton
                        label="Restablecer contraseña"
                        type="submit"
                        isLoading={isPending}
                        action="login"
                    />
                </div>
            </form>
        </>
    );
};
