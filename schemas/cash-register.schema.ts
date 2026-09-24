import { z } from 'zod';

export const cashRegisterSchema = z.object({
    name: z.string()
        .min(3, 'Nombre de la caja requerido')
        .max(150, 'Máximo 150 caracteres'),
    responsible_id: z
        .union([z.string().min(1, 'Seleccione un responsable'), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'Seleccione un responsable' }),
    type: z.enum(['GENERAL', 'CHICA', 'OTRO']),
});

const amountField = (message: string) => z
    .union([
        z.string().refine(val => val.trim() !== '', { message }),
        z.number()
    ])
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: 'El monto debe ser mayor o igual a 0' });

export const denominationCountSchema = z.object({
    denomination_id: z.number(),
    quantity: z
        .union([z.string(), z.number()])
        .transform(val => Number(val))
        .refine(val => Number.isInteger(val) && val >= 0, { message: 'Cantidad inválida' }),
});

export const openCashRegisterSchema = z.object({
    initial_balance: amountField('Saldo inicial requerido'),
    denominations: z.array(denominationCountSchema).optional(),
});

export const closeCashRegisterSchema = z.object({
    denominations: z.array(denominationCountSchema).optional(),
});
