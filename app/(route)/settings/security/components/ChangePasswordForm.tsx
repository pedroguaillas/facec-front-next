"use client";

import { PrimaryButton, TextInput } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useFormSubmit } from "@/lib/hooks/useFormSubmit";
import { changePasswordSchema } from "@/schemas/password.schema";
import { changePassword } from "@/services/passwordServices";
import { ChangePasswordPayload } from "@/types";
import { useState } from "react";

export const ChangePasswordForm = () => {
    const axiosAuth = useAxiosAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const resetForm = () => {
        setCurrentPassword("");
        setPassword("");
        setPasswordConfirmation("");
    };

    const { handleSubmit, isPending } = useFormSubmit<ChangePasswordPayload>({
        schema: changePasswordSchema,
        data: {
            current_password: currentPassword,
            password,
            password_confirmation: passwordConfirmation,
        },
        setErrors,
        onSubmit: (form) => changePassword(axiosAuth, form),
        onSuccess: () => {
            setSuccess(true);
            resetForm();
        },
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        handleSubmit();
    };

    return (
        <div className="lg:w-1/3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Cambia la contraseña de tu cuenta.
            </p>
            <form onSubmit={onSubmit}>
                <TextInput
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    label="Contraseña actual"
                    name="current_password"
                    error={errors.current_password}
                />
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
                    label="Confirmar nueva contraseña"
                    name="password_confirmation"
                    error={errors.password_confirmation}
                />
                {success && (
                    <p className="text-sm text-emerald-600 mt-2">
                        Contraseña actualizada correctamente. Se cerraron tus otras sesiones activas.
                    </p>
                )}
                <div className="flex justify-end mt-4">
                    <div className="w-40">
                        <PrimaryButton
                            label="Cambiar contraseña"
                            type="submit"
                            isLoading={isPending}
                            action="store"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};
