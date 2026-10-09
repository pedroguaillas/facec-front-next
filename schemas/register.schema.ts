import { z } from 'zod';

export const registerSchema = z.object({
    ruc: z.string().regex(/^\d{13}$/, 'El RUC debe tener 13 dígitos'),
    address: z.string().trim().min(3, 'La dirección es requerida').max(300, 'Máximo 300 caracteres'),
    phone: z.string().trim().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
    user: z.string().trim()
        .min(4, 'Mínimo 4 caracteres')
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-z0-9_-]+$/, 'Solo letras, números, guion y guion bajo'),
    email: z.string().trim().email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Las contraseñas no coinciden',
});

export type RegisterPayload = z.infer<typeof registerSchema>;
