import { z } from 'zod';

export const openingBalanceSchema = z.object({
    amount: z
        .union([z.string().refine(val => val.trim() !== '', { message: 'Monto requerido' }), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'El monto debe ser mayor a 0' }),
    date: z.string().optional(),
});
