import { z } from 'zod';

export const forgotPasswordSchema = z.object({
    user: z.string().min(4, 'El usuario debe tener al menos 4 caracteres'),
});

export const resetPasswordSchema = z.object({
    user: z.string().min(1, 'El usuario es requerido'),
    token: z.string().min(1, 'El token es requerido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Las contraseñas no coinciden',
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1, 'La contraseña actual es requerida'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Las contraseñas no coinciden',
});
