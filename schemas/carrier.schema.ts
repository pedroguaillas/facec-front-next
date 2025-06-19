import { z } from 'zod';
import { emptyStringToNull } from './general.schema';

export const carrierSchema = z.object({
    type_identification: z.enum(['cédula', 'ruc', 'otro']),
    identication: z
        .string()
        .regex(/^\d+$/, 'La identificación debe contener solo números'), // solo dígitos
    name: z
        .string().min(3, "Nombre del transportista requerido")
        .max(300, "Máximo 300 caracteres"),
    address: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    license_plate: z
        .string()
        .min(7, "Placa vehicular requerido"),
    email: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
}).superRefine((data, ctx) => {
    if (data.type_identification === 'cédula' && data.identication.length !== 10) {
        ctx.addIssue({
            path: ['identication'],
            message: 'La cédula debe tener exactamente 10 dígitos',
            code: z.ZodIssueCode.custom,
        });
    }

    if (data.type_identification === 'ruc' && data.identication.length !== 13) {
        ctx.addIssue({
            path: ['identication'],
            message: 'El RUC debe tener exactamente 13 dígitos',
            code: z.ZodIssueCode.custom,
        });
    }
});
