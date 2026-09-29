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
    opening_balance: z.union([z.string(), z.number()])
        .optional()
        .transform(val => (val === undefined || val === '') ? undefined : Number(val))
        .refine(val => val === undefined || val >= 0, { message: 'El saldo inicial debe ser mayor o igual a 0' }),
});
