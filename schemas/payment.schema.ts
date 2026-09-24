import { z } from 'zod';

export const registerPaymentSchema = z.object({
    amount: z
        .union([z.string().refine(val => val.trim() !== '', { message: 'Monto requerido' }), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'El monto debe ser mayor a 0' }),
    source_type: z.enum(['bank_account', 'cash_register_session'], {
        errorMap: () => ({ message: 'Seleccione una cuenta bancaria o caja' }),
    }),
    source_id: z
        .union([z.string().min(1, 'Seleccione una cuenta bancaria o caja'), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'Seleccione una cuenta bancaria o caja' }),
    date: z.string().optional(),
});
