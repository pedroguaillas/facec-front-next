import { z } from 'zod';

export const companySchema = z.object({
    ruc: z
        .string()
        .regex(/^\d+$/, 'El RUC debe contener solo números'), // solo dígitos
    company: z
        .string().min(3, "La razon soical requerido")
        .max(300, "Máximo 300 caracteres"),
    user: z
        .string().min(3, "Usuairio requerido")
        .max(20, "Máximo 20 caracteres"),
    password: z
        .string().min(3, "Contraseña requerido")
        .max(50, "Máximo 50 caracteres"),
    email: z
        .string().min(3, "Correo electronico requerido")
        .max(50, "Máximo 50 caracteres"),
}).superRefine((data, ctx) => {
    if (data.ruc.length !== 13) {
        ctx.addIssue({
            path: ['identication'],
            message: 'El RUC debe tener exactamente 13 dígitos',
            code: z.ZodIssueCode.custom,
        });
    }
});
