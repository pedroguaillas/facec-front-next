import { z } from 'zod';

export const bankAccountSchema = z.object({
    bank_id: z
        .union([z.string().min(1, 'Seleccione un banco'), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'Seleccione un banco' }),
    account_number: z.string()
        .min(1, 'Número de cuenta requerido')
        .max(30, 'Máximo 30 caracteres'),
    type: z.enum(['AHORRO', 'CORRIENTE']),
});
