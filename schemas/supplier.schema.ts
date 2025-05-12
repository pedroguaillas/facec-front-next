import { z } from "zod";

export const supplierSchema = z.object({
    type_identification: z.enum(['cédula', 'ruc', 'otro']),
    identication: z.string().regex(/^\d+$/, 'La identificación debe contener solo números'),
    name: z.string().min(3, "Nombre del cliente requerido").max(300, "Máximo 300 caracteres"),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
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