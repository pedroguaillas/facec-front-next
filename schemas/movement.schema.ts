import { z } from 'zod';

const amountField = z
    .union([
        z.string().refine(val => val.trim() !== '', { message: 'Monto requerido' }),
        z.number()
    ])
    .transform(val => Number(val))
    .refine(val => val > 0, { message: 'El monto debe ser mayor a 0' });

const commonMovementFields = {
    date: z.string().optional(),
    payment_method: z.enum(['EFECTIVO', 'DEPOSITO', 'TRANSFERENCIA', 'CHEQUE']).optional(),
    receipt_number: z.string().optional(),
    description: z.string().optional(),
};

export const depositSchema = z.object({
    cash_register_session_id: z.number(),
    bank_account_id: z
        .union([z.string().min(1, 'Seleccione una cuenta bancaria'), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'Seleccione una cuenta bancaria' }),
    amount: amountField,
    ...commonMovementFields,
});

export const withdrawSchema = z.object({
    bank_account_id: z
        .union([z.string().min(1, 'Seleccione una cuenta bancaria'), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'Seleccione una cuenta bancaria' }),
    cash_register_session_id: z.number(),
    amount: amountField,
    ...commonMovementFields,
});

export const transferSchema = z.object({
    origin_bank_account_id: z.number(),
    destination_bank_account_id: z
        .union([z.string().min(1, 'Seleccione la cuenta destino'), z.number()])
        .transform(val => Number(val))
        .refine(val => val > 0, { message: 'Seleccione la cuenta destino' }),
    amount: amountField,
    ...commonMovementFields,
}).refine(data => data.origin_bank_account_id !== data.destination_bank_account_id, {
    path: ['destination_bank_account_id'],
    message: 'La cuenta destino debe ser diferente a la de origen',
});

export const otherMovementSchema = z.object({
    source_type: z.enum(['bank_account', 'cash_register_session']),
    source_id: z.number(),
    type: z.enum(['INGRESO', 'EGRESO']),
    amount: amountField,
    ...commonMovementFields,
});
